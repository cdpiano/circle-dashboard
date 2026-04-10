# Circle Dashboard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the circle-dashboard into a dense Bloomberg-style single-page instrument panel with 12 modules, dark/light theme toggle, and 6-column CSS Grid layout.

**Architecture:** Replace the current 2-column layout with a 6-column CSS Grid. Add dark/light theme via CSS custom properties + React context. Consolidate existing components into 12 focused modules, add 2 new ones (USDC Peg, CPN Volume). All modules start with mock data.

**Tech Stack:** Next.js 16, Tailwind CSS 4, Recharts, lightweight-charts, lucide-react, clsx

**Spec:** `docs/superpowers/specs/2026-04-10-circle-dashboard-redesign.md`

---

## File Structure

### New Files
- `components/theme/ThemeProvider.tsx` — React context for dark/light toggle
- `components/theme/ThemeToggle.tsx` — Toggle button component
- `components/dashboard/DashboardGrid.tsx` — 6-column CSS Grid wrapper
- `components/dashboard/GridCard.tsx` — Unified card component with grid span props
- `components/dashboard/StockPrice.tsx` — Module 1: CRCL stock price + K-line
- `components/dashboard/UsdcCirculation.tsx` — Module 2: USDC flow + mini chart
- `components/dashboard/MintBurn.tsx` — Module 3: Mint/Burn net flow
- `components/dashboard/UsdcPeg.tsx` — Module 4: Premium/Discount (NEW)
- `components/dashboard/CpnVolume.tsx` — Module 5: CPN transaction volume (NEW)
- `components/dashboard/OnchainVolume.tsx` — Module 6: On-chain USDC tx volume
- `components/dashboard/DefiDistribution.tsx` — Module 7: DeFi TVL distribution
- `components/dashboard/NewsFeed.tsx` — Module 8: News scrollable list
- `components/dashboard/FinancialMetrics.tsx` — Module 9: Revenue + Margin + KPIs
- `components/dashboard/StablecoinCompetition.tsx` — Module 10: Market share donut
- `components/dashboard/Legislation.tsx` — Module 11: Regulatory timeline
- `components/dashboard/ReserveVsRate.tsx` — Module 12: Dual-axis yield chart
- `app/api/usdc-peg/route.ts` — New API route for USDC peg data
- `app/api/cpn/route.ts` — New API route for CPN volume data

### Modified Files
- `app/globals.css` — Add dark theme CSS variables
- `app/layout.tsx` — Wrap with ThemeProvider
- `app/page.tsx` — Replace layout with DashboardGrid + 12 modules
- `lib/mock-data.ts` — Add mock data for USDC peg and CPN
- `lib/types.ts` — Add UsdcPegData and CpnVolumeData types
- `components/layout/Header.tsx` — Add theme toggle, update styling

### Files to Delete (after migration complete)
- `components/analytics/GrowthMetrics.tsx`
- `components/analytics/WhaleTracking.tsx`
- `components/analytics/ValuationMetrics.tsx`
- `components/analytics/RevenuePerUsdc.tsx`
- `components/analytics/MintBurnTrend.tsx`
- `components/valuation/PeerComparison.tsx`
- `components/macro/MacroRates.tsx`
- `components/onchain/OnchainStats.tsx`
- `components/stock/PriceHero.tsx`
- `components/stock/StockChart.tsx`
- `components/usdc/UsdcStats.tsx`
- `components/usdc/UsdcTrendChart.tsx`
- `components/usdc/ChainDistribution.tsx`
- `components/financials/KeyMetrics.tsx`
- `components/competition/StablecoinCompetition.tsx`
- `components/defi/DefiDistribution.tsx`
- `components/news/NewsFeed.tsx`
- `components/regulatory/RegulatoryTracker.tsx`

---

## Task 1: Theme System — CSS Variables + Provider

**Files:**
- Modify: `app/globals.css`
- Create: `components/theme/ThemeProvider.tsx`
- Create: `components/theme/ThemeToggle.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add dark theme CSS variables to globals.css**

Replace the `:root` block and add a `[data-theme="dark"]` block in `app/globals.css`:

```css
:root {
  --background: #FAFAFA;
  --foreground: #111827;
  --card: #FFFFFF;
  --card-border: #E5E7EB;
  --primary: #0052FF;
  --primary-light: #EBF0FF;
  --green: #00C853;
  --green-light: #E8F5E9;
  --red: #FF1744;
  --red-light: #FFF0F0;
  --muted: #6B7280;
  --muted-light: #F9FAFB;
  --border: #E5E7EB;
}

