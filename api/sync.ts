import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, isSupabaseAdminConfigured } from './lib/supabase-admin.js';
import { fetchSECDeals } from './lib/sources/sec-edgar.js';
import { fetchGlobalDeals, checkDealStatusUpdates } from './lib/sources/perplexity.js';
import { normalizeCompanyName, parseStatus, detectSector, detectGeography, generateSlug, generateTitle } from './lib/parser.js';
import { deduplicateDeals } from './lib/deduplication.js';
import { verifyDeals, getVerificationSummary } from './lib/verification.js';
import type { ParsedDeal } from './lib/parser.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST for manual sync, GET for scheduled
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isScheduled = req.query.scheduled === 'true';
  const syncType = isScheduled ? 'scheduled' : 'manual';

  // Check configuration
  if (!isSupabaseAdminConfigured) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
    });
  }

  const startTime = Date.now();
  let syncLogId: string | null = null;

  try {
    // Create sync log entry
    const { data: syncLog, error: logError } = await supabaseAdmin
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create sync log:', logError);
    } else {
      syncLogId = syncLog.id;
    }

    console.log(`Starting ${syncType} sync...`);

    // Step 1: Fetch from SEC EDGAR
    console.log('Fetching SEC EDGAR filings...');
    const secDeals = await fetchSECDeals(30);
    console.log(`Found ${secDeals.length} potential deals from SEC`);

    // Step 2: Fetch from Perplexity (global deals)
    console.log('Fetching global deals from Perplexity...');
    const perplexityDeals = await fetchGlobalDeals(30);
    console.log(`Found ${perplexityDeals.length} deals from Perplexity`);

    // Step 3: Convert to common format
    const allRawDeals: ParsedDeal[] = [
      // SEC deals
      ...secDeals.map(d => ({
        acquirer: d.acquirer,
        acquirer_normalized: normalizeCompanyName(d.acquirer),
        target: d.target,
        target_normalized: normalizeCompanyName(d.target),
        value_usd: d.value_usd,
        status: parseStatus('Announced'),
        announced_date: d.announced_date,
        sector: detectSector(d.description),
        geography: 'North America',
        synopsis: d.description,
        sources: [{
          url: d.source_url,
          publication: 'SEC EDGAR',
          type: 'sec_edgar'
        }]
      })),
      // Perplexity deals
      ...perplexityDeals.map(d => ({
        acquirer: d.acquirer,
        acquirer_normalized: normalizeCompanyName(d.acquirer),
        target: d.target,
        target_normalized: normalizeCompanyName(d.target),
        value_usd: d.value_usd,
        status: parseStatus(d.status),
        announced_date: d.announced_date,
        sector: d.sector,
        geography: d.geography,
        synopsis: d.synopsis,
        sources: d.sources.map(s => ({
          url: s.url,
          publication: s.publication,
          type: 'perplexity'
        }))
      }))
    ];

    // Step 4: Deduplicate
    console.log('Deduplicating deals...');
    const uniqueDeals = deduplicateDeals(allRawDeals);
    console.log(`${uniqueDeals.length} unique deals after deduplication`);

    // Step 5: Filter by value (>$500M)
    const filteredDeals = uniqueDeals.filter(d =>
      !d.value_usd || d.value_usd >= 500_000_000
    );
    console.log(`${filteredDeals.length} deals over $500M threshold`);

    // Step 6: Verify deals
    console.log('Verifying deals...');
    const verifiedDeals = await verifyDeals(filteredDeals, {
      usePerplexity: true,
      perplexityBudget: 5 // Conserve API credits
    });

    const verificationSummary = getVerificationSummary(verifiedDeals);
    console.log('Verification summary:', verificationSummary);

    // Step 7: Upsert to database
    console.log('Upserting deals to database...');
    let dealsAdded = 0;
    let dealsUpdated = 0;
    const errors: string[] = [];

    for (const deal of verifiedDeals) {
      try {
        // Generate slug
        const slug = generateSlug(deal.acquirer, deal.target, deal.announced_date);

        // Check if deal exists
        const { data: existing } = await supabaseAdmin
          .from('deals')
          .select('id, status')
          .eq('slug', slug)
          .single();

        if (existing) {
          // Update existing deal
          const { error: updateError } = await supabaseAdmin
            .from('deals')
            .update({
              status: deal.status,
              value_usd: deal.value_usd,
              synopsis: deal.synopsis,
              confidence_score: deal.confidenceScore,
              verification_status: deal.verificationStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            errors.push(`Failed to update ${slug}: ${updateError.message}`);
          } else {
            dealsUpdated++;

            // Track status change
            if (existing.status !== deal.status) {
              await supabaseAdmin.from('deal_status_history').insert({
                deal_id: existing.id,
                old_status: existing.status,
                new_status: deal.status,
                notes: 'Updated via sync'
              });
            }
          }
        } else {
          // Insert new deal
          const { data: newDeal, error: insertError } = await supabaseAdmin
            .from('deals')
            .insert({
              slug,
              title: generateTitle(deal.acquirer, deal.target),
              status: deal.status,
              visibility: 'public',
              announced_date: deal.announced_date,
              value_usd: deal.value_usd,
              currency: 'USD',
              synopsis: deal.synopsis,
              sector: deal.sector,
              geography: deal.geography,
              confidence_score: deal.confidenceScore,
              verification_status: deal.verificationStatus,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) {
            errors.push(`Failed to insert ${slug}: ${insertError.message}`);
          } else if (newDeal) {
            dealsAdded++;

            // Insert sources
            for (const source of deal.sources) {
              await supabaseAdmin.from('deal_sources').insert({
                deal_id: newDeal.id,
                source_type: source.type,
                source_url: source.url,
                publication_name: source.publication,
                is_primary: source.type === 'sec_edgar'
              });
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Error processing deal: ${errorMsg}`);
      }
    }

    // Step 8: Update sync log
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    if (syncLogId) {
      await supabaseAdmin
        .from('sync_logs')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
          completed_at: new Date().toISOString(),
          deals_added: dealsAdded,
          deals_updated: dealsUpdated,
          errors: errors
        })
        .eq('id', syncLogId);
    }

    // Return summary
    const result = {
      success: true,
      syncType,
      duration: `${duration.toFixed(1)}s`,
      summary: {
        sourcesChecked: {
          sec_edgar: secDeals.length,
          perplexity: perplexityDeals.length
        },
        totalFound: allRawDeals.length,
        afterDedup: uniqueDeals.length,
        afterFilter: filteredDeals.length,
        verification: verificationSummary,
        dealsAdded,
        dealsUpdated,
        errors: errors.length
      }
    };

    console.log('Sync completed:', result);
    return res.status(200).json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync failed:', error);

    // Update sync log with failure
    if (syncLogId) {
      await supabaseAdmin
        .from('sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [errorMessage]
        })
        .eq('id', syncLogId);
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
