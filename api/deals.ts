import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, isSupabaseAdminConfigured } from './lib/supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check configuration
  if (!isSupabaseAdminConfigured) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please set environment variables'
    });
  }

  try {
    // Parse query parameters
    const {
      status,
      sector,
      geography,
      minValue,
      maxValue,
      verification,
      limit = '50',
      offset = '0',
      sort = 'announced_date',
      order = 'desc'
    } = req.query;

    // Build query
    let query = supabaseAdmin
      .from('deals')
      .select(`
        *,
        sources:deal_sources(*)
      `)
      .eq('visibility', 'public');

    // Apply filters
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (sector && typeof sector === 'string') {
      query = query.eq('sector', sector);
    }

    if (geography && typeof geography === 'string') {
      query = query.eq('geography', geography);
    }

    if (minValue && typeof minValue === 'string') {
      query = query.gte('value_usd', parseInt(minValue, 10));
    }

    if (maxValue && typeof maxValue === 'string') {
      query = query.lte('value_usd', parseInt(maxValue, 10));
    }

    if (verification && typeof verification === 'string') {
      query = query.eq('verification_status', verification);
    }

    // Apply sorting
    const sortColumn = typeof sort === 'string' ? sort : 'announced_date';
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortColumn, { ascending: sortOrder });

    // Apply pagination
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    // Execute query
    const { data: deals, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    // Return response
    return res.status(200).json({
      deals: deals || [],
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: count || deals?.length || 0
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: errorMessage
    });
  }
}
