# M&A Intelligence Pro - Complete Documentation

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Product Vision
M&A Intelligence Pro is an institutional-grade deal tracking platform designed for investment bankers, analysts, and institutional investors to monitor global M&A transactions in real-time with verified, multi-source data.

### 1.2 Core Features

#### **Feature 1: Deals Explorer**
- **Purpose**: Browse and filter global M&A transactions
- **Requirements**:
  - Display ~50+ major transactions ($500M+ value)
  - Multi-dimensional filtering: Status, Sector, Geography, Value Tier
  - Full-text search across company names and sectors
  - Sort by: Date, Transaction Name, Sector, Value, Status
  - Two view modes: Table View (detailed) and Grid View (visual cards)
  - Pagination: 20 deals per page
  - Currency formatting: $68.7B, $500M format
  - Verification badges (verified/pending/unverified)
  - Real-time data sync indicators

#### **Feature 2: Deal Profile Pages**
- **Purpose**: Deep dive into individual transactions
- **Requirements**:
  - Deal synopsis and strategic rationale
  - Key metrics: Value, Status, Announced Date, Expected Close
  - Deal parameters: Payment structure, Breakup fee, Control %
  - Company information: Acquirer and Target with logos
  - Timeline visualization
  - Market response data (for public companies)
  - Multi-source citations with links
  - Sector and geography tags

#### **Feature 3: Admin Intelligence Console**
- **Purpose**: Data ingestion control and monitoring
- **Requirements**:
  - Manual "Sync Latest Signal" button
  - Automated twice-daily cron jobs (8 AM & 6 PM UTC)
  - Real-time sync status monitoring
  - Data source health checks (SEC EDGAR, Perplexity, Supabase)
  - Live sync logs with event streaming
  - Verification queue tracking
  - Error reporting and diagnostics

#### **Feature 4: User Dashboard**
- **Purpose**: Personalized deal tracking
- **Requirements**:
  - Portfolio overview
  - Watchlist management (create, edit, delete)
  - Deal tracking and notifications
  - User profile management
  - Account settings

### 1.3 User Flows

#### **Primary Flow: Discovering Deals**
1. User lands on homepage → Sees hero with value proposition
2. Clicks "Deals Explorer" → Views table of latest deals
3. Applies filters (e.g., "Technology" sector, "Mega-Deal" tier)
4. Sorts by value (descending)
5. Clicks on deal card → Views detailed deal profile
6. Reviews sources and verification status
7. Adds to watchlist (if authenticated)

#### **Admin Flow: Syncing Data**
1. Admin navigates to Admin Dashboard
2. Clicks "Sync Latest Signal" button
3. Watches real-time log stream (fetching SEC, Perplexity, deduplication, verification)
4. Reviews sync summary (deals added, updated, errors)
5. Checks data source health indicators
6. Views newly added deals in Explorer

#### **Authentication Flow**
1. User clicks "Get Access" or "Log in"
2. **Current**: Mock authentication (bypassed for testing)
3. **Future**: Supabase Auth with email/password or OAuth
4. Redirected to Dashboard after login

### 1.4 Data Models

#### **Deal Model**
```typescript
interface Deal {
  id: string;
  slug: string; // URL-friendly identifier
  title: string; // "Microsoft to acquire Activision Blizzard"
  status: 'Announced' | 'Completed' | 'Pending' | 'Withdrawn' | 'Rumored';
  visibility: 'public' | 'unlisted' | 'private';
  announced_date: string; // ISO date
  expected_close?: string; // "Q2 2025"
  value_usd?: number; // 68700000000 for $68.7B
  currency: string; // "USD"
  percent_acquired?: number; // 100 for full acquisition
  synopsis: string; // Deal description
  rationale?: string; // Strategic rationale
  sector: string; // "Technology / Software"
  geography: string; // "North America"
  acquirer_id: string; // FK to companies
  target_id: string; // FK to companies
  payment_structure?: string; // "Mixed Cash/Stock"
  breakup_fee?: string; // "3.5% of EV"
  market_response?: MarketResponse;
  confidence_score?: number; // 0-100
  verification_status?: 'verified' | 'pending' | 'unverified';
  deal_terms_fetched?: boolean;
  sources?: DealSource[];
  created_at: string;
  updated_at: string;
}
```

#### **Company Model**
```typescript
interface Company {
  id: string;
  name: string;
  logo_url?: string;
  sector: string;
  headquarters: string;
  website?: string;
  description?: string;
}
```

#### **Source Model**
```typescript
interface DealSource {
  id: string;
  deal_id: string;
  source_type: 'sec_edgar' | 'perplexity' | 'rss' | 'manual';
  source_url: string;
  publication_name: string;
  published_at?: string;
  is_primary?: boolean;
  raw_content?: string;
}
```

