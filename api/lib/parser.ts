// Deal text extraction and normalization utilities

import type { DealStatus } from '../../types.js';

export interface ParsedDeal {
  acquirer: string;
  acquirer_normalized: string;
  target: string;
  target_normalized: string;
  value_usd?: number;
  status: DealStatus;
  announced_date: string;
  sector?: string;
  geography?: string;
  synopsis?: string;
  rationale?: string;
  sources: Array<{ url: string; publication: string; type: string }>;
}

// Normalize company name for deduplication
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\s+(inc\.?|corp\.?|corporation|ltd\.?|limited|llc|plc|s\.?a\.?|ag|gmbh|co\.?)$/gi, '')
    // Remove "The" prefix
    .replace(/^the\s+/i, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove punctuation
    .replace(/[.,]/g, '')
    .trim();
}

// Parse status string to DealStatus type
export function parseStatus(status: string): DealStatus {
  const s = status.toLowerCase().trim();

  if (s.includes('complet') || s.includes('closed') || s.includes('finalized')) {
    return 'Completed';
  }
  if (s.includes('pending') || s.includes('review') || s.includes('regulatory')) {
    return 'Pending';
  }
  if (s.includes('withdrawn') || s.includes('cancelled') || s.includes('terminated')) {
    return 'Withdrawn';
  }
  if (s.includes('rumor') || s.includes('rumour') || s.includes('speculation')) {
    return 'Rumored';
  }

  return 'Announced';
}

// Parse value string to number
export function parseValue(valueStr: string): number | undefined {
  if (!valueStr) return undefined;

  // Remove currency symbols and whitespace
  const cleaned = valueStr.replace(/[$€£¥]/g, '').trim();

  // Match number with optional multiplier
  const match = cleaned.match(/([0-9,.]+)\s*(billion|million|trillion|b|m|t|bn|mn)?/i);

  if (!match) return undefined;

  const num = parseFloat(match[1].replace(/,/g, ''));
  const multiplier = match[2]?.toLowerCase() || '';

  if (multiplier.startsWith('t')) {
    return num * 1e12;
  }
  if (multiplier.startsWith('b')) {
    return num * 1e9;
  }
  if (multiplier.startsWith('m')) {
    return num * 1e6;
  }

  // If no multiplier and number is large enough, assume it's already in USD
  if (num > 1000000) {
    return num;
  }

  // Small number without multiplier - assume billions
  if (num < 1000) {
    return num * 1e9;
  }

  return num;
}

// Determine sector from text
export function detectSector(text: string): string {
  const textLower = text.toLowerCase();

  const sectorKeywords: Record<string, string[]> = {
    'Technology': ['software', 'tech', 'cloud', 'saas', 'ai', 'semiconductor', 'chip', 'digital'],
    'Healthcare': ['pharma', 'biotech', 'medical', 'health', 'hospital', 'drug', 'therapeutic'],
    'Financial Services': ['bank', 'fintech', 'insurance', 'asset management', 'investment', 'financial'],
    'Energy': ['oil', 'gas', 'energy', 'renewable', 'solar', 'wind', 'utility', 'power'],
    'Consumer': ['retail', 'consumer', 'food', 'beverage', 'restaurant', 'brand'],
    'Industrial': ['manufacturing', 'industrial', 'aerospace', 'defense', 'automotive'],
    'Real Estate': ['real estate', 'property', 'reit', 'commercial property'],
    'Telecommunications': ['telecom', 'wireless', '5g', 'broadband', 'network'],
    'Media & Entertainment': ['media', 'entertainment', 'streaming', 'gaming', 'studio'],
    'Mining & Metals': ['mining', 'metal', 'lithium', 'copper', 'gold', 'steel']
  };

  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return sector;
    }
  }

  return 'Diversified';
}

// Determine geography from text
export function detectGeography(text: string): string {
  const textLower = text.toLowerCase();

  const geoKeywords: Record<string, string[]> = {
    'North America': ['united states', 'usa', 'us', 'american', 'canada', 'canadian', 'mexico'],
    'Europe': ['europe', 'european', 'uk', 'british', 'germany', 'german', 'france', 'french', 'spain', 'italy'],
    'Asia Pacific': ['asia', 'asian', 'china', 'chinese', 'japan', 'japanese', 'australia', 'india', 'korea', 'singapore'],
    'Latin America': ['brazil', 'argentina', 'latin america', 'south america'],
    'Middle East': ['middle east', 'uae', 'saudi', 'israel', 'dubai'],
    'Africa': ['africa', 'south africa', 'nigeria', 'egypt']
  };

  for (const [geography, keywords] of Object.entries(geoKeywords)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return geography;
    }
  }

  return 'Global';
}

// Generate URL-safe slug from deal title
export function generateSlug(acquirer: string, target: string, date: string): string {
  const dateStr = date.slice(0, 7).replace('-', ''); // YYYYMM
  const slug = `${normalizeCompanyName(acquirer)}-${normalizeCompanyName(target)}-${dateStr}`
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 100);

  return slug;
}

// Generate deal title
export function generateTitle(acquirer: string, target: string): string {
  return `${acquirer} to Acquire ${target}`;
}