[data-theme="dark"] {
  --background: #0B0F1A;
  --foreground: #E5E7EB;
  --card: #131929;
  --card-border: #1E293B;
  --primary: #3B82F6;
  --primary-light: #1E3A5F;
  --green: #22C55E;
  --green-light: #14532D;
  --red: #EF4444;
  --red-light: #7F1D1D;
  --muted: #94A3B8;
  --muted-light: #1E293B;
  --border: #1E293B;
}
```

Also update `.dashboard-card:hover` shadow for dark mode:

```css
[data-theme="dark"] .dashboard-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .skeleton {
  background: linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: #475569;
}
[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}
```

- [ ] **Step 2: Create ThemeProvider**

Create `components/theme/ThemeProvider.tsx`:

```tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('circle-theme') as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('circle-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 3: Create ThemeToggle button**

Create `components/theme/ThemeToggle.tsx`:

```tsx
'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[var(--muted-light)] transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-[var(--muted)]" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--muted)]" />
      )}
    </button>
  );
}
```

- [ ] **Step 4: Wrap layout with ThemeProvider**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circle Signal | CRCL & USDC Analytics",
  description: "Real-time Circle market signals: USDC metrics, financials, on-chain analytics, and regulatory tracking.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify theme toggle works**

Run: `cd ~/Desktop/projects/circle-dashboard && npm run dev`

Open http://localhost:3000, verify:
- Page loads with dark theme by default
- No hydration errors in console
- Theme toggle button works (if Header already has it — otherwise just verify no errors)

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/theme/ app/globals.css app/layout.tsx
git commit -m "feat: add dark/light theme system with CSS variables and React context"
```

---

## Task 2: Grid Infrastructure — DashboardGrid + GridCard

**Files:**
- Create: `components/dashboard/DashboardGrid.tsx`
- Create: `components/dashboard/GridCard.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add grid CSS to globals.css**

Append to `app/globals.css`:

```css
/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 280px;
  gap: 12px;
  padding: 12px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 1439px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 260px;
  }
}

@media (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 280px;
  }
}

@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
}
```

- [ ] **Step 2: Create DashboardGrid wrapper**

Create `components/dashboard/DashboardGrid.tsx`:

```tsx
import { ReactNode } from 'react';

export default function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-grid">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create GridCard component**

Create `components/dashboard/GridCard.tsx`:

```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GridCardProps {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

const colSpanMap: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
};

const rowSpanMap: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
};