### 1.5 State Management Strategy
- **TanStack Query (React Query)** for server state
- **Local useState** for UI state (filters, sorting, pagination)
- **Query Keys**: `['deals']`, `['deal', slug]`, `['watchlists']`, `['sync-logs']`
- **Caching**: 5-minute stale time for deals
- **Optimistic Updates**: Watchlist additions

---

## 2. DESIGN SPECIFICATION

### 2.1 Component Hierarchy

```
App (Root)
├── Navigation Bar
│   ├── Logo + Brand
│   ├── Navigation Links (Deals Explorer, Admin Panel)
│   └── User Menu (Dashboard, Watchlists, Account, Logout)
├── Router (HashRouter)
│   ├── LandingPage
│   ├── DealsExplorer
│   │   ├── Filter Panel
│   │   │   ├── Search Input
│   │   │   ├── Status Dropdown
│   │   │   └── Advanced Filters (Sector, Geography, Value Tier)
│   │   ├── View Toggle (Table/Grid)
│   │   └── Deal List
│   │       ├── Table View (sortable columns)
│   │       └── Grid View (card layout)
│   ├── DealProfile
│   │   ├── Header (Title, Status, Value)
│   │   ├── Company Cards (Acquirer + Target)
│   │   ├── Deal Parameters
│   │   ├── Synopsis & Rationale
│   │   ├── Timeline
│   │   └── Sources Section
│   ├── AdminDashboard
│   │   ├── Sync Controls
│   │   ├── Data Source Health Cards
│   │   ├── Live Sync Logs
│   │   └── Verification Queue
│   ├── Dashboard (User)
│   ├── WatchlistsPage
│   ├── AccountPage
│   └── About/Methodology Pages
└── Footer
```

### 2.2 Layout Descriptions

#### **Deals Explorer Layout**
- **Container**: Max-width 7xl, centered, padded (px-4 sm:px-6 lg:px-8)
- **Header Section**:
  - Left: Title + Description + Status badges
  - Right: View toggle buttons (List/Grid)
- **Filter Section**: White card with rounded corners, shadow
  - Row 1: Search input (7 cols) + Status dropdown (3 cols) + Filters button (2 cols)
  - Row 2 (collapsible): Sector, Geography, Value Tier dropdowns
  - Active filters bar: Display active chips with "Clear All" button
- **Content Area**:
  - **Table View**: Full-width table with sortable headers, hover effects
  - **Grid View**: 3-column grid (responsive: md:2, lg:3), card-based
- **Pagination**: Bottom bar with page numbers and prev/next buttons

#### **Deal Profile Layout**
- **Hero Section**: Full-width banner with deal title, status badge, value
- **Two-Column Grid**:
  - **Left Column** (2/3 width):
    - Deal synopsis card
    - Timeline card
    - Sources card
  - **Right Column** (1/3 width):
    - Company info cards (stacked)
    - Deal parameters card
    - Market response card

#### **Admin Dashboard Layout**
- **Grid Layout** (3 columns):
  - Sync control card (full width)
  - Data source health cards (3-column grid)
  - Live sync logs (full width terminal-style)
  - Verification queue table (full width)

### 2.3 Design Tokens

#### **Colors**
```css
Primary: Indigo
  - indigo-50: #eef2ff (light backgrounds)
  - indigo-600: #4f46e5 (primary actions)
  - indigo-700: #4338ca (hover states)

Neutral: Slate
  - slate-50: #f8fafc (backgrounds)
  - slate-100: #f1f5f9 (cards)
  - slate-500: #64748b (secondary text)
  - slate-900: #0f172a (primary text)

Semantic:
  - emerald-500: #10b981 (success/verified)
  - amber-500: #f59e0b (warning/pending)
  - red-500: #ef4444 (error/withdrawn)
  - blue-500: #3b82f6 (announced status)
```

#### **Typography**
```css
Font Families:
  - Body: 'Inter', sans-serif
  - Headings: 'Playfair Display', serif
  - Monospace: Font-mono (for dates, logs)

Sizes:
  - xs: 0.75rem (10px) - labels, badges
  - sm: 0.875rem (14px) - body text
  - base: 1rem (16px) - default
  - lg: 1.125rem (18px) - card titles
  - 2xl: 1.5rem (24px) - section headers
  - 4xl: 2.25rem (36px) - page titles
```

#### **Spacing**
- Base unit: 0.25rem (4px)
- Common scales: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24
- Container padding: px-4 sm:px-6 lg:px-8
- Section gaps: py-12 (3rem)

#### **Borders & Shadows**
```css
Borders:
  - border: 1px solid slate-200
  - rounded-lg: 0.5rem (8px)
  - rounded-2xl: 1rem (16px)
  - rounded-full: 9999px

Shadows:
  - shadow-sm: Subtle card elevation
  - shadow-md: Hover states
  - shadow-xl: Modals and overlays
```

