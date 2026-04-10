import { NextResponse } from 'next/server';
import { getUsdcDefiDistribution, getUsdcChainDistribution } from '@/lib/api';


export async function GET() {
  try {
    const [protocols, chains] = await Promise.all([
      getUsdcDefiDistribution(),
      getUsdcChainDistribution(),
    ]);

    return NextResponse.json({
      protocols,
      chains,
    });
  } catch (error) {
    console.error('DeFi API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DeFi data' },
      { status: 500 },
    );
  }
}
