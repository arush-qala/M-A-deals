import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// This has admin privileges and bypasses RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured. API routes will not work properly.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceKey);
