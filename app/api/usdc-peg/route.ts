import { NextResponse } from 'next/server';
import { mockUsdcPegData } from '@/lib/mock-data';

const CG_KEY = process.env.COINGECKO_API_KEY;

export async function GET() {
  try {
    const keyParam = CG_KEY ? `&x_cg_demo_api_key=${CG_KEY}` : '';

    const priceRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd${keyParam}`,
      { next: { revalidate: 60 } }
    );
    const priceData = await priceRes.json();
    const currentPrice = priceData['usd-coin']?.usd ?? 1.0;
    const deviation = currentPrice - 1.0;

    const histRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/usd-coin/market_chart?vs_currency=usd&days=7&interval=daily${keyParam}`,
      { next: { revalidate: 300 } }
    );
    const histData = await histRes.json();

    const history = (histData.prices || []).map(([ts, price]: [number, number]) => ({
      date: new Date(ts).toISOString().split('T')[0],
      deviation: parseFloat((price - 1.0).toFixed(5)),
    }));

    const absDev = Math.abs(deviation);
    const status = absDev < 0.001 ? 'normal' : absDev < 0.005 ? 'watch' : 'depeg-risk';

    return NextResponse.json({
      success: true,
      data: { currentPrice, deviation, status, history },
      source: 'coingecko',
    });
  } catch (error) {
    console.error('USDC peg API error:', error);
    return NextResponse.json({
      success: true,
      data: mockUsdcPegData,
      source: 'fallback',
    });
  }
}
