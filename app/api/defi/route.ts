import { NextResponse } from 'next/server';

const PROTOCOLS = [
  { slug: 'aave', name: 'Aave' },
  { slug: 'compound-v3', name: 'Compound' },
  { slug: 'sky', name: 'Sky/Maker' },
  { slug: 'morpho', name: 'Morpho' },
  { slug: 'curve-dex', name: 'Curve' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      PROTOCOLS.map(async (proto) => {
        try {
          const res = await fetch(`https://api.llama.fi/protocol/${proto.slug}`, {
            next: { revalidate: 900 },
          });
          const data = await res.json();
          const tvlHistory = (data.tvl || []) as { date: number; totalLiquidityUSD: number }[];

          // Get monthly TVL for last 12 months
          const now = Date.now() / 1000;
          const oneYearAgo = now - 365 * 86400;
          const monthly = tvlHistory
            .filter((p) => p.date >= oneYearAgo)
            .reduce((acc, p) => {
              const d = new Date(p.date * 1000);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              acc.set(key, p.totalLiquidityUSD);
              return acc;
            }, new Map<string, number>());

          const currentTvl = tvlHistory.length > 0
            ? tvlHistory[tvlHistory.length - 1].totalLiquidityUSD
            : 0;

          return {
            name: proto.name,
            slug: proto.slug,
            currentTvl,
            monthly: Object.fromEntries(monthly),
          };
        } catch {
          return { name: proto.name, slug: proto.slug, currentTvl: 0, monthly: {} };
        }
      })
    );

    // Build time series for chart
    const allMonths = new Set<string>();
    for (const r of results) {
      Object.keys(r.monthly).forEach((m) => allMonths.add(m));
    }
    const sortedMonths = Array.from(allMonths).sort();

    const history = sortedMonths.map((month) => {
      const point: Record<string, any> = { month };
      for (const r of results) {
        point[r.name] = r.monthly[month] || 0;
      }
      return point;
    });

    // Current breakdown
    const totalTvl = results.reduce((s, r) => s + r.currentTvl, 0);
    const protocols = results
      .map((r) => ({
        name: r.name,
        tvl: r.currentTvl,
        share: totalTvl > 0 ? (r.currentTvl / totalTvl) * 100 : 0,
      }))
      .sort((a, b) => b.tvl - a.tvl);

    return NextResponse.json({
      protocols,
      history,
      totalTvl,
      source: 'defillama',
    });
  } catch (error) {
    console.error('DeFi API error:', error);
    return NextResponse.json({ protocols: [], history: [], totalTvl: 0, source: 'fallback' });
  }
}
