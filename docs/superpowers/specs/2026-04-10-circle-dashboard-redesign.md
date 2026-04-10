# Circle Dashboard Redesign — Dense Bloomberg-Style Layout

## Goal

Rebuild the circle-dashboard into a dense, single-page Bloomberg-style instrument panel that surfaces the most impactful Circle/CRCL market signals. Target audience: CRCL investor community — the site should be visually polished, easy to understand, and shareable.

## Constraints

- Existing stack: Next.js 16 + Tailwind CSS 4 + Recharts + lightweight-charts
- Single-page layout, no tabs or multi-page navigation
- Dark/light theme toggle
- Desktop-first (1440x900 primary viewport), responsive down to mobile
- 12 modules total, all visible without pagination

## Grid System

6-column CSS Grid. Row height ~280px. Target: all 12 modules fit in ~3.5 rows on a 1440x900 viewport.

```
       Col1    Col2    Col3    Col4    Col5    Col6
      ┌───────────────────┬─────────┬─────────┬─────────────────────┐
Row1  │                   │         │         │                     │
      │   CRCL股价+K线     │ 流通量   │Mint/Burn│    新闻动态           │
      │   (3col x 2row)   │ (1x1)   │ (1x1)   │   (2col x 2row)     │
      │                   ├─────────┼─────────┤    滚动列表           │
Row2  │                   │溢价/折价 │CPN交易量 │                     │
      │                   │ (1x0.5) │ (1x0.5) │                     │
      │                   ├─────────┼─────────┤                     │
      │                   │链上交易量│DeFi分布  │                     │
      │                   │ (1x0.5) │ (1x0.5) │                     │
      ├───────────────────┼─────────┴─────────┼─────────────────────┤
Row3  │                   │                   │                     │
      │   财务指标          │  稳定币竞争        │   稳定币立法          │
      │  (3col x 1row)    │  (1col x 1row)    │  (2col x 1row)      │
      │  Revenue构成图表    │  市占比饼图        │   滚动列表           │
      ├───────────────────┼───────────────────┼─────────────────────┤
Row4  │                   │                   │                     │
      │  Reserve vs 利率差  │                   │                     │
      │  (6col x 1row)    │                   │                     │
      └───────────────────┴───────────────────┴─────────────────────┘
```

## Module Specifications

### 1. CRCL Stock Price (3col x 2row)

The largest card, top-left anchor.

- **Top bar:** Real-time price, daily change (% and absolute), market cap
- **Main area:** Candlestick chart using lightweight-charts library
- **Bottom bar:** Time range selector: 1D / 1W / 1M / 3M / 1Y
- **Data source:** Stock API (existing route `/api/stock`)

### 2. USDC Circulation (1col x 1row)

- **Hero number:** Current total circulation (e.g., "$52.3B")
- **Badge:** MoM change percentage with green/red arrow
- **Chart:** Mini area chart, trailing 12 months
- **Data source:** `/api/usdc` (existing)

### 3. Mint/Burn Net Flow (1col x 1row)

- **Chart:** Dual-color bar chart — green bars for mints, red bars for burns
- **Hero number:** Net flow for current period
- **Timeframe:** Trailing 30 days
- **Data source:** `/api/onchain` (existing, may need extension)

### 4. USDC Premium/Discount (1col x 0.5row) — NEW

- **Hero number:** Current deviation from $1.00 (e.g., +0.0003 or -0.0012)
- **Status indicator:** Green dot = normal (< 0.001) / Yellow = watch (0.001-0.005) / Red = depeg risk (> 0.005)
- **Chart:** Mini line chart, trailing 7 days
- **Data source:** New API route needed — DEX price feeds or CoinGecko

### 5. CPN Transaction Volume (1col x 0.5row) — NEW

- **Hero number:** Current month volume
- **Badge:** MoM growth rate
- **Chart:** Mini bar chart, trailing 6 months
- **Data source:** New API route — Circle quarterly reports / manual entry initially

### 6. On-Chain USDC Transaction Volume (1col x 0.5row)

- **Hero numbers:** Daily transaction volume + active addresses count
- **Chart:** Mini trend line, trailing 30 days
- **Data source:** `/api/onchain` (existing)

### 7. DeFi Distribution (1col x 0.5row)

- **Chart:** Horizontal stacked bar — Aave / Compound / Maker / Other proportions
- **Hero number:** Total USDC TVL in DeFi
- **Data source:** `/api/defi` (existing)

### 8. News Feed (2col x 2row)

Right-side tall card.

- **Layout:** Scrollable list, each item: title + source tag + relative timestamp
- **Interaction:** Click to expand inline summary
- **Sort:** Reverse chronological
- **Data source:** `/api/news` (existing)

