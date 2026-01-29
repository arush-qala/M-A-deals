# CLAUDE.md - Project Context for AI Assistants

This file contains project preferences and context for AI assistants working on this codebase.

## Project Overview

M&A Intelligence Pro is an institutional-grade M&A deal tracking platform. It fetches, verifies, and displays global M&A transactions for investment bankers and analysts.

## Owner Preferences

### Data Sources
- **Primary**: SEC EDGAR API (free, US regulatory filings)
- **Secondary**: Perplexity API (global deal discovery and verification)
- **No paid subscriptions**: This is a personal project; only free APIs should be used
- **No manual data entry**: All deal data should be fetched automatically
- **Source citations required**: Every deal must display its sources on the deal profile page

### Data Coverage
- **Minimum deal size**: $500 million USD
- **Geographic focus**: Global coverage
- **Sector focus**: All sectors (started with Fintech, now covers all)
- **Deal statuses**: Announced, Pending, Completed, Withdrawn, Rumored

### Sync Configuration
- **Manual sync**: Available via "Sync Latest Signal" button in Admin Dashboard
- **Scheduled syncs**: Twice daily at 8:00 AM and 6:00 PM UTC
- **Timezone**: UTC

### Data Storage
- **Database**: Supabase (PostgreSQL)
- **Historical data**: Never remove old deals; only add new ones and update statuses
- **Verification**: All deals must go through multi-source verification framework

### Verification Requirements
- Build a verification framework that cross-references multiple sources
- Only store verified data in the database
- Show verification status (verified, pending, unverified) on deal cards
- Display confidence scores where available

### Budget Constraints
- First preference: Free APIs and custom-built solutions
- Fallback: Perplexity API ($55 credit available)
- Hosted on Vercel (free tier)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v7 (HashRouter)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Hosting**: Vercel

## Key Files

### API Routes (`/api/`)
- `sync.ts` - Main sync endpoint (manual + cron triggered)
- `deals.ts` - Fetch deals from Supabase
- `lib/sources/sec-edgar.ts` - SEC EDGAR fetcher
- `lib/sources/perplexity.ts` - Perplexity API wrapper
- `lib/verification.ts` - Multi-source verification framework
- `lib/deduplication.ts` - Deduplication logic

### Frontend
- `pages/AdminDashboard.tsx` - Sync controls and monitoring
- `pages/DealsExplorer.tsx` - Deal list with filters
- `pages/DealProfile.tsx` - Individual deal view with sources
- `lib/supabase.ts` - Supabase client configuration

### Configuration
- `vercel.json` - Cron job configuration (8am/6pm UTC)
- `types.ts` - TypeScript interfaces

## Environment Variables

Required in Vercel:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PERPLEXITY_API_KEY=your-perplexity-key
```

## Verification Framework

Confidence scoring:
- SEC filing found: +40 points
- Multiple news sources: +10 per source (max 30)
- Company names match: +15 points
- Deal value confirmed: +10 points
- Date consistency: +5 points

Thresholds:
- 70+: Verified (displayed publicly)
- 40-69: Pending (displayed with warning)
- <40: Unverified (admin review required)

## Development Notes

- The app uses HashRouter for SPA routing on Vercel
- Seed data in `constants.tsx` is used as fallback when Supabase is not configured
- TanStack Query handles caching with 5-minute stale time
- All sync operations are logged to `sync_logs` table