export default function GridCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
}: GridCardProps) {
  return (
    <div
      className={cn(
        'dashboard-card overflow-hidden flex flex-col',
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/DashboardGrid.tsx components/dashboard/GridCard.tsx app/globals.css
git commit -m "feat: add 6-column CSS grid infrastructure with GridCard component"
```

---

## Task 3: Types + Mock Data for New Modules

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/mock-data.ts`

- [ ] **Step 1: Add new types**

Append to `lib/types.ts`:

```typescript
// USDC Peg (Premium/Discount) data
export interface UsdcPegData {
  currentPrice: number;
  deviation: number; // e.g., +0.0003 or -0.0012
  status: 'normal' | 'watch' | 'depeg-risk';
  history: { date: string; deviation: number }[];
}

// CPN (Circle Payments Network) data
export interface CpnVolumeData {
  currentMonthVolume: number;
  momGrowth: number;
  history: { month: string; volume: number }[];
}

// Reserve vs Fed Rate data
export interface ReserveVsRateData {
  quarters: {
    quarter: string;
    fedRate: number;
    reserveYield: number;
    spread: number;
  }[];
}
```

- [ ] **Step 2: Add mock data for new types**

Append to `lib/mock-data.ts`:

```typescript
import { UsdcPegData, CpnVolumeData, ReserveVsRateData } from './types';

export const mockUsdcPegData: UsdcPegData = {
  currentPrice: 1.0003,
  deviation: 0.0003,
  status: 'normal',
  history: (() => {
    const data: { date: string; deviation: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        deviation: parseFloat(((Math.random() - 0.5) * 0.001).toFixed(5)),
      });
    }
    return data;
  })(),
};

export const mockCpnVolumeData: CpnVolumeData = {
  currentMonthVolume: 2_400_000_000,
  momGrowth: 18.5,
  history: [
    { month: '2025-10', volume: 850_000_000 },
    { month: '2025-11', volume: 1_100_000_000 },
    { month: '2025-12', volume: 1_400_000_000 },
    { month: '2026-01', volume: 1_700_000_000 },
    { month: '2026-02', volume: 2_050_000_000 },
    { month: '2026-03', volume: 2_400_000_000 },
  ],
};

export const mockReserveVsRateData: ReserveVsRateData = {
  quarters: [
    { quarter: 'Q1 2024', fedRate: 5.33, reserveYield: 5.10, spread: -0.23 },
    { quarter: 'Q2 2024', fedRate: 5.33, reserveYield: 5.15, spread: -0.18 },
    { quarter: 'Q3 2024', fedRate: 5.00, reserveYield: 4.85, spread: -0.15 },
    { quarter: 'Q4 2024', fedRate: 4.50, reserveYield: 4.40, spread: -0.10 },
    { quarter: 'Q1 2025', fedRate: 4.25, reserveYield: 4.18, spread: -0.07 },
    { quarter: 'Q2 2025', fedRate: 4.00, reserveYield: 3.95, spread: -0.05 },
    { quarter: 'Q3 2025', fedRate: 3.75, reserveYield: 3.72, spread: -0.03 },
    { quarter: 'Q4 2025', fedRate: 3.50, reserveYield: 3.48, spread: -0.02 },
  ],
};
```

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add lib/types.ts lib/mock-data.ts
git commit -m "feat: add types and mock data for USDC peg, CPN volume, and reserve vs rate"
```

---

## Task 4: New API Routes

**Files:**
- Create: `app/api/usdc-peg/route.ts`
- Create: `app/api/cpn/route.ts`

- [ ] **Step 1: Create USDC peg API route**

Create `app/api/usdc-peg/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { mockUsdcPegData } from '@/lib/mock-data';

export async function GET() {
  try {
    // TODO: Replace with CoinGecko / DEX price feed when ready
    return NextResponse.json({
      success: true,
      data: mockUsdcPegData,
      source: 'mock',
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: mockUsdcPegData,
      source: 'fallback',
    });
  }
}
```

- [ ] **Step 2: Create CPN volume API route**

Create `app/api/cpn/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { mockCpnVolumeData } from '@/lib/mock-data';

export async function GET() {
  try {
    // TODO: Replace with Circle quarterly report data when available
    return NextResponse.json({
      success: true,
      data: mockCpnVolumeData,
      source: 'mock',
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: mockCpnVolumeData,
      source: 'fallback',
    });
  }
}
```

- [ ] **Step 3: Verify routes return data**

Run: `cd ~/Desktop/projects/circle-dashboard && npm run dev`

Test:
- `curl http://localhost:3000/api/usdc-peg` — should return JSON with peg data
- `curl http://localhost:3000/api/cpn` — should return JSON with CPN data

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add app/api/usdc-peg/route.ts app/api/cpn/route.ts
git commit -m "feat: add API routes for USDC peg and CPN volume data"
```

---

## Task 5: Header Update

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Update Header with theme toggle and new branding**

Rewrite `components/layout/Header.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { formatCurrency } from '@/lib/utils';

export default function Header() {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/stock?type=quote');
        const data = await res.json();
        if (data.success && data.data) {
          setPrice(data.data.price);
          setChange(data.data.changePercent);
        }
      } catch { /* use existing values */ }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-[1600px] mx-auto px-3 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-semibold text-[var(--foreground)]">Circle Signal</span>
          {price !== null && (
            <div className="flex items-center gap-2 ml-4 text-sm">
              <span className="font-mono font-medium text-[var(--foreground)]">
                CRCL {formatCurrency(price)}
              </span>
              <span
                className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                  change >= 0
                    ? 'bg-[var(--green-light)] text-[var(--green)]'
                    : 'bg-[var(--red-light)] text-[var(--red)]'
                }`}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify header renders correctly in both themes**

Run dev server, check:
- Compact 48px height header
- "Circle Signal" branding with Activity icon
- CRCL price ticker
- Theme toggle works
- Sticky on scroll

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/layout/Header.tsx
git commit -m "feat: update header with compact design, theme toggle, and price ticker"
```

---

## Task 6: Module 1 — Stock Price (3col x 2row)

**Files:**
- Create: `components/dashboard/StockPrice.tsx`

- [ ] **Step 1: Build the StockPrice module**

Create `components/dashboard/StockPrice.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { mockStockQuote, mockCandleData } from '@/lib/mock-data';
import type { StockQuote, CandleData } from '@/lib/types';

const RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const;

export default function StockPrice() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState<StockQuote>(mockStockQuote);
  const [range, setRange] = useState<string>('3M');
  const [candles, setCandles] = useState<CandleData[]>(mockCandleData);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/stock?type=quote');
        const data = await res.json();
        if (data.success && data.data) setQuote(data.data);
      } catch { /* keep mock */ }
    };
    fetchQuote();
    const interval = setInterval(fetchQuote, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/stock?type=history&range=${range}`);
        const data = await res.json();
        if (data.success && data.data) setCandles(data.data);
      } catch { /* keep mock */ }
    };
    fetchHistory();
  }, [range]);

  useEffect(() => {
    if (!chartRef.current) return;

    let chart: ReturnType<typeof import('lightweight-charts').createChart> | null = null;

    const initChart = async () => {
      const { createChart, ColorType } = await import('lightweight-charts');

      if (!chartRef.current) return;
      chartRef.current.innerHTML = '';

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      chart = createChart(chartRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isDark ? '#94A3B8' : '#6B7280',
        },
        grid: {
          vertLines: { color: isDark ? '#1E293B' : '#F3F4F6' },
          horzLines: { color: isDark ? '#1E293B' : '#F3F4F6' },
        },
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        timeScale: { borderColor: isDark ? '#1E293B' : '#E5E7EB' },
        rightPriceScale: { borderColor: isDark ? '#1E293B' : '#E5E7EB' },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderUpColor: '#22C55E',
        borderDownColor: '#EF4444',
        wickUpColor: '#22C55E',
        wickDownColor: '#EF4444',
      });

      candleSeries.setData(candles as any);
      chart.timeScale().fitContent();
    };

    initChart();

    const handleResize = () => {
      if (chart && chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart?.remove();
    };
  }, [candles]);

  const isUp = quote.changePercent >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* Price header */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-bold font-mono text-[var(--foreground)]">
          {formatCurrency(quote.price)}
        </span>
        <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-mono">
            {isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </span>
        </div>
        <span className="text-xs text-[var(--muted)] ml-auto">
          MCap {formatCurrency(quote.marketCap, 1)} · Vol {formatNumber(quote.volume, 1)}
        </span>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="flex-1 min-h-0" />

      {/* Range selector */}
      <div className="flex gap-1 mt-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              range === r
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--muted)] hover:bg-[var(--muted-light)]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/StockPrice.tsx
git commit -m "feat: add StockPrice module with lightweight-charts candlestick"
```

---

## Task 7: Modules 2-7 — Small/Medium Data Cards

**Files:**
- Create: `components/dashboard/UsdcCirculation.tsx`
- Create: `components/dashboard/MintBurn.tsx`
- Create: `components/dashboard/UsdcPeg.tsx`
- Create: `components/dashboard/CpnVolume.tsx`
- Create: `components/dashboard/OnchainVolume.tsx`
- Create: `components/dashboard/DefiDistribution.tsx`

- [ ] **Step 1: Create UsdcCirculation module**

Create `components/dashboard/UsdcCirculation.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Coins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockUsdcData } from '@/lib/mock-data';

