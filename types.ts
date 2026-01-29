
export type DealVisibility = 'public' | 'unlisted' | 'private';
export type DealStatus = 'Announced' | 'Completed' | 'Pending' | 'Withdrawn' | 'Rumored';

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  sector: string;
  headquarters: string;
  website?: string;
  description?: string;
}

export interface MarketResponse {
  acquirer_ticker: string;
  change_percent: number; // e.g. 5.2 for +5.2%, -2.1 for -2.1%
  sentiment_summary: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface Deal {
  id: string;
  slug: string;
  title: string;
  status: DealStatus;
  visibility: DealVisibility;
  announced_date: string;
  expected_close?: string; // e.g. "Q2 2025", "Mid 2026"
  value_usd?: number;
  currency: string;
  percent_acquired?: number;
  synopsis: string;
  rationale?: string;
  sector: string;
  geography: string;
  acquirer_id: string; // ID of the acquiring company
  target_id: string;   // ID of the target company
  payment_structure?: string; // e.g., "Mixed Cash/Stock", "All Cash", "All Stock"
  breakup_fee?: string; // e.g., "3.5% of EV", "None"
  market_response?: MarketResponse; // Optional, only for public companies with verified data
  // Sync & verification fields
  confidence_score?: number; // 0-100 verification score
  verification_status?: VerificationStatus;
  external_id?: string; // Unique ID from source (e.g., SEC accession number)
  deal_terms_fetched?: boolean; // Whether payment structure and breakup fee have been fetched
  sources?: DealSource[]; // Sources for this deal
  created_at: string;
  updated_at: string;
}

export interface DealParty {
  id: string;
  deal_id: string;
  company_id: string;
  role: 'acquirer' | 'target' | 'seller' | 'investor';
  company?: Company;
}

export interface DealTimelineEvent {
  id: string;
  deal_id: string;
  date: string;
  event_label: string;
  description?: string;
}

export interface DealAdvisor {
  id: string;
  deal_id: string;
  firm_name: string;
  role: 'Legal' | 'Financial' | 'Accounting' | 'PR';
}

export type SourceType = 'sec_edgar' | 'perplexity' | 'rss' | 'manual';

export interface DealSource {
  id: string;
  deal_id: string;
  source_type: SourceType;
  source_url: string;
  publication_name: string;
  published_at?: string;
  fetched_at?: string;
  is_primary?: boolean;
  raw_content?: string; // Store original content for audit
}

export type SyncStatus = 'running' | 'completed' | 'failed';

export interface SyncLog {
  id: string;
  sync_type: 'manual' | 'scheduled';
  started_at: string;
  completed_at?: string;
  status: SyncStatus;
  deals_added: number;
  deals_updated: number;
  errors: string[];
  sources_checked?: Record<string, boolean>;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  deal_id: string;
  created_at: string;
  deal?: Deal;
}
