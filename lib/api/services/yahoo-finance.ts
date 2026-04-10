import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi } from '../client';
import { StockQuote, CandleData } from '@/lib/types';

const BASE_URL = API_CONFIG.yahooFinance.baseUrl;
const SYMBOL = 'CRCL'; // Circle ticker

/**
 * Get stock quote from Yahoo Finance
 */
export async function getStockQuote(symbol: string = SYMBOL): Promise<StockQuote> {
  try {
    const url = `${BASE_URL}/v8/finance/chart/${symbol}`;

    const response = await fetchApi<{
      chart: {
        result: Array<{
          meta: {
            regularMarketPrice: number;
            previousClose: number;
            regularMarketDayHigh: number;
            regularMarketDayLow: number;
            regularMarketOpen: number;
            regularMarketVolume: number;
          };
          timestamp: number[];
        }>;
      };
    }>(url, {
      cacheTTL: CACHE_TTL.stockQuote,
    });

    const result = response.data.chart.result[0];
    const meta = result.meta;

    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol,
      price,
      change,
      changePercent,
      high: meta.regularMarketDayHigh || price,
      low: meta.regularMarketDayLow || price,
      open: meta.regularMarketOpen || previousClose,
      previousClose,
      volume: meta.regularMarketVolume || 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return getMockStockQuote(symbol);
  }
}

/**
 * Get historical stock data
 */
export async function getStockHistory(
  symbol: string = SYMBOL,
  range: string = '6mo',
  interval: string = '1d',
): Promise<CandleData[]> {
  try {
    const url = `${BASE_URL}/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;

    const response = await fetchApi<{
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: {
            quote: Array<{
              open: number[];
              high: number[];
              low: number[];
              close: number[];
              volume: number[];
            }>;
          };
        }>;
      };
    }>(url, {
      cacheTTL: CACHE_TTL.stockHistory,
    });

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    return timestamps.map((timestamp, i) => ({
      time: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    }));
  } catch (error) {
    console.error('Yahoo Finance history error:', error);
    return getMockCandleData();
  }
}

/**
 * Get market cap (from financials)
 */
export async function getMarketCap(symbol: string = SYMBOL): Promise<number | undefined> {
  try {
    const url = `${BASE_URL}/v10/finance/quoteSummary/${symbol}?modules=summaryDetail`;

    const response = await fetchApi<{
      quoteSummary: {
        result: Array<{
          summaryDetail: {
            marketCap: { raw: number };
          };
        }>;
      };
    }>(url, {
      cacheTTL: CACHE_TTL.stockQuote,
    });

    return response.data.quoteSummary.result[0]?.summaryDetail?.marketCap?.raw;
  } catch (error) {
    console.error('Yahoo Finance market cap error:', error);
    return undefined;
  }
}

/**
 * Mock data fallback
 */
function getMockStockQuote(symbol: string): StockQuote {
  return {
    symbol,
    price: 83.50,
    change: 2.15,
    changePercent: 2.64,
    high: 84.20,
    low: 80.90,
    open: 81.35,
    previousClose: 81.35,
    volume: 8_200_000,
    marketCap: 52_000_000_000,
    timestamp: Date.now(),
  };
}

function getMockCandleData(): CandleData[] {
  const data: CandleData[] = [];
  let price = 55.0;
  const now = new Date();

  for (let i = 180; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * 3;
    price = Math.max(40, Math.min(90, price + change));

    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat((price + (Math.random() - 0.5)).toFixed(2)),
      high: parseFloat((price + Math.random() * 1.5).toFixed(2)),
      low: parseFloat((price - Math.random() * 1.5).toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(5_000_000 + Math.random() * 15_000_000),
    });
  }

  return data;
}
