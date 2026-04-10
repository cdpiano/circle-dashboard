import { NextResponse } from 'next/server';

const CG_KEY = process.env.COINGECKO_API_KEY;

const STABLECOINS = [
  { id: 'tether', symbol: 'USDT', color: '#26A17B' },
  { id: 'usd-coin', symbol: 'USDC', color: '#2775CA' },
  { id: 'dai', symbol: 'DAI', color: '#F5AC37' },
  { id: 'ethena-usde', symbol: 'USDe', color: '#8B5CF6' },
  { id: 'paypal-usd', symbol: 'PYUSD', color: '#003087' },
];

export async function GET() {
  try {
    const keyParam = CG_KEY ? `&x_cg_demo_api_key=${CG_KEY}` : '';

    // Fetch 12-month market cap history for each stablecoin in parallel
    const results = await Promise.all(
      STABLECOINS.map(async (coin) => {
        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=365&interval=daily${keyParam}`,
            { next: { revalidate: 3600 } }
          );
          const data = await res.json();
          return {
            ...coin,
            history: (data.market_caps || []).map(([ts, mcap]: [number, number]) => ({
              ts,
              date: new Date(ts).toISOString().split('T')[0],
              mcap,
            })),
          };
        } catch {
          return { ...coin, history: [] };
        }
      })
    );

    // Build monthly time series — aggregate to ~monthly data points
    const allDates = new Map<string, Record<string, number>>();

    for (const coin of results) {
      for (const point of coin.history) {
        // Use YYYY-MM as key for monthly aggregation
        const monthKey = point.date.slice(0, 7);
        if (!allDates.has(monthKey)) {
          allDates.set(monthKey, { ts: point.ts });
        }
        // Keep the last value in each month
        allDates.get(monthKey)![coin.symbol] = point.mcap;
      }
    }

    const history = Array.from(allDates.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({ month, ...values }));

    // Current shares from latest data
    const latest = history[history.length - 1] || {};
    const totalMcap = STABLECOINS.reduce((s, c) => s + ((latest[c.symbol] as number) || 0), 0);
    const currentShares = STABLECOINS.map((c) => ({
      symbol: c.symbol,
      color: c.color,
      mcap: (latest[c.symbol] as number) || 0,
      share: totalMcap > 0 ? (((latest[c.symbol] as number) || 0) / totalMcap) * 100 : 0,
    }));

    return NextResponse.json({
      history,
      currentShares,
      coins: STABLECOINS,
      source: 'coingecko',
    });
  } catch (error) {
    console.error('Competition API error:', error);
    return NextResponse.json({ history: [], currentShares: [], coins: STABLECOINS, source: 'fallback' });
  }
}
