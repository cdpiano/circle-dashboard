import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi, buildUrl, withRateLimit } from '../client';
import { ValuationMetrics, TechnicalIndicators, ProfitabilityMetrics } from '@/lib/types';

const BASE_URL = API_CONFIG.alphaVantage.baseUrl;
const API_KEY = API_CONFIG.alphaVantage.apiKey;

/**
 * Get company overview including valuation metrics
 */
export async function getCompanyOverview(symbol: string = 'CRCL'): Promise<ValuationMetrics & { revenue?: number; netIncome?: number }> {
  if (!API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return getMockValuationMetrics();
  }

  try {
    const url = buildUrl(BASE_URL, {
      function: 'OVERVIEW',
      symbol,
      apikey: API_KEY,
    });

    const response = await withRateLimit('alphaVantage', () =>
      fetchApi<{
        PERatio?: string;
        PriceToSalesRatioTTM?: string;
        PriceToBookRatio?: string;
        PEGRatio?: string;
        EVToEBITDA?: string;
        RevenueTTM?: string;
        GrossProfitTTM?: string;
        NetIncomeTTM?: string;
      }>(url, {
        cacheTTL: CACHE_TTL.financials,
      }),
    );

    const data = response.data;

    return {
      pe: data.PERatio ? parseFloat(data.PERatio) : undefined,
      ps: data.PriceToSalesRatioTTM ? parseFloat(data.PriceToSalesRatioTTM) : undefined,
      pb: data.PriceToBookRatio ? parseFloat(data.PriceToBookRatio) : undefined,
      pegRatio: data.PEGRatio ? parseFloat(data.PEGRatio) : undefined,
      evToEbitda: data.EVToEBITDA ? parseFloat(data.EVToEBITDA) : undefined,
      revenue: data.RevenueTTM ? parseFloat(data.RevenueTTM) : undefined,
      netIncome: data.NetIncomeTTM ? parseFloat(data.NetIncomeTTM) : undefined,
    };
  } catch (error) {
    console.error('Alpha Vantage overview error:', error);
    return getMockValuationMetrics();
  }
}

/**
 * Get technical indicators (RSI, SMA, etc.)
 */
export async function getTechnicalIndicators(symbol: string = 'CRCL'): Promise<Partial<TechnicalIndicators>> {
  if (!API_KEY) {
    return {};
  }

  try {
    // Get RSI
    const rsiUrl = buildUrl(BASE_URL, {
      function: 'RSI',
      symbol,
      interval: 'daily',
      time_period: '14',
      series_type: 'close',
      apikey: API_KEY,
    });

    const rsiResponse = await withRateLimit('alphaVantage', () =>
      fetchApi<{
        'Technical Analysis: RSI': Record<string, { RSI: string }>;
      }>(rsiUrl, {
        cacheTTL: CACHE_TTL.stockQuote,
      }),
    );

    const rsiData = rsiResponse.data['Technical Analysis: RSI'];
    const latestRsiDate = Object.keys(rsiData)[0];
    const rsi = parseFloat(rsiData[latestRsiDate].RSI);

    return {
      rsi,
    };
  } catch (error) {
    console.error('Alpha Vantage technical indicators error:', error);
    return {};
  }
}

/**
 * Get income statement data
 */
export async function getIncomeStatement(symbol: string = 'CRCL'): Promise<ProfitabilityMetrics | null> {
  if (!API_KEY) {
    return null;
  }

  try {
    const url = buildUrl(BASE_URL, {
      function: 'INCOME_STATEMENT',
      symbol,
      apikey: API_KEY,
    });

    const response = await withRateLimit('alphaVantage', () =>
      fetchApi<{
        annualReports: Array<{
          fiscalDateEnding: string;
          totalRevenue: string;
          grossProfit: string;
          operatingIncome: string;
          netIncome: string;
        }>;
      }>(url, {
        cacheTTL: CACHE_TTL.financials,
      }),
    );

    const latest = response.data.annualReports[0];
    if (!latest) return null;

    const revenue = parseFloat(latest.totalRevenue);
    const grossProfit = parseFloat(latest.grossProfit);
    const operatingIncome = parseFloat(latest.operatingIncome);
    const netIncome = parseFloat(latest.netIncome);

    return {
      grossMargin: (grossProfit / revenue) * 100,
      operatingMargin: (operatingIncome / revenue) * 100,
      netMargin: (netIncome / revenue) * 100,
      roe: 0, // Would need balance sheet data
      roa: 0, // Would need balance sheet data
      roic: 0, // Would need balance sheet data
    };
  } catch (error) {
    console.error('Alpha Vantage income statement error:', error);
    return null;
  }
}

/**
 * Get balance sheet data
 */
export async function getBalanceSheet(symbol: string = 'CRCL'): Promise<{
  totalAssets?: number;
  totalDebt?: number;
  totalEquity?: number;
} | null> {
  if (!API_KEY) {
    return null;
  }

  try {
    const url = buildUrl(BASE_URL, {
      function: 'BALANCE_SHEET',
      symbol,
      apikey: API_KEY,
    });

    const response = await withRateLimit('alphaVantage', () =>
      fetchApi<{
        annualReports: Array<{
          totalAssets: string;
          totalLiabilities: string;
          totalShareholderEquity: string;
        }>;
      }>(url, {
        cacheTTL: CACHE_TTL.financials,
      }),
    );

    const latest = response.data.annualReports[0];
    if (!latest) return null;

    return {
      totalAssets: parseFloat(latest.totalAssets),
      totalDebt: parseFloat(latest.totalLiabilities),
      totalEquity: parseFloat(latest.totalShareholderEquity),
    };
  } catch (error) {
    console.error('Alpha Vantage balance sheet error:', error);
    return null;
  }
}

function getMockValuationMetrics(): ValuationMetrics {
  return {
    pe: 68.5,
    ps: 23.6,
    pb: 4.2,
    pegRatio: 0.89,
    evToEbitda: 45.2,
  };
}