export default function UsdcCirculation() {
  const [data, setData] = useState(mockUsdcData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/usdc');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const change = data.marketCapChange24h;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">USDC Supply</span>
      </div>
      <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(data.circulatingSupply, 1)}
      </div>
      <div className={`text-sm font-mono mt-1 ${change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}% MoM
      </div>
      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.marketCapHistory}>
            <defs>
              <linearGradient id="usdcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#usdcGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MintBurn module**

Create `components/dashboard/MintBurn.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MintBurnDay {
  date: string;
  mint: number;
  burn: number;
  net: number;
}

export default function MintBurn() {
  const [data, setData] = useState<MintBurnDay[]>([]);
  const [netFlow, setNetFlow] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics?type=mintburn&days=30');
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          const total = json.data.reduce((sum: number, d: MintBurnDay) => sum + d.net, 0);
          setNetFlow(total);
        }
      } catch {
        // Generate mock
        const mock: MintBurnDay[] = [];
        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const mint = Math.random() * 500_000_000;
          const burn = Math.random() * 400_000_000;
          mock.push({
            date: d.toISOString().split('T')[0],
            mint,
            burn: -burn,
            net: mint - burn,
          });
        }
        setData(mock);
        setNetFlow(mock.reduce((s, d) => s + d.net, 0));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpDown className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Mint / Burn</span>
      </div>
      <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(Math.abs(netFlow), 1)}
      </div>
      <div className={`text-sm font-mono mt-1 ${netFlow >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        Net {netFlow >= 0 ? 'Mint' : 'Burn'} (30d)
      </div>
      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="net" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.net >= 0 ? 'var(--green)' : 'var(--red)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create UsdcPeg module**

Create `components/dashboard/UsdcPeg.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Shield } from 'lucide-react';
import { mockUsdcPegData } from '@/lib/mock-data';
import type { UsdcPegData } from '@/lib/types';

