import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'quote';
  const range = searchParams.get('range') || '3M';

  try {
    if (type === 'quote') {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=CRCL&token=${FINNHUB_KEY}`,
        { next: { revalidate: 60 } }
      );
      const data = await res.json();

      if (!data.c || data.c === 0) throw new Error('No quote data');

      return NextResponse.json({
        success: true,
        data: {
          symbol: 'CRCL',
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc,
          volume: 0,
          marketCap: 0,
          timestamp: data.t * 1000,
        },
        source: 'finnhub',
      });
    }

    if (type === 'history') {
      const outputSize = range === '1Y' || range === 'ALL' ? 'full' : 'compact';
      const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=CRCL&apikey=${AV_KEY}&outputsize=${outputSize}`,
        { next: { revalidate: 3600 } }
      );
      const data = await res.json();
      const timeSeries = data['Time Series (Daily)'];

      if (!timeSeries) throw new Error('No history data');

      const days = rangeToDays(range);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const candles = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          time: date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .filter((c) => new Date(c.time) >= cutoff)
        .sort((a, b) => a.time.localeCompare(b.time));

      return NextResponse.json({ success: true, data: candles, source: 'alphavantage' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Stock API error:', error);
    // Return mock fallback
    const { mockStockQuote, mockCandleData } = await import('@/lib/mock-data');
    if (type === 'quote') {
      return NextResponse.json({ success: true, data: mockStockQuote, source: 'fallback' });
    }
    return NextResponse.json({ success: true, data: mockCandleData, source: 'fallback' });
  }
}

function rangeToDays(range: string): number {
  switch (range) {
    case '1D': return 1;
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '1Y': return 365;
    case 'ALL': return 9999;
    default: return 90;
  }
}