### 2.4 Responsive Breakpoints
```css
sm: 640px (mobile landscape)
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (wide desktop)
```

### 2.5 Component Patterns

#### **Status Badges**
- Small, rounded-full pills with colored backgrounds
- Font: xs, bold, uppercase, tracking-wider
- Color mapping:
  - Completed: emerald-50/emerald-700
  - Announced: blue-50/blue-700
  - Pending: amber-50/amber-700
  - Rumored: purple-50/purple-700
  - Withdrawn: slate-50/slate-500

#### **Verification Icons**
- CheckCircle2: Verified (emerald-500)
- AlertTriangle: Pending (amber-500)
- Size: h-3 w-3 (12px)

#### **Company Logos**
- Container: Fixed size (h-8 w-8 or h-10 w-10)
- Fallback: First letter of company name on colored background
- Border: border border-slate-200
- Padding: p-1 or p-2

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Technology Stack

#### **Frontend**
- **React 19.2.3**: Latest React with Hooks, Functional Components
- **TypeScript 5.8.2**: Strict type safety
- **Vite 6.2.0**: Fast dev server and optimized builds
- **Tailwind CSS**: Utility-first styling
- **React Router DOM 7.12.0**: Client-side routing (HashRouter for SPA)
- **TanStack Query 5.90.16**: Data fetching, caching, state management
- **Lucide React 0.562.0**: Icon library

#### **Backend & Infrastructure**
- **Supabase 2.90.1**: PostgreSQL database with RLS (Row Level Security)
- **Vercel**: Hosting platform with serverless functions
- **@vercel/node 3.0.0**: Serverless function framework

#### **External APIs**
- **SEC EDGAR API**: Primary source for US M&A filings
- **Perplexity API**: Global deal discovery and verification

### 3.2 File Structure

```
M-A-deals/
├── api/                          # Vercel serverless functions
│   ├── sync.ts                   # Main sync endpoint (POST/GET)
│   ├── deals.ts                  # Deals API (GET with filters)
│   └── lib/
│       ├── supabase-admin.ts     # Admin client (service role)
│       ├── sources/
│       │   ├── sec-edgar.ts      # SEC EDGAR fetcher
│       │   └── perplexity.ts     # Perplexity API wrapper
│       ├── parser.ts             # Deal data normalization
│       ├── deduplication.ts      # Deduplication logic
│       └── verification.ts       # Multi-source verification
├── pages/                        # React page components
│   ├── LandingPage.tsx          # Homepage
│   ├── DealsExplorer.tsx        # Deal list with filters
│   ├── DealProfile.tsx          # Individual deal view
│   ├── AdminDashboard.tsx       # Sync controls
│   ├── Dashboard.tsx            # User dashboard
│   ├── WatchlistsPage.tsx       # Watchlist management
│   ├── AccountPage.tsx          # User profile
│   ├── AboutPage.tsx            # About page
│   └── MethodologyPage.tsx      # Methodology docs
├── components/
│   └── CompanyLogo.tsx          # Logo component with fallback
├── lib/
│   └── supabase.ts              # Client-side Supabase config
├── constants.tsx                # Seed data (fallback)
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Root component with routing
├── index.tsx                    # React entry point
├── index.html                   # HTML entry (import maps)
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── vercel.json                  # Cron jobs config
└── package.json                 # Dependencies
```

### 3.3 API Endpoints

#### **GET /api/deals**
- **Purpose**: Fetch deals with optional filtering
- **Query Parameters**:
  - `status`: Filter by deal status
  - `sector`: Filter by sector
  - `geography`: Filter by geography
  - `min_value`: Minimum USD value
  - `max_value`: Maximum USD value
  - `verification_status`: Filter by verification status
- **Response**: Array of Deal objects
- **Caching**: Client-side via TanStack Query (5-min stale time)

#### **POST /api/sync** (also GET for cron)
- **Purpose**: Trigger data synchronization
- **Query Parameters**:
  - `scheduled`: "true" for cron-triggered syncs
- **Process**:
  1. Create sync log entry (status: running)
  2. Fetch from SEC EDGAR (last 90 days)
  3. Fetch from Perplexity (last 90 days)
  4. Normalize and deduplicate deals
  5. Filter deals >$500M
  6. Verify deals (multi-source verification)
  7. Upsert to database (companies and deals)
  8. Update sync log (status: completed)
- **Response**: Sync summary with counts and errors

