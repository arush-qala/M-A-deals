
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

export interface Deal {
  id: string;
  slug: string;
  title: string;
  status: DealStatus;
  visibility: DealVisibility;
  announced_date: string;
  value_usd?: number;
  currency: string;
  percent_acquired?: number;
  synopsis: string;
  rationale?: string;
  sector: string;
  geography: string;
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

export interface DealSource {
  id: string;
  deal_id: string;
  url: string;
  publication_name: string;
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
