import { NextResponse } from 'next/server';
import { getAllMacroRates } from '@/lib/api';

export async function GET() {
  try {
    const rates = await getAllMacroRates();
    return NextResponse.json(rates.slice(0, 2)); // Return Fed Funds and 10Y Treasury
  } catch (error) {
    console.error('Macro API error:', error);
    // Fallback to reasonable current rates if FRED API fails
    return NextResponse.json([
      { name: 'Federal Funds Rate', value: 5.33, change: 0.0, unit: '%' },
      { name: '10-Year Treasury', value: 4.21, change: -0.05, unit: '%' },
    ]);
  }
}
