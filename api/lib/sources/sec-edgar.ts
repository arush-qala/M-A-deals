// SEC EDGAR API - Free source for US M&A filings
// Documentation: https://www.sec.gov/search-filings/edgar-search-tools

export interface SECFiling {
  accessionNumber: string;
  cik: string;
  companyName: string;
  formType: string;
  filedAt: string;
  documentUrl: string;
  description: string;
}

export interface RawDealFromSEC {
  acquirer: string;
  target: string;
  value_usd?: number;
  announced_date: string;
  source_url: string;
  accession_number: string;
  form_type: string;
  description: string;
}

// Search SEC EDGAR for M&A-related filings
export async function searchSECFilings(daysBack: number = 30): Promise<SECFiling[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  // SEC EDGAR full-text search API
  const searchUrl = 'https://efts.sec.gov/LATEST/search-index';

  const queries = [
    'merger agreement',
    'acquisition agreement',
    'business combination',
    'tender offer'
  ];

  const allFilings: SECFiling[] = [];

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        q: `"${query}"`,
        dateRange: 'custom',
        startdt: startDateStr,
        enddt: new Date().toISOString().split('T')[0],
        forms: '8-K,S-4,DEFM14A',
        from: '0',
        size: '50'
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': 'M&A Intelligence Pro (contact@example.com)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`SEC search failed for "${query}": ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.hits?.hits) {
        for (const hit of data.hits.hits) {
          const source = hit._source;
          allFilings.push({
            accessionNumber: source.adsh || source.accession_number || '',
            cik: source.ciks?.[0] || source.cik || '',
            companyName: source.display_names?.[0] || source.company_name || '',
            formType: source.form || source.file_type || '',
            filedAt: source.file_date || source.filed_at || '',
            documentUrl: `https://www.sec.gov/Archives/edgar/data/${source.ciks?.[0]}/${source.adsh?.replace(/-/g, '')}`,
            description: source.file_description || ''
          });
        }
      }
    } catch (error) {
      console.error(`Error searching SEC for "${query}":`, error);
    }
  }

  // Deduplicate by accession number
  const uniqueFilings = Array.from(
    new Map(allFilings.map(f => [f.accessionNumber, f])).values()
  );

  return uniqueFilings;
}

// Parse SEC filing to extract deal information
export function parseFilingForDeal(filing: SECFiling, content?: string): RawDealFromSEC | null {
  // Try to extract deal information from the filing
  // This is a simplified parser - in production you'd want more sophisticated NLP

  const description = (filing.description || '').toLowerCase();
  const companyName = filing.companyName;

  // Check if this looks like an M&A announcement
  const maKeywords = ['merger', 'acquisition', 'acquire', 'tender offer', 'business combination'];
  const isMaDeal = maKeywords.some(kw => description.includes(kw));

  if (!isMaDeal) {
    return null;
  }

  // Extract value if mentioned (simplified regex)
  let valueUsd: number | undefined;
  const valueMatch = description.match(/\$([0-9,.]+)\s*(billion|million|b|m)/i);
  if (valueMatch) {
    const numStr = valueMatch[1].replace(/,/g, '');
    const multiplier = valueMatch[2].toLowerCase().startsWith('b') ? 1e9 : 1e6;
    valueUsd = parseFloat(numStr) * multiplier;
  }

  // For now, use the filing company as acquirer (needs enrichment)
  return {
    acquirer: companyName,
    target: 'Unknown Target', // Will be enriched via Perplexity
    value_usd: valueUsd,
    announced_date: filing.filedAt,
    source_url: filing.documentUrl,
    accession_number: filing.accessionNumber,
    form_type: filing.formType,
    description: filing.description
  };
}

// Main function to fetch and parse SEC M&A filings
export async function fetchSECDeals(daysBack: number = 30): Promise<RawDealFromSEC[]> {
  const filings = await searchSECFilings(daysBack);

  const deals: RawDealFromSEC[] = [];

  for (const filing of filings) {
    const deal = parseFilingForDeal(filing);
    if (deal && deal.value_usd && deal.value_usd >= 500_000_000) {
      deals.push(deal);
    }
  }

  return deals;
}
