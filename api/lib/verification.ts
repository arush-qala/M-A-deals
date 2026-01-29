// Multi-source verification framework

import type { ParsedDeal } from './parser.js';
import type { VerificationStatus } from '../../types.js';
import { verifyDeal as perplexityVerify } from './sources/perplexity.js';

export interface VerificationResult {
  confidenceScore: number;
  verificationStatus: VerificationStatus;
  enrichedData?: Partial<ParsedDeal>;
  sources: string[];
}

// Confidence scoring factors
const SCORING = {
  SEC_FILING: 40,           // Official SEC filing found
  MULTIPLE_SOURCES: 10,     // Per additional source (max 30)
  COMPANY_MATCH: 15,        // Company names match exactly
  VALUE_CONFIRMED: 10,      // Deal value confirmed across sources
  DATE_CONSISTENT: 5,       // Dates are consistent
  MAX_SOURCE_BONUS: 30      // Cap for multiple sources bonus
};

// Thresholds for verification status
const THRESHOLDS = {
  VERIFIED: 70,
  PENDING: 40
};

// Calculate confidence score for a deal
export function calculateConfidenceScore(deal: ParsedDeal): number {
  let score = 0;

  // Check for SEC filing source
  const hasSecSource = deal.sources.some(s =>
    s.type === 'sec_edgar' || s.url.includes('sec.gov')
  );
  if (hasSecSource) {
    score += SCORING.SEC_FILING;
  }

  // Multiple sources bonus
  const uniquePublications = new Set(deal.sources.map(s => s.publication));
  const sourceBonus = Math.min(
    (uniquePublications.size - 1) * SCORING.MULTIPLE_SOURCES,
    SCORING.MAX_SOURCE_BONUS
  );
  score += sourceBonus;

  // Company name quality (penalize if "Unknown")
  if (deal.acquirer && !deal.acquirer.toLowerCase().includes('unknown')) {
    score += SCORING.COMPANY_MATCH / 2;
  }
  if (deal.target && !deal.target.toLowerCase().includes('unknown')) {
    score += SCORING.COMPANY_MATCH / 2;
  }

  // Value confirmed
  if (deal.value_usd && deal.value_usd > 0) {
    score += SCORING.VALUE_CONFIRMED;
  }

  // Date present
  if (deal.announced_date) {
    score += SCORING.DATE_CONSISTENT;
  }

  return Math.min(score, 100);
}

// Determine verification status from score
export function getVerificationStatus(score: number): VerificationStatus {
  if (score >= THRESHOLDS.VERIFIED) {
    return 'verified';
  }
  if (score >= THRESHOLDS.PENDING) {
    return 'pending';
  }
  return 'unverified';
}

// Verify a single deal
export async function verifyDealWithSources(
  deal: ParsedDeal,
  usePerplexity: boolean = true
): Promise<VerificationResult> {
  let confidenceScore = calculateConfidenceScore(deal);
  let enrichedData: Partial<ParsedDeal> = {};
  let additionalSources: string[] = [];

  // If confidence is low and we can use Perplexity, try to verify
  if (confidenceScore < THRESHOLDS.VERIFIED && usePerplexity) {
    try {
      const perplexityResult = await perplexityVerify(
        deal.acquirer,
        deal.target,
        deal.announced_date
      );

      if (perplexityResult.verified) {
        // Boost confidence for Perplexity verification
        confidenceScore += 20;

        // Enrich with Perplexity data
        if (perplexityResult.details) {
          enrichedData = {
            value_usd: perplexityResult.details.value_usd || deal.value_usd,
            status: perplexityResult.details.status as any || deal.status,
            announced_date: perplexityResult.details.announced_date || deal.announced_date,
            synopsis: perplexityResult.details.synopsis || deal.synopsis
          };
        }

        additionalSources = perplexityResult.sources;
      }
    } catch (error) {
      console.error('Perplexity verification failed:', error);
    }
  }

  const finalScore = Math.min(confidenceScore, 100);

  return {
    confidenceScore: finalScore,
    verificationStatus: getVerificationStatus(finalScore),
    enrichedData,
    sources: additionalSources
  };
}

// Batch verify multiple deals
export async function verifyDeals(
  deals: ParsedDeal[],
  options: {
    usePerplexity?: boolean;
    perplexityBudget?: number; // Max Perplexity calls
  } = {}
): Promise<Array<ParsedDeal & VerificationResult>> {
  const { usePerplexity = true, perplexityBudget = 10 } = options;

  let perplexityCalls = 0;
  const results: Array<ParsedDeal & VerificationResult> = [];

  for (const deal of deals) {
    const initialScore = calculateConfidenceScore(deal);

    // Only use Perplexity for low-confidence deals within budget
    const shouldUsePerplexity =
      usePerplexity &&
      perplexityCalls < perplexityBudget &&
      initialScore < THRESHOLDS.VERIFIED;

    if (shouldUsePerplexity) {
      perplexityCalls++;
    }

    const verification = await verifyDealWithSources(deal, shouldUsePerplexity);

    results.push({
      ...deal,
      ...verification.enrichedData,
      confidenceScore: verification.confidenceScore,
      verificationStatus: verification.verificationStatus,
      sources: [
        ...deal.sources,
        ...verification.sources.map(url => ({
          url,
          publication: 'Perplexity',
          type: 'perplexity'
        }))
      ]
    });

    // Small delay between Perplexity calls
    if (shouldUsePerplexity) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

// Filter deals by verification status
export function filterByVerificationStatus(
  deals: Array<ParsedDeal & VerificationResult>,
  status: VerificationStatus | 'all' = 'all'
): Array<ParsedDeal & VerificationResult> {
  if (status === 'all') {
    return deals;
  }
  return deals.filter(d => d.verificationStatus === status);
}

// Get verification summary
export function getVerificationSummary(
  deals: Array<ParsedDeal & VerificationResult>
): { verified: number; pending: number; unverified: number; avgScore: number } {
  const summary = {
    verified: 0,
    pending: 0,
    unverified: 0,
    avgScore: 0
  };

  if (deals.length === 0) {
    return summary;
  }

  let totalScore = 0;

  for (const deal of deals) {
    totalScore += deal.confidenceScore;
    switch (deal.verificationStatus) {
      case 'verified':
        summary.verified++;
        break;
      case 'pending':
        summary.pending++;
        break;
      default:
        summary.unverified++;
    }
  }

  summary.avgScore = Math.round(totalScore / deals.length);

  return summary;
}
