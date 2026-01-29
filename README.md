
# M&A Intelligence Pro

**Institutional-grade deal tracking and analysis platform.**

M&A Intelligence Pro is a premium intelligence dashboard designed for investment bankers, analysts, and institutional investors to track global Mergers and Acquisitions activity. It provides a sophisticated interface for exploring verified deal data, analyzing market trends, and managing proprietary intelligence pipelines.

## 🚀 Tech Stack

*   **Frontend Framework:** React 19
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM v6+
*   **State/Data Fetching:** TanStack Query
*   **Icons:** Lucide React
*   **Backend/Database:** Supabase (Client integration)

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
*   **Pipeline Control:** The "Sync Latest Signal" trigger is secured within the Admin Dashboard to allow administrators to manually initiate the data ingestion pipeline.
*   **System Health:** Real-time status monitoring of external data sources (SEC EDGAR, Reuters, Bloomberg).
*   **Activity Logs:** Live terminal view of system events and ingestion processes.

## 📊 Data Methodology

Our platform ensures data accuracy through a multi-tiered verification process:

### Data Sources
*   **Primary:** Regulatory Filings (SEC EDGAR 8-K/10-Q/S-4, UK Companies House, Japan FSA/EDINET).
*   **Secondary:** Verified Financial News Wires (Bloomberg Terminal, Reuters, Dow Jones).
*   **Tertiary:** Corporate Investor Relations (Official Press Releases).

### Geographic Coverage
*   **North America:** USA, Canada.
*   **Europe:** UK, EU Member States.
*   **APAC:** Japan, Australia, Singapore.
*   **Global:** Major cross-border transactions in emerging markets.

### Verification Tiers
1.  **Automated Ingestion:** Sub-60 second capture of global filings.
2.  **Algorithmic Structuring:** LLM processing to extract financial terms.
3.  **Human Verification:** Analyst review for all transactions >$50M.

## 🛠 Project Structure

*   `index.tsx`: Application entry point and provider setup.
*   `App.tsx`: Main routing and layout logic.
*   `pages/`: Individual view components (DealsExplorer, DealProfile, AdminDashboard, etc.).
*   `components/`: Reusable UI components (CompanyLogo, etc.).
*   `lib/`: Utility libraries (Supabase client).
*   `types.ts`: TypeScript definitions for Deals, Companies, and User profiles.
*   `constants.tsx`: Seed data containing the initial verified major deals.

## 📝 Recent Updates & Changelog

*   **Database Expansion:** Increased seed dataset from 10 to ~50 major deals to provide a robust starting environment for analysis.
*   **UI/UX Enhancements:** 
    *   Added interactive column sorting in the Deals Explorer.
    *   Implemented dynamic currency formatting (Billions/Millions suffixes).
*   **Admin Features:** Moved the "Sync Latest Signal" button from the public explorer to the secure Admin Dashboard to restrict pipeline control.