### 3.4 Data Synchronization Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DATA FETCHING                                            │
├─────────────────────────────────────────────────────────────┤
│ SEC EDGAR API → Search M&A filings (8-K, S-4, DEFM14A)     │
│ Perplexity API → Global deal discovery                      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PARSING & NORMALIZATION (parser.ts)                     │
├─────────────────────────────────────────────────────────────┤
│ • Normalize company names (trim, uppercase)                 │
│ • Parse status strings → DealStatus enum                    │
│ • Detect sector (keyword matching)                          │
│ • Detect geography (country/region extraction)              │
│ • Generate slug (acquirer-target-date)                      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DEDUPLICATION (deduplication.ts)                        │
├─────────────────────────────────────────────────────────────┤
│ • Match by normalized company names + date proximity        │
│ • Merge sources from duplicates                             │
│ • Keep highest-quality deal version                         │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FILTERING                                                │
├─────────────────────────────────────────────────────────────┤
│ • Remove deals < $500M USD                                  │
│ • Apply data quality thresholds                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFICATION (verification.ts)                          │
├─────────────────────────────────────────────────────────────┤
│ SCORING:                                                     │
│ • SEC Filing: +40 points                                    │
│ • Multiple news sources: +10 per source (max 30)            │
│ • Company name match: +15 points                            │
│ • Deal value confirmed: +10 points                          │
│ • Date consistency: +5 points                               │
│                                                              │
│ THRESHOLDS:                                                  │
│ • 70+: Verified (public display)                            │
│ • 40-69: Pending (warning displayed)                        │
│ • <40: Unverified (admin review required)                   │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DATABASE UPSERT (sync.ts)                               │
├─────────────────────────────────────────────────────────────┤
│ • Upsert companies (fetch logos via Clearbit/Google)        │
│ • Check if deal exists by slug                              │
│ • INSERT new deals OR UPDATE existing deals                 │
│ • Insert deal sources (citations)                           │
│ • Log sync results                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 Database Schema (Supabase/PostgreSQL)

```sql
-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  logo_url TEXT,
  logo_fetched BOOLEAN DEFAULT FALSE,
  sector TEXT,
  headquarters TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deals Table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  visibility TEXT DEFAULT 'public',
  announced_date DATE NOT NULL,
  expected_close TEXT,
  value_usd BIGINT,
  currency TEXT DEFAULT 'USD',
  percent_acquired NUMERIC,
  synopsis TEXT NOT NULL,
  rationale TEXT,
  sector TEXT NOT NULL,
  geography TEXT NOT NULL,
  acquirer_id UUID REFERENCES companies(id),
  target_id UUID REFERENCES companies(id),
  payment_structure TEXT,
  breakup_fee TEXT,
  confidence_score INTEGER,
  verification_status TEXT,
  external_id TEXT,
  deal_terms_fetched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deal Sources Table
CREATE TABLE deal_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publication_name TEXT NOT NULL,
  published_at TIMESTAMP,
  fetched_at TIMESTAMP DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT FALSE,
  raw_content TEXT
);

-- Sync Logs Table
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status TEXT NOT NULL,
  deals_added INTEGER DEFAULT 0,
  deals_updated INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'
);

-- Watchlists Table
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Watchlist Items Table
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.6 Key Dependencies

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-router-dom": "^7.12.0",
  "@supabase/supabase-js": "^2.90.1",
  "lucide-react": "^0.562.0",
  "@tanstack/react-query": "^5.90.16",
  "@vercel/node": "^3.0.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

### 3.7 Build & Deployment

#### **Development**
```bash
npm run dev  # Starts Vite dev server on http://localhost:3000
```

#### **Production Build**
```bash
npm run build  # Builds optimized bundle to dist/
```

#### **Deployment (Vercel)**
- **Platform**: Vercel
- **Framework Preset**: Vite
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Serverless Functions**: `api/*.ts`
- **Cron Jobs**: Defined in `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/sync?scheduled=true",
      "schedule": "0 8,18 * * *"
    }
  ]
}
```

---

## 4. IMPLEMENTATION PROMPTS

### Step-by-Step Rebuild Guide

#### **PHASE 1: Project Setup & Configuration**

**Prompt 1.1: Initialize Project**
```
Create a new Vite + React + TypeScript project:
1. Run: npm create vite@latest m-a-deals -- --template react-ts
2. Install dependencies:
   - npm install react-router-dom @supabase/supabase-js lucide-react @tanstack/react-query @vercel/node
   - npm install -D tailwindcss postcss autoprefixer @types/node
3. Initialize Tailwind: npx tailwindcss init -p
4. Configure tailwind.config.js to scan src/**/*.{ts,tsx}
5. Add Tailwind directives to index.css
```

**Prompt 1.2: Configure TypeScript**
```
Update tsconfig.json with these settings:
- target: "ES2022"
- module: "ESNext"
- jsx: "react-jsx"
- strict: true
- paths: { "@/*": ["./*"] }
- moduleResolution: "bundler"
```

**Prompt 1.3: Setup Vite Configuration**
```
Create vite.config.ts:
- Add React plugin
- Configure dev server port: 3000
- Add path alias: @ → resolve(__dirname)
- Enable env variables with VITE_ prefix
```

**Prompt 1.4: Setup Vercel Configuration**
```
Create vercel.json with:
- Cron jobs: 8 AM and 6 PM UTC for /api/sync?scheduled=true
- Schedule format: "0 8,18 * * *"
```

---

#### **PHASE 2: Type Definitions & Constants**

**Prompt 2.1: Create TypeScript Interfaces**
```
Create types.ts with these interfaces:
1. DealStatus: 'Announced' | 'Completed' | 'Pending' | 'Withdrawn' | 'Rumored'
2. VerificationStatus: 'unverified' | 'pending' | 'verified'
3. Deal interface with fields:
   - id, slug, title, status, visibility
   - announced_date, expected_close, value_usd
   - synopsis, rationale, sector, geography
   - acquirer_id, target_id
   - payment_structure, breakup_fee
   - confidence_score, verification_status
   - sources, created_at, updated_at
