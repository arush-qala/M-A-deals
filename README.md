
# M&A Intelligence Pro

**Institutional-grade deal tracking and analysis platform.**

M&A Intelligence Pro is a premium intelligence dashboard designed for investment bankers, analysts, and institutional investors to track global Mergers and Acquisitions activity. It provides a sophisticated interface for exploring verified deal data, analyzing market trends, and managing proprietary intelligence pipelines.

## 🚀 Tech Stack

*   **Frontend Framework:** React 19 + TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM v7
*   **State/Data Fetching:** TanStack Query
*   **Icons:** Lucide React
*   **Backend/Database:** Supabase (PostgreSQL)
*   **Hosting:** Vercel (with Cron Jobs)
*   **Data Sources:** SEC EDGAR API, Perplexity AI

## ✨ Key Features

### 1. Deals Explorer
*   **Comprehensive Database:** Access a curated list of ~50 major global transactions (2022-2025), including Completed, Pending, Rumored, and Withdrawn deals.
*   **Advanced Filtering:** Filter by Deal Status, Sector, Geography, and Enterprise Value Tier (Small, Mid, Mega-cap).
*   **Interactive Sorting:** Users can sort table data by:
    *   Announced Date
    *   Transaction Name
    *   Sector
    *   Value (USD)
    *   Status
*   **Smart Formatting:** Deal values are automatically formatted into human-readable units (e.g., `$68.7B`, `$500M`) rather than raw numbers.
*   **View Modes:** Toggle between detailed Table View and visual Grid View.

### 2. Deal Profile Intelligence
*   **Deep Dive Analysis:** Detailed synopsis, strategic rationale, and key deal parameters (breakup fees, control percentages).
*   **Timeline Tracking:** Visual timeline of deal milestones from announcement to expected close.
*   **Market Response:** Sentiment analysis and stock performance metrics for public entities.

### 3. Admin Intelligence Console
*   **Live Sync Pipeline:** The "Sync Latest Signal" button triggers real-time data ingestion from SEC EDGAR and Perplexity AI.
*   **Automated Syncs:** Scheduled cron jobs run at 8:00 AM and 6:00 PM UTC daily.
*   **System Health:** Real-time status monitoring of data sources (SEC EDGAR, Perplexity, Supabase).
*   **Activity Logs:** Live terminal view of sync events, including deals added/updated and verification results.
*   **Verification Queue:** Track deals pending analyst verification.

### 4. Source Citations
*   **Transparent Sourcing:** Every deal displays its data sources with direct links.
*   **Verification Badges:** Deals show verification status (Verified, Pending, Unverified).
*   **Confidence Scores:** Multi-source verification scoring system.

## 📊 Data Methodology

Our platform ensures data accuracy through a multi-tiered verification process:

### Data Sources
*   **SEC EDGAR API (Primary):** Official US regulatory filings (8-K, S-4, DEFM14A) for M&A announcements.
*   **Perplexity AI (Secondary):** Global deal discovery, verification, and data enrichment across all regions.

### Deal Coverage
*   **Minimum Value:** $500 million USD
*   **Geographic Scope:** Global (North America, Europe, Asia Pacific)
*   **Sectors:** All sectors covered
*   **Statuses:** Announced, Pending, Completed, Withdrawn, Rumored

### Verification Framework

**Confidence Scoring (0-100):**
| Factor | Points |
|--------|--------|
| SEC Filing Found | +40 |
| Multiple News Sources | +10 per source (max 30) |
| Company Names Match | +15 |
| Deal Value Confirmed | +10 |
| Date Consistency | +5 |

**Verification Thresholds:**
*   **70+:** Verified - Displayed publicly with green badge
*   **40-69:** Pending - Displayed with amber warning badge
*   **<40:** Unverified - Requires admin review

## 🛠 Project Structure

```
M-A-deals/
├── api/                    # Vercel Serverless Functions
│   ├── sync.ts            # Sync endpoint (manual + cron)
│   ├── deals.ts           # Deals API
│   └── lib/
│       ├── supabase-admin.ts
│       ├── sources/
│       │   ├── sec-edgar.ts
│       │   └── perplexity.ts
│       ├── parser.ts
│       ├── deduplication.ts
│       └── verification.ts
├── pages/                  # React page components
├── components/             # Reusable UI components
├── lib/                    # Frontend utilities
│   └── supabase.ts
├── types.ts               # TypeScript definitions
├── constants.tsx          # Seed data (fallback)
├── vercel.json            # Cron configuration
└── CLAUDE.md              # AI assistant context
```

## 📝 Recent Updates & Changelog

### January 2026 - Live Sync Pipeline
*   **Real-Time Data Sync:** Implemented live data fetching from SEC EDGAR and Perplexity AI.
*   **Automated Cron Jobs:** Scheduled syncs at 8:00 AM and 6:00 PM UTC daily via Vercel.
*   **Verification Framework:** Multi-source verification with confidence scoring.
*   **Source Citations:** Every deal now displays its data sources with direct links.
*   **Verification Badges:** Visual indicators for verified, pending, and unverified deals.
*   **API Routes:** Created `/api/sync` and `/api/deals` serverless endpoints.
*   **Database Integration:** Full Supabase PostgreSQL integration for persistent storage.

### Previous Updates
*   **Database Expansion:** Increased seed dataset from 10 to ~50 major deals.
*   **UI/UX Enhancements:**
    *   Added interactive column sorting in the Deals Explorer.
    *   Implemented dynamic currency formatting (Billions/Millions suffixes).
*   **Admin Features:** Secured "Sync Latest Signal" button in Admin Dashboard.

## 🔧 Environment Variables

Required for deployment:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PERPLEXITY_API_KEY=your-perplexity-key
```
