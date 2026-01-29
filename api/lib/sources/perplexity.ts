// Perplexity API - For global deal discovery and verification
// Documentation: https://docs.perplexity.ai/

export interface PerplexityDeal {
  acquirer: string;
  target: string;
  value_usd: number;
  status: string;
  announced_date: string;
  sector: string;
  geography: string;
  synopsis: string;
  sources: Array<{ url: string; publication: string }>;
}

export interface PerplexityResponse {
  deals: PerplexityDeal[];
  citations: string[];
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Query Perplexity for M&A deals in a specific region
export async function searchDealsInRegion(
  region: string,
  daysBack: number = 30
): Promise<PerplexityResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('Perplexity API key not configured');
    return { deals: [], citations: [] };
  }

  const dateRange = `last ${daysBack} days`;

  const prompt = `Find M&A (mergers and acquisitions) deals announced in ${region} in the ${dateRange}.

Requirements:
- Only include deals with enterprise value over $500 million USD
- Include announced, pending, completed, and rumored deals

For each deal, provide:
1. Acquirer company name
2. Target company name
3. Deal value in USD
4. Status (Announced, Pending, Completed, Rumored)
5. Announcement date (YYYY-MM-DD format)
6. Sector (Technology, Healthcare, Financial Services, Energy, etc.)
7. A brief synopsis (1-2 sentences)

Return the data as a JSON array with this structure:
{
  "deals": [
    {
      "acquirer": "Company A",
      "target": "Company B",
      "value_usd": 5000000000,
      "status": "Announced",
      "announced_date": "2025-01-15",
      "sector": "Technology",
      "geography": "${region}",
      "synopsis": "Company A announced acquisition of Company B..."
    }
  ]
}

Only return valid JSON. Do not include any markdown or explanation.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an M&A research assistant. Return only valid JSON without markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      return { deals: [], citations: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Parse the JSON from the response
    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
      }

      const parsed = JSON.parse(jsonStr);
      const deals = (parsed.deals || []).map((deal: any) => ({
        ...deal,
        geography: deal.geography || region,
        sources: citations.map((url: string) => ({
          url,
          publication: extractPublicationName(url)
        }))
      }));

      return { deals, citations };
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', parseError);
      console.error('Raw content:', content);
      return { deals: [], citations: [] };
    }
  } catch (error) {
    console.error('Perplexity API request failed:', error);
    return { deals: [], citations: [] };
  }
}

// Extract publication name from URL
function extractPublicationName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const nameMap: Record<string, string> = {
      'reuters.com': 'Reuters',
      'bloomberg.com': 'Bloomberg',
      'ft.com': 'Financial Times',
      'wsj.com': 'Wall Street Journal',
      'sec.gov': 'SEC EDGAR',
      'cnbc.com': 'CNBC',
      'businesswire.com': 'Business Wire',
      'prnewswire.com': 'PR Newswire',
      'globenewswire.com': 'GlobeNewswire'
    };
    return nameMap[hostname] || hostname;
  } catch {
    return 'Unknown Source';
  }
}

// Verify a deal using Perplexity
export async function verifyDeal(
  acquirer: string,
  target: string,
  announcedDate: string
): Promise<{ verified: boolean; details?: Partial<PerplexityDeal>; sources: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return { verified: false, sources: [] };
  }

  const prompt = `Verify this M&A deal:
- Acquirer: ${acquirer}
- Target: ${target}
- Approximate announcement date: ${announcedDate}

Is this a real M&A deal? If yes, provide:
1. Confirmed deal value in USD
2. Current status (Announced, Pending, Completed, Withdrawn)
3. Exact announcement date
4. Any updated information

Return JSON:
{
  "verified": true/false,
  "value_usd": number or null,
  "status": "status or null",
  "announced_date": "YYYY-MM-DD or null",
  "synopsis": "brief description"
}`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an M&A verification assistant. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      return { verified: false, sources: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const parsed = JSON.parse(jsonStr);

    return {
      verified: parsed.verified === true,
      details: {
        value_usd: parsed.value_usd,
        status: parsed.status,
        announced_date: parsed.announced_date,
        synopsis: parsed.synopsis
      },
      sources: citations
    };
  } catch (error) {
    console.error('Perplexity verification failed:', error);
    return { verified: false, sources: [] };
  }
}

// Fetch global deals from multiple regions
export async function fetchGlobalDeals(daysBack: number = 30): Promise<PerplexityDeal[]> {
  const regions = [
    'United States',
    'Europe',
    'Asia Pacific'
  ];

  const allDeals: PerplexityDeal[] = [];

  for (const region of regions) {
    console.log(`Fetching deals from ${region}...`);
    const { deals } = await searchDealsInRegion(region, daysBack);
    allDeals.push(...deals);

    // Small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allDeals;
}

// Check for status updates on existing deals
export async function checkDealStatusUpdates(
  deals: Array<{ acquirer: string; target: string; current_status: string }>
): Promise<Map<string, { newStatus: string; sources: string[] }>> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const updates = new Map<string, { newStatus: string; sources: string[] }>();

  if (!apiKey || deals.length === 0) {
    return updates;
  }

  const dealList = deals
    .slice(0, 10) // Limit to 10 to conserve API credits
    .map((d, i) => `${i + 1}. ${d.acquirer} acquiring ${d.target} (current: ${d.current_status})`)
    .join('\n');

  const prompt = `Check the current status of these M&A deals:

${dealList}

For each deal, provide the current status if it has changed:
- Announced (just announced)
- Pending (regulatory review)
- Completed (deal closed)
- Withdrawn (deal cancelled)

Return JSON array:
[
  { "index": 1, "status": "Completed", "changed": true },
  { "index": 2, "status": "Pending", "changed": false }
]

Only return valid JSON.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an M&A status tracker. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      return updates;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const parsed = JSON.parse(jsonStr);

    for (const item of parsed) {
      if (item.changed && item.index > 0 && item.index <= deals.length) {
        const deal = deals[item.index - 1];
        const key = `${deal.acquirer}::${deal.target}`;
        updates.set(key, {
          newStatus: item.status,
          sources: citations
        });
      }
    }
  } catch (error) {
    console.error('Status check failed:', error);
  }

  return updates;
}