const STATUS_COLORS = {
  normal: 'var(--green)',
  watch: '#EAB308',
  'depeg-risk': 'var(--red)',
};

const STATUS_LABELS = {
  normal: 'Stable',
  watch: 'Watch',
  'depeg-risk': 'Risk',
};

export default function UsdcPeg() {
  const [data, setData] = useState<UsdcPegData>(mockUsdcPegData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/usdc-peg');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const color = STATUS_COLORS[data.status];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">USDC Peg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-medium" style={{ color }}>{STATUS_LABELS[data.status]}</span>
        </div>
      </div>
      <div className="text-xl font-bold font-mono text-[var(--foreground)]">
        {data.deviation >= 0 ? '+' : ''}{data.deviation.toFixed(4)}
      </div>
      <div className="text-xs text-[var(--muted)] mt-0.5">${data.currentPrice.toFixed(4)}</div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.history}>
            <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="deviation" stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create CpnVolume module**

Create `components/dashboard/CpnVolume.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Network } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockCpnVolumeData } from '@/lib/mock-data';
import type { CpnVolumeData } from '@/lib/types';

export default function CpnVolume() {
  const [data, setData] = useState<CpnVolumeData>(mockCpnVolumeData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/cpn');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1">
        <Network className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">CPN Volume</span>
      </div>
      <div className="text-xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(data.currentMonthVolume, 1)}
      </div>
      <div className={`text-xs font-mono mt-0.5 ${data.momGrowth >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        {data.momGrowth >= 0 ? '+' : ''}{data.momGrowth.toFixed(1)}% MoM
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.history}>
            <Bar dataKey="volume" fill="var(--primary)" radius={[2, 2, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create OnchainVolume module**

Create `components/dashboard/OnchainVolume.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { mockOnchainData } from '@/lib/mock-data';

export default function OnchainVolume() {
  const [supply, setSupply] = useState(mockOnchainData.totalSupplyFormatted);
  const [transfers, setTransfers] = useState(mockOnchainData.transfers24h);
  const [holders, setHolders] = useState(mockOnchainData.holderCount);
  const [trend, setTrend] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/onchain');
        const json = await res.json();
        if (json.success && json.data) {
          setSupply(json.data.totalSupplyFormatted);
          setTransfers(json.data.transfers24h);
          setHolders(json.data.holderCount);
        }
      } catch { /* keep mock */ }
    };
    fetchData();

    // Generate trend data
    const t: { date: string; value: number }[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      t.push({ date: d.toISOString().split('T')[0], value: 150_000 + Math.random() * 80_000 });
    }
    setTrend(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">On-Chain</span>
      </div>
      <div className="text-lg font-bold font-mono text-[var(--foreground)]">
        {formatNumber(transfers, 0)} txns
      </div>
      <div className="text-xs text-[var(--muted)] mt-0.5">
        {formatNumber(holders, 1)} holders
      </div>
      <div className="flex-1 min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create DefiDistribution module**

Create `components/dashboard/DefiDistribution.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Protocol {
  name: string;
  usdcAmount: number;
  share: number;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#6B7280'];

export default function DefiDistribution() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [totalTvl, setTotalTvl] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/defi');
        const json = await res.json();
        if (json.success && json.data?.protocols) {
          const sorted = json.data.protocols
            .sort((a: Protocol, b: Protocol) => b.usdcAmount - a.usdcAmount)
            .slice(0, 5);
          setProtocols(sorted);
          setTotalTvl(json.data.protocols.reduce((s: number, p: Protocol) => s + p.usdcAmount, 0));
        }
      } catch {
        const mock: Protocol[] = [
          { name: 'Aave', usdcAmount: 4_200_000_000, share: 35 },
          { name: 'Compound', usdcAmount: 2_800_000_000, share: 23 },
          { name: 'MakerDAO', usdcAmount: 2_100_000_000, share: 18 },
          { name: 'Curve', usdcAmount: 1_500_000_000, share: 12 },
          { name: 'Other', usdcAmount: 1_400_000_000, share: 12 },
        ];
        setProtocols(mock);
        setTotalTvl(12_000_000_000);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">DeFi TVL</span>
        </div>
        <span className="text-xs font-mono font-medium text-[var(--foreground)]">
          {formatCurrency(totalTvl, 1)}
        </span>
      </div>
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex mt-1">
        {protocols.map((p, i) => (
          <div
            key={p.name}
            style={{ width: `${p.share}%`, backgroundColor: COLORS[i] }}
            className="h-full"
          />
        ))}
      </div>
      {/* Legend */}
      <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
        {protocols.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-[var(--foreground)]">{p.name}</span>
            </div>
            <span className="font-mono text-[var(--muted)]">{formatCurrency(p.usdcAmount, 1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/UsdcCirculation.tsx components/dashboard/MintBurn.tsx components/dashboard/UsdcPeg.tsx components/dashboard/CpnVolume.tsx components/dashboard/OnchainVolume.tsx components/dashboard/DefiDistribution.tsx
git commit -m "feat: add 6 data card modules — USDC, MintBurn, Peg, CPN, OnChain, DeFi"
```

---

## Task 8: Module 8 — News Feed (2col x 2row)

**Files:**
- Create: `components/dashboard/NewsFeed.tsx`

- [ ] **Step 1: Build NewsFeed module**

Create `components/dashboard/NewsFeed.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import type { NewsItem } from '@/lib/types';

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const json = await res.json();
        if (json.success && json.data) setNews(json.data.slice(0, 15));
      } catch { /* keep empty */ }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 600_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">News</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg hover:bg-[var(--muted-light)] transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-[var(--foreground)] leading-tight line-clamp-2 group-hover:text-[var(--primary)]">
                {item.title}
              </h4>
              <ExternalLink className="w-3 h-3 text-[var(--muted)] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--muted)]">{item.source}</span>
              <span className="text-xs text-[var(--muted)]">·</span>
              <span className="text-xs text-[var(--muted)]">{formatTimeAgo(item.publishedAt)}</span>
            </div>
          </a>
        ))}
        {news.length === 0 && (
          <div className="text-sm text-[var(--muted)] text-center py-8">Loading news...</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/NewsFeed.tsx
git commit -m "feat: add scrollable NewsFeed module"
```

---

## Task 9: Module 9 — Financial Metrics (3col x 1row)

**Files:**
- Create: `components/dashboard/FinancialMetrics.tsx`

- [ ] **Step 1: Build FinancialMetrics module**

Create `components/dashboard/FinancialMetrics.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockFinancialMetrics, mockQuarterlyRevenue } from '@/lib/mock-data';
import type { FinancialMetrics as FinancialMetricsType, QuarterlyRevenue } from '@/lib/types';

export default function FinancialMetrics() {
  const [metrics, setMetrics] = useState<FinancialMetricsType>(mockFinancialMetrics);
  const [quarterly, setQuarterly] = useState<QuarterlyRevenue[]>(mockQuarterlyRevenue);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/financials');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.metrics) setMetrics(json.data.metrics);
          if (json.data.quarterly) setQuarterly(json.data.quarterly);
        }
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Financials</span>
        <span className="text-xs text-[var(--muted)] ml-auto">{metrics.period}</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Revenue chart */}
        <div className="flex-1 flex flex-col">
          <span className="text-xs text-[var(--muted)] mb-1">Revenue (Quarterly)</span>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterly}>
                <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [formatCurrency(val), '']}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[3, 3, 0, 0]} opacity={0.8} />
                <Bar dataKey="netIncome" fill="var(--green)" radius={[3, 3, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPIs */}
        <div className="w-40 flex flex-col justify-center gap-3">
          <div>
            <div className="text-xs text-[var(--muted)]">Revenue</div>
            <div className="text-lg font-bold font-mono text-[var(--foreground)]">
              {formatCurrency(metrics.revenue, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">Net Income</div>
            <div className="text-lg font-bold font-mono text-[var(--foreground)]">
              {formatCurrency(metrics.netIncome, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">YoY Growth</div>
            <div className={`text-lg font-bold font-mono ${metrics.revenueGrowth >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              +{metrics.revenueGrowth.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/FinancialMetrics.tsx
git commit -m "feat: add FinancialMetrics module with revenue chart and KPIs"
```

---

## Task 10: Modules 10-12 — Competition, Legislation, Reserve vs Rate

**Files:**
- Create: `components/dashboard/StablecoinCompetition.tsx`
- Create: `components/dashboard/Legislation.tsx`
- Create: `components/dashboard/ReserveVsRate.tsx`

- [ ] **Step 1: Create StablecoinCompetition module**

Create `components/dashboard/StablecoinCompetition.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import { mockStablecoinComparison } from '@/lib/mock-data';
import type { StablecoinComparison } from '@/lib/types';

const COLORS = ['#EF4444', '#3B82F6', '#8B5CF6', '#6B7280'];

export default function StablecoinCompetition() {
  const [data, setData] = useState<StablecoinComparison[]>(mockStablecoinComparison);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/competition');
        const json = await res.json();
        if (json.success && json.data?.stablecoins) setData(json.data.stablecoins);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const usdcShare = data.find((d) => d.symbol === 'USDC')?.share ?? 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Market Share</span>
      </div>

      <div className="flex items-center gap-4 flex-1 min-h-0">
        {/* Donut */}
        <div className="w-28 h-28 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="share"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold font-mono text-[var(--foreground)]">{usdcShare.toFixed(1)}%</span>
            <span className="text-xs text-[var(--muted)]">USDC</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {data.map((item, i) => (
            <div key={item.symbol} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[var(--foreground)]">{item.symbol}</span>
              </div>
              <span className="font-mono text-[var(--muted)]">{item.share.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Legislation module**

Create `components/dashboard/Legislation.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';

interface RegulatoryItem {
  title: string;
  region: string;
  status: 'positive' | 'neutral' | 'negative' | 'pending';
  impact: 'high' | 'medium' | 'low';
  date: string;
  description: string;
}

const STATUS_COLORS: Record<string, string> = {
  positive: 'bg-[var(--green-light)] text-[var(--green)]',
  neutral: 'bg-[var(--muted-light)] text-[var(--muted)]',
  negative: 'bg-[var(--red-light)] text-[var(--red)]',
  pending: 'bg-amber-500/10 text-amber-500',
};

const STATUS_LABELS: Record<string, string> = {
  positive: 'Passed',
  neutral: 'Neutral',
  negative: 'Blocked',
  pending: 'Pending',
};

export default function Legislation() {
  const [items, setItems] = useState<RegulatoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/regulatory');
        const json = await res.json();
        if (json.success && json.data) {
          const flat = Object.values(json.data).flat() as RegulatoryItem[];
          flat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setItems(flat.slice(0, 8));
        }
      } catch { /* keep empty */ }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Legislation</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--muted-light)] transition-colors">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--foreground)] leading-tight line-clamp-1">{item.title}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{item.region} · {item.date}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-[var(--muted)] text-center py-8">Loading...</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ReserveVsRate module**

Create `components/dashboard/ReserveVsRate.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { mockReserveVsRateData } from '@/lib/mock-data';

export default function ReserveVsRate() {
  const [data] = useState(mockReserveVsRateData.quarters);

  const latestSpread = data[data.length - 1]?.spread ?? 0;
  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Reserve Yield vs Fed Rate</span>
        <span className="text-xs font-mono text-[var(--muted)] ml-auto">
          Spread: <span className={latestSpread >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
            {latestSpread >= 0 ? '+' : ''}{(latestSpread * 100).toFixed(0)}bps
          </span>
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(val: number, name: string) => [`${val.toFixed(2)}%`, name === 'fedRate' ? 'Fed Rate' : 'Reserve Yield']}
            />
            <Line type="monotone" dataKey="fedRate" stroke="var(--red)" strokeWidth={2} dot={{ r: 3 }} name="fedRate" />
            <Line type="monotone" dataKey="reserveYield" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="reserveYield" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add components/dashboard/StablecoinCompetition.tsx components/dashboard/Legislation.tsx components/dashboard/ReserveVsRate.tsx
git commit -m "feat: add Competition, Legislation, and ReserveVsRate modules"
```

---

## Task 11: Wire Everything — page.tsx Grid Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace page.tsx with grid layout**

Rewrite `app/page.tsx`:

```tsx
import Header from '@/components/layout/Header';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import GridCard from '@/components/dashboard/GridCard';
import StockPrice from '@/components/dashboard/StockPrice';
import UsdcCirculation from '@/components/dashboard/UsdcCirculation';
import MintBurn from '@/components/dashboard/MintBurn';
import UsdcPeg from '@/components/dashboard/UsdcPeg';
import CpnVolume from '@/components/dashboard/CpnVolume';
import OnchainVolume from '@/components/dashboard/OnchainVolume';
import DefiDistribution from '@/components/dashboard/DefiDistribution';
import NewsFeed from '@/components/dashboard/NewsFeed';
import FinancialMetrics from '@/components/dashboard/FinancialMetrics';
import StablecoinCompetition from '@/components/dashboard/StablecoinCompetition';
import Legislation from '@/components/dashboard/Legislation';
import ReserveVsRate from '@/components/dashboard/ReserveVsRate';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="py-2">
        <DashboardGrid>
          {/* Row 1-2: Stock (3x2) + Medium cards (1x1 each) + News (2x2) */}
          <GridCard colSpan={3} rowSpan={2}>
            <StockPrice />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <UsdcCirculation />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <MintBurn />
          </GridCard>
          <GridCard colSpan={2} rowSpan={2}>
            <NewsFeed />
          </GridCard>

          {/* Row 2 continued: Small cards under USDC/MintBurn */}
          <GridCard colSpan={1} rowSpan={1}>
            <UsdcPeg />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <CpnVolume />
          </GridCard>

          {/* Row 3: Financials (3x1) + Competition (1x1) + Legislation (2x1) */}
          <GridCard colSpan={3} rowSpan={1}>
            <FinancialMetrics />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <StablecoinCompetition />
          </GridCard>
          <GridCard colSpan={2} rowSpan={1}>
            <Legislation />
          </GridCard>

          {/* Row 4: Reserve vs Rate (4x1) + OnChain (1x1) + DeFi (1x1) */}
          <GridCard colSpan={4} rowSpan={1}>
            <ReserveVsRate />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <OnchainVolume />
          </GridCard>
          <GridCard colSpan={1} rowSpan={1}>
            <DefiDistribution />
          </GridCard>
        </DashboardGrid>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full layout**

Run: `cd ~/Desktop/projects/circle-dashboard && npm run dev`

Open http://localhost:3000 and verify:
- All 12 modules render in the 6-column grid
- Stock chart is 3x2 (top-left)
- News is 2x2 (top-right)
- Financial metrics spans 3 columns
- Reserve vs Rate spans 4 columns
- Theme toggle works in dark and light mode
- No console errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add app/page.tsx
git commit -m "feat: wire 12 modules into Bloomberg-style 6-column grid layout"
```

---

## Task 12: Cleanup — Remove Old Components

**Files:**
- Delete 18 old component files (listed in spec under "Components to Remove")
- Delete old component directories if empty

- [ ] **Step 1: Remove deprecated components**

```bash
cd ~/Desktop/projects/circle-dashboard
rm components/analytics/GrowthMetrics.tsx
rm components/analytics/WhaleTracking.tsx
rm components/analytics/ValuationMetrics.tsx
rm components/analytics/RevenuePerUsdc.tsx
rm components/analytics/MintBurnTrend.tsx
rm components/valuation/PeerComparison.tsx
rm components/macro/MacroRates.tsx
rm components/onchain/OnchainStats.tsx
rm components/stock/PriceHero.tsx
rm components/stock/StockChart.tsx
rm components/usdc/UsdcStats.tsx
rm components/usdc/UsdcTrendChart.tsx
rm components/usdc/ChainDistribution.tsx
rm components/financials/KeyMetrics.tsx
rm components/competition/StablecoinCompetition.tsx
rm components/defi/DefiDistribution.tsx
rm components/news/NewsFeed.tsx
rm components/regulatory/RegulatoryTracker.tsx
```

- [ ] **Step 2: Remove empty directories**

```bash
cd ~/Desktop/projects/circle-dashboard
rmdir components/analytics components/valuation components/macro components/onchain components/stock components/usdc components/financials components/competition components/defi components/news components/regulatory 2>/dev/null || true
```

- [ ] **Step 3: Verify build succeeds**

Run: `cd ~/Desktop/projects/circle-dashboard && npm run build`

Expected: Build succeeds with no import errors. If any file still imports a deleted component, fix the import.

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add -A
git commit -m "chore: remove deprecated components replaced by dashboard modules"
```

---

## Task 13: Polish — Responsive Breakpoints + Final Touches

**Files:**
- Modify: `app/globals.css`
- Modify: `components/dashboard/GridCard.tsx`

- [ ] **Step 1: Add responsive col-span overrides**

Add to `app/globals.css`:

```css
/* Responsive grid card overrides */
@media (max-width: 1439px) {
  .dashboard-grid > .col-span-3 { grid-column: span 2; }
  .dashboard-grid > .col-span-4 { grid-column: span 4; }
  .dashboard-grid > .row-span-2 { grid-row: span 2; }
}

@media (max-width: 1023px) {
  .dashboard-grid > .col-span-2,
  .dashboard-grid > .col-span-3,
  .dashboard-grid > .col-span-4,
  .dashboard-grid > .col-span-6 { grid-column: span 2; }
  .dashboard-grid > .row-span-2 { grid-row: span 1; }
}

@media (max-width: 767px) {
  .dashboard-grid > [class*="col-span-"],
  .dashboard-grid > [class*="row-span-"] {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

- [ ] **Step 2: Verify responsiveness**

Resize the browser to test:
- 1440px+: Full 6-column grid
- 1024-1439px: 4-column grid, cards reflow
- 768-1023px: 2-column grid
- <768px: Single column

- [ ] **Step 3: Run final build**

```bash
cd ~/Desktop/projects/circle-dashboard && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/projects/circle-dashboard
git add -A
git commit -m "feat: add responsive breakpoints for dense grid layout"
```
