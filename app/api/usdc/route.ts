import { NextResponse } from 'next/server';
import { getUsdcMarketData, getStablecoinComparison } from '@/lib/api';
import { mockUsdcData, mockStablecoinComparison } from '@/lib/mock-data';

export async function GET() {
  try {
    const [usdcData, comparison] = await Promise.all([
      getUsdcMarketData().catch((err) => {
        console.error('CoinGecko USDC data error:', err);
        return null;
      }),
      getStablecoinComparison().catch((err) => {
        console.error('CoinGecko comparison data error:', err);
        return null;
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: usdcData || mockUsdcData,
      comparison: comparison || mockStablecoinComparison,
      source: usdcData ? 'coingecko' : 'fallback',
    });
  } catch (error) {
    console.error('USDC API error:', error);
    return NextResponse.json({
      success: true,
      data: mockUsdcData,
      comparison: mockStablecoinComparison,
      source: 'fallback',
    });
  }
}
