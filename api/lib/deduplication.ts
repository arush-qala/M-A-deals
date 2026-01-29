// Deduplication logic to prevent duplicate deals

import { normalizeCompanyName } from './parser';
import type { ParsedDeal } from './parser';

export interface DedupeKey {
  acquirer: string;
  target: string;
  month: string;
  valueRange: 'small' | 'mid' | 'large' | 'mega' | 'unknown';
}

// Generate a unique key for deduplication
export function generateDedupeKey(deal: ParsedDeal): string {
  const acquirer = normalizeCompanyName(deal.acquirer);
  const target = normalizeCompanyName(deal.target);
  const month = deal.announced_date.slice(0, 7); // YYYY-MM

  let valueRange: DedupeKey['valueRange'] = 'unknown';
  if (deal.value_usd) {
    if (deal.value_usd < 1e9) valueRange = 'small';
    else if (deal.value_usd < 10e9) valueRange = 'mid';
    else if (deal.value_usd < 50e9) valueRange = 'large';
    else valueRange = 'mega';
  }

  return `${acquirer}::${target}::${month}::${valueRange}`;
}

// Calculate similarity between two company names (0-1)
export function nameSimilarity(name1: string, name2: string): number {
  const n1 = normalizeCompanyName(name1);
  const n2 = normalizeCompanyName(name2);

  if (n1 === n2) return 1;

  // Check if one contains the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  // Levenshtein distance
  const distance = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);

  if (maxLen === 0) return 1;

  return 1 - distance / maxLen;
}

// Levenshtein distance implementation
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

// Check if two deals are likely duplicates
export function areDealsLikelyDuplicates(deal1: ParsedDeal, deal2: ParsedDeal): boolean {
  // Check company name similarity
  const acquirerSim = nameSimilarity(deal1.acquirer, deal2.acquirer);
  const targetSim = nameSimilarity(deal1.target, deal2.target);

  // Both companies must match with high similarity
  if (acquirerSim < 0.7 || targetSim < 0.7) {
    return false;
  }

  // Check if announcement dates are within 30 days of each other
  const date1 = new Date(deal1.announced_date);
  const date2 = new Date(deal2.announced_date);
  const daysDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff > 30) {
    return false;
  }

  // If values are available, check they're in the same ballpark (within 20%)
  if (deal1.value_usd && deal2.value_usd) {
    const ratio = deal1.value_usd / deal2.value_usd;
    if (ratio < 0.8 || ratio > 1.2) {
      return false;
    }
  }

  return true;
}

// Deduplicate a list of deals, merging information from duplicates
export function deduplicateDeals(deals: ParsedDeal[]): ParsedDeal[] {
  const deduped: ParsedDeal[] = [];
  const seen = new Map<string, number>(); // key -> index in deduped array

  for (const deal of deals) {
    const key = generateDedupeKey(deal);

    // Check exact key match first
    if (seen.has(key)) {
      const existingIndex = seen.get(key)!;
      deduped[existingIndex] = mergeDealInfo(deduped[existingIndex], deal);
      continue;
    }

    // Check for fuzzy matches
    let foundMatch = false;
    for (let i = 0; i < deduped.length; i++) {
      if (areDealsLikelyDuplicates(deduped[i], deal)) {
        deduped[i] = mergeDealInfo(deduped[i], deal);
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      seen.set(key, deduped.length);
      deduped.push(deal);
    }
  }

  return deduped;
}

// Merge information from two deal records (prefer more complete data)
function mergeDealInfo(existing: ParsedDeal, incoming: ParsedDeal): ParsedDeal {
  return {
    ...existing,
    // Prefer non-empty values
    acquirer: existing.acquirer || incoming.acquirer,
    target: existing.target || incoming.target,
    acquirer_normalized: existing.acquirer_normalized || incoming.acquirer_normalized,
    target_normalized: existing.target_normalized || incoming.target_normalized,
    // Prefer defined values
    value_usd: existing.value_usd ?? incoming.value_usd,
    sector: existing.sector || incoming.sector,
    geography: existing.geography || incoming.geography,
    synopsis: existing.synopsis || incoming.synopsis,
    rationale: existing.rationale || incoming.rationale,
    // Prefer more recent date
    announced_date: existing.announced_date > incoming.announced_date
      ? existing.announced_date
      : incoming.announced_date,
    // Prefer more advanced status
    status: getMoreAdvancedStatus(existing.status, incoming.status),
    // Merge sources
    sources: [
      ...existing.sources,
      ...incoming.sources.filter(s =>
        !existing.sources.some(es => es.url === s.url)
      )
    ]
  };
}

// Get the more advanced status (e.g., Completed > Pending > Announced)
function getMoreAdvancedStatus(s1: ParsedDeal['status'], s2: ParsedDeal['status']): ParsedDeal['status'] {
  const priority = {
    'Completed': 4,
    'Withdrawn': 3,
    'Pending': 2,
    'Announced': 1,
    'Rumored': 0
  };

  return priority[s1] >= priority[s2] ? s1 : s2;
}
