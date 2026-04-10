import { NextResponse } from 'next/server';
import {
  getGrowthMetrics,
  getUsdcMintBurnData,
  getUsdcWhales,
  getSmartMoneyFlows,
  getCompanyOverview,
} from '@/lib/api';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'growth':
        const growth = await getGrowthMetrics();
        return NextResponse.json(growth);

      case 'mintburn':
        const days = parseInt(searchParams.get('days') || '30');
        const mintBurn = await getUsdcMintBurnData(days);
        return NextResponse.json(mintBurn);

      case 'whales':
        const whales = await getUsdcWhales();
        return NextResponse.json(whales);

      case 'smartmoney':
        const smartDays = parseInt(searchParams.get('days') || '7');
        const smartMoney = await getSmartMoneyFlows(smartDays);
        return NextResponse.json(smartMoney);

      case 'valuation':
        const symbol = searchParams.get('symbol') || 'CRCL';
        const valuation = await getCompanyOverview(symbol);
        return NextResponse.json(valuation);

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    );
  }
}
