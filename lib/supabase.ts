
import { createClient } from '@supabase/supabase-js';

// Environment variables - set these in Vercel dashboard or .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are configured
const isConfigured = supabaseUrl && supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-anon');

// Create client (will work in mock mode if not configured)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Export config status for UI feedback
export const isSupabaseConfigured = isConfigured;

/**
 * SQL Schema Reference (Run this in your Supabase SQL Editor):
 * 
 * -- 1. Tables
 * CREATE TABLE companies (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   logo_url TEXT,
 *   sector TEXT,
 *   headquarters TEXT,
 *   website TEXT,
 *   description TEXT
 * );
 * 
 * CREATE TABLE deals (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   slug TEXT UNIQUE NOT NULL,
 *   title TEXT NOT NULL,
 *   status TEXT DEFAULT 'Announced',
 *   visibility TEXT DEFAULT 'public',
 *   announced_date DATE NOT NULL,
 *   value_usd NUMERIC,
 *   currency TEXT DEFAULT 'USD',
 *   percent_acquired NUMERIC,
 *   synopsis TEXT,
 *   rationale TEXT,
 *   sector TEXT,
 *   geography TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE deal_parties (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
 *   company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
 *   role TEXT NOT NULL
 * );
 * 
 * CREATE TABLE watchlists (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   name TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE TABLE watchlist_items (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
 *   deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 2. RLS Policies
 * ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public deals are visible to all" ON deals FOR SELECT USING (visibility = 'public');
 * 
 * ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Companies involved in public deals are visible" ON companies FOR SELECT USING (
 *   EXISTS (
 *     SELECT 1 FROM deal_parties dp 
 *     JOIN deals d ON d.id = dp.deal_id 
 *     WHERE dp.company_id = companies.id AND d.visibility = 'public'
 *   )
 * );
 * 
 * ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can CRUD own watchlists" ON watchlists FOR ALL USING (auth.uid() = user_id);
 * 
 * -- Add more policies for other supporting tables similarly
 */