4. Company interface
5. DealSource interface
6. SyncLog interface
7. UserProfile, Watchlist, WatchlistItem interfaces
```

**Prompt 2.2: Create Seed Data**
```
Create constants.tsx with:
- SEED_COMPANIES: Array of 80+ companies with id, name, logo_url, sector, headquarters
- SEED_DEALS: Array of 50+ deals from 2022-2025 including:
  - Microsoft-Activision ($68.7B)
  - Broadcom-VMware ($61B)
  - Pfizer-Seagen ($43B)
  - Adobe-Figma ($20B)
  - Intuit-Credit Karma ($7.1B)
  (Include mix of sectors: Technology, Healthcare, Financial Services, Consumer, Industrial)
```

---

#### **PHASE 3: Supabase Configuration**

**Prompt 3.1: Setup Client-Side Supabase**
```
Create lib/supabase.ts:
- Import createClient from @supabase/supabase-js
- Read env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Export supabase client
- Export isSupabaseConfigured boolean
```

**Prompt 3.2: Setup Server-Side Supabase**
```
Create api/lib/supabase-admin.ts:
- Import createClient from @supabase/supabase-js
- Read env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- Export supabaseAdmin client (with service role key for admin operations)
- Export isSupabaseAdminConfigured boolean
```

---

#### **PHASE 4: Backend API - Data Fetching**

**Prompt 4.1: SEC EDGAR Fetcher**
```
Create api/lib/sources/sec-edgar.ts:
- Implement fetchSECDeals(daysBack: number) function
- Search SEC EDGAR API for M&A-related forms:
  - 8-K: Current reports (often announce M&A)
  - S-4: Merger registration statements
  - DEFM14A: Proxy statements for mergers
- Parse filings to extract:
  - Acquirer and target company names
  - Deal value (if mentioned)
  - Announcement date
  - Description/synopsis
  - Source URL (SEC filing link)
- Return array of parsed deals
```

**Prompt 4.2: Perplexity API Wrapper**
```
Create api/lib/sources/perplexity.ts:
- Implement fetchGlobalDeals(daysBack: number) function
- Use Perplexity API with prompt:
  "Find major M&A deals announced in the last {daysBack} days with value over $500M. For each deal, provide: acquirer, target, value in USD, sector, geography, status, announcement date, payment structure, breakup fee (if available), synopsis, and news sources."
- Parse JSON response and normalize fields
- Return array of deals with sources

- Implement checkDealStatusUpdates(deals: Deal[]) function
- Query Perplexity for status updates on existing deals
- Return updated deal statuses
```

**Prompt 4.3: Parser & Normalization**
```
Create api/lib/parser.ts:
- normalizeCompanyName(name: string): Remove "Inc.", "Ltd.", trim, uppercase
- parseStatus(statusString: string): Map to DealStatus enum
- detectSector(description: string): Keyword-based sector detection
- detectGeography(text: string): Extract country/region
- generateSlug(acquirer, target, date): Create URL-friendly slug
- generateTitle(acquirer, target): "Acquirer to acquire Target"
- Export ParsedDeal interface
```

**Prompt 4.4: Deduplication Logic**
```
Create api/lib/deduplication.ts:
- Implement deduplicateDeals(deals: ParsedDeal[]) function
- Match criteria:
  - Normalized acquirer and target names match
  - Announcement dates within 7 days
- Merge strategy:
  - Combine sources from duplicates
  - Prefer deal with more complete data
  - Keep highest verification score
- Return deduplicated array
```

**Prompt 4.5: Verification Framework**
```
Create api/lib/verification.ts:
- Implement verifyDeals(deals: ParsedDeal[], options) function
- Scoring algorithm:
  - SEC Filing present: +40 points
  - Multiple news sources: +10 per source (max 30)
  - Company name match confidence: +15
  - Deal value confirmed: +10
  - Date consistency: +5
- Calculate confidenceScore (0-100)
- Determine verificationStatus:
  - 70+: 'verified'
  - 40-69: 'pending'
  - <40: 'unverified'
