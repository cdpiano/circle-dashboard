import { NextResponse } from 'next/server';
import { getStockQuote, getMarketCap } from '@/lib/api/services/yahoo-finance';

export async function GET() {
  try {
    // Circle's data (based on FY2025 earnings report, will be updated with real-time price)
    const circle = {
      company: 'Circle',
      ticker: 'CRCL',
      price: 115.38,
      marketCap: 28_000_000_000, // ~$28B as of March 2026
      peRatio: null, // FY2025 had net loss of $70M (due to $424M IPO stock compensation)
      psRatio: 10.4, // $28B / $2.7B revenue = 10.4
      pbRatio: 3.2,
      revenue: 2_700_000_000, // FY2025: $2.7B
      netIncome: -70_000_000, // FY2025: -$70M (includes $424M IPO expense; adjusted +$354M)
      change1d: 1.05,
      sector: 'Fintech / Crypto Infrastructure',
    };

    let peers = [
      {
        company: 'Coinbase',
        ticker: 'COIN',
        price: 185.42,
        marketCap: 48_500_000_000,
        peRatio: 35.2,
        psRatio: 9.8,
        pbRatio: 2.9,
        revenue: 5_900_000_000,
        netIncome: 1_380_000_000,
        change1d: 1.25,
        sector: 'Crypto Exchange',
      },
      {
        company: 'Block (Square)',
        ticker: 'SQ',
        price: 78.25,
        marketCap: 47_200_000_000,
        peRatio: 52.8,
        psRatio: 1.8,
        pbRatio: 2.1,
        revenue: 25_400_000_000,
        netIncome: 894_000_000,
        change1d: -0.45,
        sector: 'Payment Processing',
      },
      {
        company: 'PayPal',
        ticker: 'PYPL',
        price: 72.15,
        marketCap: 76_800_000_000,
        peRatio: 15.2,
        psRatio: 2.3,
        pbRatio: 3.5,
        revenue: 33_800_000_000,
        netIncome: 5_050_000_000,
        change1d: 0.68,
        sector: 'Payment Processing',
      },
      {
        company: 'Robinhood',
        ticker: 'HOOD',
        price: 73.39,
        marketCap: 68_000_000_000,
        peRatio: 28.5,
        psRatio: 14.8,
        pbRatio: 3.8,
        revenue: 2_530_000_000,
        netIncome: 1_320_000_000,
        change1d: -3.59,
        sector: 'Brokerage / Fintech',
      },
      {
        company: 'Stripe',
        ticker: 'STRP',
        price: 95.0,
        marketCap: 95_000_000_000,
        peRatio: null,
        psRatio: 13.2,
        pbRatio: null,
        revenue: 7_200_000_000,
        netIncome: 1_150_000_000,
        change1d: 0.0,
        sector: 'Payment Processing (Private)',
      },
    ];

    // Try to fetch real-time stock prices and market caps from Yahoo Finance API
    try {
      const tickers = ['COIN', 'SQ', 'PYPL', 'HOOD', 'CRCL'];

      for (const ticker of tickers) {
        try {
          const [quote, marketCap] = await Promise.all([
            getStockQuote(ticker),
            getMarketCap(ticker),
          ]);

          if (ticker === 'CRCL') {
            circle.price = quote.price;
            circle.change1d = quote.changePercent;
            if (marketCap) {
              circle.marketCap = marketCap;
            }
          } else {
            const peerIndex = peers.findIndex((p) => p.ticker === ticker);
            if (peerIndex !== -1) {
              peers[peerIndex].price = quote.price;
              peers[peerIndex].change1d = quote.changePercent;
              if (marketCap) {
                peers[peerIndex].marketCap = marketCap;
              }
            }
          }
        } catch (tickerError) {
          console.warn(`Failed to fetch ${ticker}:`, tickerError);
          // Keep using fallback data for this ticker
        }
      }
    } catch (error) {
      console.warn('Yahoo Finance API error, using fallback peer data:', error);
    }

    // Calculate sector averages
    const allCompanies = [circle, ...peers];
    const validPE = allCompanies.filter((c) => c.peRatio != null).map((c) => c.peRatio!);
    const validPS = allCompanies.filter((c) => c.psRatio != null).map((c) => c.psRatio!);
    const validPB = allCompanies.filter((c) => c.pbRatio != null).map((c) => c.pbRatio!);

    const sectorAverages = {
      peRatio: validPE.reduce((a, b) => a + b, 0) / validPE.length,
      psRatio: validPS.reduce((a, b) => a + b, 0) / validPS.length,
      pbRatio: validPB.reduce((a, b) => a + b, 0) / validPB.length,
    };

    // Sort peers by market cap
    peers.sort((a, b) => b.marketCap - a.marketCap);

    return NextResponse.json({
      circle,
      peers,
      sectorAverages,
    });
  } catch (error) {
    console.error('Peer comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peer comparison data' },
      { status: 500 }
    );
  }
}