### 9. Financial Metrics (3col x 1row)

Bottom-left wide card.

- **Left section:** Stacked bar chart — Revenue composition (Reserve Income vs Other Revenue)
- **Center section:** RLDC Margin trend line (quarterly)
- **Right section:** Key number cards — Total Revenue, Net Income, YoY Growth
- **Data source:** `/api/financials` (existing)

### 10. Stablecoin Competition (1col x 1row)

- **Chart:** Donut chart — USDT / USDC / FDUSD / PYUSD / Other
- **Hero number:** USDC market share % with trend arrow
- **Data source:** `/api/competition` (existing)

### 11. Stablecoin Legislation (2col x 1row)

- **Layout:** Timeline list — bill name + status tag (In Progress / Passed / Stalled)
- **Highlight:** Most recent event pinned at top
- **Data source:** `/api/regulatory` (existing)

### 12. Reserve Yield vs Fed Rate (6col x 1row)

Full-width bottom card.

- **Chart:** Dual-axis line chart — Federal Funds Rate + Circle Reserve Yield
- **Highlight:** Spread (difference) shown as shaded area between lines
- **Granularity:** Quarterly data points
- **Data source:** `/api/macro` (existing, may need extension)

## Theme System

- CSS custom properties for color tokens
- Dark theme (default): deep navy/charcoal backgrounds, bright accent colors
- Light theme: white/light gray backgrounds, darker text
- Toggle button in header
- Persist preference in localStorage

## Responsive Behavior

- **>=1440px:** Full 6-column grid as designed
- **1024-1439px:** 4-column grid, modules reflow — stock chart becomes 2col, news moves below
- **768-1023px:** 2-column grid, all modules stack in priority order
- **<768px:** Single column, all modules full-width, vertically stacked in priority order

Priority order for mobile stacking:
1. CRCL Stock Price
2. USDC Circulation
3. USDC Premium/Discount
4. Mint/Burn
5. Stablecoin Competition
6. Reserve vs Rate
7. Financial Metrics
8. On-Chain Volume
9. CPN Volume
10. DeFi Distribution
11. News
12. Legislation

## Data Sources Summary

| Module | API Route | Status |
|--------|-----------|--------|
| Stock Price | `/api/stock` | Existing |
| USDC Circulation | `/api/usdc` | Existing |
| Mint/Burn | `/api/onchain` | Existing (extend) |
| Premium/Discount | `/api/usdc-peg` | **New** |
| CPN Volume | `/api/cpn` | **New** |
| On-Chain Volume | `/api/onchain` | Existing |
| DeFi Distribution | `/api/defi` | Existing |
| News | `/api/news` | Existing |
| Financials | `/api/financials` | Existing |
| Competition | `/api/competition` | Existing |
| Legislation | `/api/regulatory` | Existing |
| Reserve vs Rate | `/api/macro` | Existing (extend) |

## Components to Remove

The following existing components are no longer needed after merge/dedup:

- `WhaleTracking` — removed per user decision
- `GrowthMetrics` — merged into Financial Metrics
- `RevenuePerUsdc` — merged into Financial Metrics
- `ValuationMetrics` — not in scope
- `PeerComparison` — not in scope
- `MacroRates` — replaced by Reserve vs Rate module
- `OnchainStats` — split into On-Chain Volume and Mint/Burn modules

## Header

- Logo + "Circle Signal" title
- Theme toggle (dark/light)
- Last updated timestamp
- Optional: link to data sources / about page

## Data Refresh Intervals

| Module | Refresh Interval | Notes |
|--------|-----------------|-------|
| Stock Price | 60s | During market hours only |
| USDC Circulation | 1h | On-chain supply query |
| Mint/Burn | 5min | On-chain event monitoring |
| Premium/Discount | 60s | DEX price feed |
| CPN Volume | Manual / quarterly | From Circle earnings reports |
| On-Chain Volume | 5min | Aggregated on-chain data |
| DeFi Distribution | 15min | Protocol TVL APIs |
| News | 10min | RSS / API polling |
| Financials | Manual / quarterly | SEC filings |
| Competition | 1h | CoinGecko / CMC stablecoin data |
| Legislation | Manual | Curated updates |
| Reserve vs Rate | Daily | FRED API + Circle reports |

## Initial Data Strategy

All modules start with mock data that matches the expected API response shape. This allows full UI development before API integration. Mock data lives in `lib/mock-data.ts` (existing file, to be extended). New API routes (`/api/usdc-peg`, `/api/cpn`) start with mock responses and are swapped to live data as sources become available.

## Out of Scope

- User accounts / authentication
- Real-time WebSocket streaming (use polling with reasonable intervals)
- Mobile app
- Email alerts / notifications