- Return array with verification data added
```

---

#### **PHASE 5: Backend API - Endpoints**

**Prompt 5.1: Sync Endpoint**
```
Create api/sync.ts:
- Accept POST (manual) or GET (cron) requests
- Check for scheduled=true query param
- Steps:
  1. Create sync log entry (status: running)
  2. Fetch from SEC EDGAR (90 days)
  3. Fetch from Perplexity (90 days)
  4. Parse and normalize all deals
  5. Deduplicate
  6. Filter deals >$500M
  7. Verify deals
  8. For each deal:
     - Upsert companies (fetch logos from Clearbit, Google Favicons)
     - Generate slug
     - Check if deal exists by slug
     - INSERT new or UPDATE existing deal
     - Insert deal sources
  9. Update sync log (status: completed, counts, errors)
  10. Return sync summary JSON
- Error handling: Catch errors, update sync log status to 'failed'
```

**Prompt 5.2: Deals API Endpoint**
```
Create api/deals.ts:
- Accept GET requests
- Read query params: status, sector, geography, min_value, max_value, verification_status
- Query Supabase deals table with filters
- Order by announced_date DESC
- Only return public deals (visibility: 'public')
- Join with companies for acquirer/target data
- Return JSON array of deals
```

---

#### **PHASE 6: Frontend Components - Shared**

**Prompt 6.1: Company Logo Component**
```
Create components/CompanyLogo.tsx:
- Props: logoUrl (optional), name, className
- If logoUrl exists: Display <img> with src={logoUrl}
- Fallback: Display first letter of company name in a colored circle
  - Background color: Generate from name hash (consistent per company)
  - Text color: White
- Handle image load errors with fallback
- Apply className for sizing (e.g., h-8 w-8)
```

---

#### **PHASE 7: Frontend Pages - Core**

**Prompt 7.1: Landing Page**
```
Create pages/LandingPage.tsx:
- Hero section with:
  - Large heading: "Institutional-Grade M&A Intelligence"
  - Subheading: "Track global M&A transactions with verified, real-time data"
  - CTA button: "Explore Deals" (links to /deals)
- Features grid (3 columns):
  - Real-time data ingestion
  - Multi-source verification
  - Global coverage
- Stats section: Total deals, total value, coverage
- Footer CTA: "Get Access" button
```

**Prompt 7.2: Deals Explorer Page**
```
Create pages/DealsExplorer.tsx:
- Use TanStack Query to fetch deals from /api/deals (or fallback to SEED_DEALS)
- State management:
  - searchQuery, statusFilter, sectorFilter, geoFilter, valueTier
  - sortConfig: { key: string, direction: 'asc' | 'desc' }
  - currentPage, DEALS_PER_PAGE: 20
  - view: 'list' | 'grid'
- Filter panel:
  - Search input (full-text)
  - Status dropdown
  - Advanced filters: Sector, Geography, Value Tier
  - Active filters display with "Clear All"
- Sorting logic: Sort by announced_date, title, sector, value_usd, status
- Pagination: Calculate totalPages, display page numbers, prev/next buttons
- View toggle: Table View vs Grid View
- Table View:
  - Columns: Announced, Transaction (with logo), Sector, Value, Status, Details
  - Sortable headers with icons
  - Row hover effects, click to navigate to deal profile
- Grid View:
  - 3-column responsive grid
  - Card with: Logo, status badge, title, sector/geo tags, value, "View" link
- Loading state with spinner
- Empty state: "No matches found" with reset button
```

**Prompt 7.3: Deal Profile Page**
```
Create pages/DealProfile.tsx:
- Use useParams() to get slug from URL
- Fetch deal from SEED_DEALS by slug (or Supabase)
- Layout:
  - Hero: Title, status badge, value
  - Company cards: Acquirer and Target (side-by-side)
    - Logo, name, sector, headquarters
  - Deal parameters card:
    - Payment structure, breakup fee, percent acquired
  - Synopsis card: Deal description
  - Rationale card: Strategic rationale
  - Timeline card: Key dates (announced, expected close)
  - Sources card: List of sources with links
    - Display publication name, URL, source type icon
- Verification badge: Show verification status
- "Add to Watchlist" button (if authenticated)
- Back button: "← Back to Explorer"
```

**Prompt 7.4: Admin Dashboard**
```
Create pages/AdminDashboard.tsx:
- Sync controls:
  - "Sync Latest Signal" button (POST to /api/sync)
  - Display sync status: idle, running, completed, failed
  - Show sync progress bar when running
- Data source health cards (3-column grid):
  - SEC EDGAR: Last successful fetch, status (online/offline)
  - Perplexity: API quota remaining, status
  - Supabase: Connection status, row counts
- Live sync logs:
  - Terminal-style scrollable div with monospace font
  - Stream sync events in real-time (simulated with setTimeout)
  - Color-coded: Info (blue), success (green), error (red)
  - Auto-scroll to bottom
