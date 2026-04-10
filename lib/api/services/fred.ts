import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi, buildUrl } from '../client';
import { MacroRate } from '@/lib/types';

const BASE_URL = API_CONFIG.fred.baseUrl;
const API_KEY = API_CONFIG.fred.apiKey;

interface FredObservation {
  date: string;
  value: string;
}

interface FredSeriesResponse {
  observations: FredObservation[];
}

/**
 * Get Federal Funds Rate
 */
export async function getFederalFundsRate(): Promise<MacroRate> {
  return getMacroRate('DFF', 'Federal Funds Rate', '%');
}

/**
 * Get 10-Year Treasury Yield
 */
export async function get10YearTreasuryYield(): Promise<MacroRate> {
  return getMacroRate('DGS10', '10-Year Treasury Yield', '%');
}

/**
 * Get 2-Year Treasury Yield
 */
export async function get2YearTreasuryYield(): Promise<MacroRate> {
  return getMacroRate('DGS2', '2-Year Treasury Yield', '%');
}

/**
 * Get CPI (Inflation Rate)
 */
export async function getInflationRate(): Promise<MacroRate> {
  return getMacroRate('CPIAUCSL', 'CPI (Inflation)', 'Index', true);
}

/**
 * Get USD Index (DXY)
 */
export async function getUsdIndex(): Promise<MacroRate> {
  // Note: DXY is not available in FRED, would need another source
  // Using Trade Weighted U.S. Dollar Index as alternative
  return getMacroRate('DTWEXBGS', 'USD Index', 'Index');
}

/**
 * Generic function to fetch macro rate from FRED
 */
async function getMacroRate(
  seriesId: string,
  name: string,
  unit: string,
  isIndex: boolean = false,
): Promise<MacroRate> {
  if (!API_KEY) {
    console.warn('FRED API key not configured, using mock data');
    return getMockMacroRate(name, unit);
  }

  try {
    // Get observations for the last 12 months
    const observationsUrl = buildUrl(`${BASE_URL}/series/observations`, {
      series_id: seriesId,
      api_key: API_KEY,
      file_type: 'json',
      sort_order: 'desc',
      limit: '365', // Get daily data for last year
    });

    const response = await fetchApi<FredSeriesResponse>(observationsUrl, {
      cacheTTL: CACHE_TTL.macroRates,
    });

    const validObservations = response.data.observations
      .filter((obs) => obs.value !== '.')
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }))
      .reverse();

    if (validObservations.length === 0) {
      throw new Error('No valid observations');
    }

    const currentValue = validObservations[validObservations.length - 1].value;
    const previousValue = validObservations[validObservations.length - 2]?.value || currentValue;
    const change = currentValue - previousValue;

    // For history, sample monthly for the chart
    const history = sampleMonthly(validObservations);

    return {
      name,
      value: currentValue,
      previousValue,
      change,
      unit,
      lastUpdated: validObservations[validObservations.length - 1].date,
      history,
    };
  } catch (error) {
    console.error(`FRED API error for ${seriesId}:`, error);
    return getMockMacroRate(name, unit);
  }
}

/**
 * Sample data monthly for chart display
 */
function sampleMonthly(data: { date: string; value: number }[]): { date: string; value: number }[] {
  const monthly: { date: string; value: number }[] = [];
  let lastMonth = '';

  for (const item of data) {
    const month = item.date.substring(0, 7); // YYYY-MM
    if (month !== lastMonth) {
      monthly.push(item);
      lastMonth = month;
    }
  }

  return monthly.slice(-12); // Last 12 months
}

/**
 * Get all macro rates
 */
export async function getAllMacroRates(): Promise<MacroRate[]> {
  return Promise.all([
    getFederalFundsRate(),
    get10YearTreasuryYield(),
    get2YearTreasuryYield(),
    getInflationRate(),
  ]);
}

/**
 * Mock data fallback
 */
function getMockMacroRate(name: string, unit: string): MacroRate {
  const mockData: Record<string, MacroRate> = {
    'Federal Funds Rate': {
      name: 'Federal Funds Rate',
      value: 4.25,
      previousValue: 4.5,
      change: -0.25,
      unit: '%',
      lastUpdated: '2026-01-29',
      history: generateMockHistory(5.33, 4.25, 12),
    },
    '10-Year Treasury Yield': {
      name: '10-Year Treasury Yield',
      value: 4.38,
      previousValue: 4.42,
      change: -0.04,
      unit: '%',
      lastUpdated: '2026-03-10',
      history: generateMockHistory(4.2, 4.38, 12),
    },
    '2-Year Treasury Yield': {
      name: '2-Year Treasury Yield',
      value: 3.95,
      previousValue: 4.02,
      change: -0.07,
      unit: '%',
      lastUpdated: '2026-03-10',
      history: generateMockHistory(4.5, 3.95, 12),
    },
    'CPI (Inflation)': {
      name: 'CPI (Inflation)',
      value: 315.5,
      previousValue: 314.2,
      change: 1.3,
      unit: 'Index',
      lastUpdated: '2026-02-15',
      history: generateMockHistory(300, 315.5, 12),
    },
  };

  return (
    mockData[name] || {
      name,
      value: 0,
      previousValue: 0,
      change: 0,
      unit,
      lastUpdated: new Date().toISOString().split('T')[0],
      history: [],
    }
  );
}

function generateMockHistory(start: number, end: number, months: number): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const progress = (months - i) / months;
    const value = start + (end - start) * progress + (Math.random() - 0.5) * 0.1;

    history.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
    });
  }

  return history;
}