- Verification queue table:
  - List deals with verification_status: 'pending' or 'unverified'
  - Columns: Title, Status, Confidence Score, Action
  - Action button: "Review" (placeholder)
- Sync history:
  - Query sync_logs table
  - Display recent syncs with: Time, Type (manual/scheduled), Deals Added, Deals Updated, Errors
```

---

#### **PHASE 8: Frontend Pages - User Features**

**Prompt 8.1: User Dashboard**
```
Create pages/Dashboard.tsx:
- Welcome message with user name
- Portfolio overview cards:
  - Total watchlisted deals
  - Recent updates
  - Deals by status (chart placeholder)
- Recent activity feed:
  - "You added X to watchlist"
  - "Deal Y status changed to Completed"
- Quick actions:
  - "Explore Deals"
  - "Manage Watchlists"
```

**Prompt 8.2: Watchlists Page**
```
Create pages/WatchlistsPage.tsx:
- Display user's watchlists
- "Create Watchlist" button
- For each watchlist:
  - Name, created date, deal count
  - List of deals in watchlist
  - "View" and "Delete" buttons
- Modal for creating new watchlist (name input)
- Add deals to watchlist from deal profile page
```

**Prompt 8.3: Account Page**
```
Create pages/AccountPage.tsx:
- User profile card:
  - Avatar, name, email, role
  - "Edit Profile" button (placeholder)
- Account settings:
  - Email preferences (checkboxes for notifications)
  - Password change form (placeholder)
- Danger zone:
  - "Delete Account" button (red, with confirmation)
```

**Prompt 8.4: About & Methodology Pages**
```
Create pages/AboutPage.tsx:
- Company mission statement
- Team information
- Contact details

Create pages/MethodologyPage.tsx:
- Data sources explanation
- Verification framework details
- Coverage criteria ($500M+ deals)
- Sync frequency (twice daily)
- Limitations and disclaimers
```

---

#### **PHASE 9: Root App & Routing**

**Prompt 9.1: App Component with Navigation**
```
Create App.tsx:
- Import React Router: HashRouter, Routes, Route, Link
- State: session (mock authentication for testing)
- Navigation bar:
  - Logo and brand: "M&A Intelligence"
  - Links: Deals Explorer, Admin Panel
  - Right side: Dashboard icon, Watchlists icon, User menu, Logout
  - Mobile menu: Hamburger icon, collapsible menu
- Routes:
  - / → LandingPage
  - /deals → DealsExplorer
  - /deals/:slug → DealProfile
  - /app → Dashboard
  - /app/watchlists → WatchlistsPage
  - /app/account → AccountPage
  - /app/admin → AdminDashboard
  - /about → AboutPage
  - /methodology → MethodologyPage
- Footer:
  - Logo, description, links grid
  - Social media links
  - Copyright notice
- Mock authentication:
  - handleLogin: Set session with test user
  - handleLogout: Clear session
  - Auth placeholder pages for /login and /signup
```

**Prompt 9.2: React Entry Point**
```
Create index.tsx:
- Import React, ReactDOM, App
- Import TanStack Query: QueryClient, QueryClientProvider
- Create queryClient with defaultOptions:
  - staleTime: 5 minutes
  - cacheTime: 10 minutes
- Render:
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <App />
    </HashRouter>
  </QueryClientProvider>
```

**Prompt 9.3: HTML Entry Point**
```
Create index.html:
- Basic HTML structure with <div id="root">
- Import Google Fonts: Inter (body), Playfair Display (headings)
- Import maps for modules (esm.sh CDN if using)
- Meta tags: charset, viewport, description
- Title: "M&A Intelligence Pro"
```

---

#### **PHASE 10: Styling & Polish**

**Prompt 10.1: Global Styles**
```
Update index.css:
- Import Tailwind directives: @tailwind base, components, utilities
- Add custom scrollbar styles for terminal logs:
  - Thin scrollbar, indigo thumb, slate track
- Add animation keyframes for spin, pulse, slide-in
- Custom CSS for no-scrollbar utility class
```

**Prompt 10.2: Responsive Design**
```
Review all pages and ensure:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid layouts: 1 column on mobile, 2-3 columns on desktop
- Collapsible navigation on mobile
- Touch-friendly button sizes (min 44px tap target)
```

**Prompt 10.3: Loading & Error States**
```
Add to all data-fetching components:
- Loading state: Spinner with "Loading..." text
- Error state: Error icon with message and "Try Again" button
- Empty state: Friendly message with CTA
- Skeleton screens for table/grid views (optional enhancement)
```

---

#### **PHASE 11: Testing & Deployment**

**Prompt 11.1: Local Development Testing**
```
1. Start dev server: npm run dev
2. Test all routes and navigation
3. Test filters, sorting, pagination in Deals Explorer
4. Test deal profile pages
5. Test sync button in Admin Dashboard (with mock data if no Supabase)
6. Verify responsive design on mobile viewport
```

**Prompt 11.2: Supabase Setup**
```
1. Create Supabase project at supabase.com
2. Run SQL schema from Phase 3.5 in Supabase SQL Editor
3. Create RLS policies:
   - Public read access to deals, companies, deal_sources
   - Authenticated users can CRUD watchlists
   - Service role for sync operations
4. Get credentials:
   - Project URL
   - Anon key (public)
   - Service role key (secret)
```

**Prompt 11.3: Environment Variables**
```
Create .env file:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PERPLEXITY_API_KEY=your-perplexity-key

Add to Vercel project settings (Environment Variables section)
```

**Prompt 11.4: Deploy to Vercel**
```
1. Install Vercel CLI: npm i -g vercel
2. Run: vercel
3. Link to project or create new
4. Deploy: vercel --prod
5. Verify deployment:
   - Test website URL
   - Test /api/sync endpoint
   - Check cron jobs in Vercel dashboard
6. Monitor sync logs in Admin Dashboard
```

---

#### **PHASE 12: Enhancements (Optional)**

**Prompt 12.1: Real Authentication**
```
Replace mock auth with Supabase Auth:
- Use supabase.auth.signUp(), signIn(), signOut()
- Implement session persistence
- Add protected routes (redirect to /login if not authenticated)
- Add email verification flow
```

**Prompt 12.2: Advanced Filters**
```
Add to Deals Explorer:
- Date range filter (announced between X and Y)
- Multi-select filters (select multiple sectors)
- Saved filter presets
- Export to CSV button
```

**Prompt 12.3: Deal Alerts**
```
Implement notification system:
- User sets alert criteria (sector, value threshold)
- Email/push notifications when new deals match
- Alert management page
```

**Prompt 12.4: Analytics Dashboard**
```
Create analytics page with charts:
- Deals by sector (pie chart)
- Deals over time (line chart)
- Average deal size by sector (bar chart)
- Geography heatmap
- Use Chart.js or Recharts library
```

**Prompt 12.5: Performance Optimizations**
```
- Implement virtual scrolling for large deal lists (react-window)
- Add image lazy loading
- Code splitting by route (React.lazy)
- Optimize Supabase queries with indexes
- Add service worker for offline support
```

---

## 5. VERIFICATION CHECKLIST

Use this checklist to ensure all features are implemented:

### Core Features
- [ ] Deals Explorer with search and filters
- [ ] Table and Grid view toggle
- [ ] Sortable columns
- [ ] Pagination (20 deals per page)
- [ ] Deal Profile pages with all details
- [ ] Company logos with fallback
- [ ] Status badges with colors
- [ ] Verification badges
- [ ] Admin Dashboard with sync controls
- [ ] Live sync logs
- [ ] Data source health monitoring
- [ ] User Dashboard
- [ ] Watchlist management
- [ ] Account page

### Backend
- [ ] SEC EDGAR fetcher working
- [ ] Perplexity API integration
- [ ] Parser and normalization
- [ ] Deduplication logic
- [ ] Verification framework (scoring)
- [ ] /api/sync endpoint (manual + cron)
- [ ] /api/deals endpoint with filters
- [ ] Supabase database schema
- [ ] Company logo fetching

### Frontend
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Tailwind styling
- [ ] Navigation with active states
- [ ] Footer
- [ ] Mock authentication

### Deployment
- [ ] Vercel deployment
- [ ] Environment variables configured
- [ ] Cron jobs scheduled (8 AM, 6 PM UTC)
- [ ] Supabase connected
- [ ] API endpoints working in production

---

## 6. PROJECT METADATA

**Project Location**: `C:\Users\arush\OneDrive\Documents\GitHub\M-A-deals`

**Key Files to Reference**:
- Types: `types.ts:1` (all interfaces)
- Deals Explorer: `pages/DealsExplorer.tsx:51` (main component)
- Sync API: `api/sync.ts:106` (handler function)
- App Router: `App.tsx:31` (routing setup)
- Parser: `api/lib/parser.ts` (normalization functions)
- Verification: `api/lib/verification.ts` (scoring algorithm)

**Budget Constraints**:
- Primary: Free APIs only (SEC EDGAR)
- Secondary: Perplexity API ($55 credit available)
- Hosting: Vercel free tier
- Database: Supabase free tier

**Sync Schedule**:
- Twice daily: 8:00 AM UTC and 6:00 PM UTC
- Cron expression: `0 8,18 * * *`

**Data Thresholds**:
- Minimum deal size: $500M USD
- Verification threshold: 70+ points for "verified" status
- Deduplication: 7-day date window

---

This documentation provides a complete blueprint for understanding and rebuilding the M&A Intelligence Pro application. Each implementation prompt is designed to be fed sequentially to an AI assistant to recreate the entire codebase from scratch.
