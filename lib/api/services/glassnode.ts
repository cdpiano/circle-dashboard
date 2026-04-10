import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi, buildUrl } from '../client';

const BASE_URL = API_CONFIG.glassnode.baseUrl;
const API_KEY = API_CONFIG.glassnode.apiKey;

/**
 * Get USDC supply metrics from Glassnode
 */
export async function getUsdcSupplyMetrics(): Promise<{
  circulatingSupply: number;
  change24h: number;
  change7d: number;
  change30d: number;
}> {
  if (!API_KEY) {
    console.warn('Glassnode API key not configured');
    return getMockSupplyMetrics();
  }

  try {
    const url = buildUrl(`${BASE_URL}/metrics/supply/current`, {
      a: 'USDC',
      api_key: API_KEY,
    });

    const response = await fetchApi<Array<{ t: number; v: number }>>(url, {
      cacheTTL: CACHE_TTL.usdcSupply,
    });

    const latest = response.data[response.data.length - 1];
    const day1 = response.data[response.data.length - 2];
    const day7 = response.data[response.data.length - 7];
    const day30 = response.data[response.data.length - 30];

    return {
      circulatingSupply: latest.v,
      change24h: ((latest.v - day1.v) / day1.v) * 100,
      change7d: ((latest.v - day7.v) / day7.v) * 100,
      change30d: ((latest.v - day30.v) / day30.v) * 100,
    };
  } catch (error) {
    console.error('Glassnode supply metrics error:', error);
    return getMockSupplyMetrics();
  }
}

/**
 * Get active addresses metrics
 */
export async function getActiveAddresses(period: '24h' | '7d' | '30d' = '24h'): Promise<number> {
  if (!API_KEY) {
    return 185_420;
  }

  try {
    const url = buildUrl(`${BASE_URL}/metrics/addresses/active_count`, {
      a: 'USDC',
      api_key: API_KEY,
      i: period === '24h' ? '24h' : period === '7d' ? '1w' : '1m',
    });

    const response = await fetchApi<Array<{ t: number; v: number }>>(url, {
      cacheTTL: CACHE_TTL.onchain,
    });

    return response.data[response.data.length - 1]?.v || 0;
  } catch (error) {
    console.error('Glassnode active addresses error:', error);
    return 0;
  }
}

/**
 * Get holder distribution metrics
 */
export async function getHolderDistribution(): Promise<{
  total: number;
  whales: number; // > $10M
  large: number; // $1M - $10M
  medium: number; // $100K - $1M
  small: number; // < $100K
}> {
  if (!API_KEY) {
    return getMockHolderDistribution();
  }

  try {
    // Glassnode provides distribution by balance brackets
    const url = buildUrl(`${BASE_URL}/metrics/distribution/balance_addresses`, {
      a: 'USDC',
      api_key: API_KEY,
    });

    const response = await fetchApi<Array<{ t: number; v: number }>>(url, {
      cacheTTL: CACHE_TTL.onchain,
    });

    // Would need to parse the bracket data
    // For now, return mock
    return getMockHolderDistribution();
  } catch (error) {
    console.error('Glassnode holder distribution error:', error);
    return getMockHolderDistribution();
  }
}

/**
 * Get transaction metrics
 */
export async function getTransactionMetrics(): Promise<{
  count24h: number;
  volume24h: number;
  avgTransactionSize: number;
}> {
  if (!API_KEY) {
    return getMockTransactionMetrics();
  }

  try {
    const countUrl = buildUrl(`${BASE_URL}/metrics/transactions/count`, {
      a: 'USDC',
      api_key: API_KEY,
      i: '24h',
    });

    const volumeUrl = buildUrl(`${BASE_URL}/metrics/transactions/transfers_volume_sum`, {
      a: 'USDC',
      api_key: API_KEY,
      i: '24h',
    });

    const [countResponse, volumeResponse] = await Promise.all([
      fetchApi<Array<{ t: number; v: number }>>(countUrl, { cacheTTL: CACHE_TTL.onchain }),
      fetchApi<Array<{ t: number; v: number }>>(volumeUrl, { cacheTTL: CACHE_TTL.onchain }),
    ]);

    const count = countResponse.data[countResponse.data.length - 1]?.v || 0;
    const volume = volumeResponse.data[volumeResponse.data.length - 1]?.v || 0;

    return {
      count24h: count,
      volume24h: volume,
      avgTransactionSize: count > 0 ? volume / count : 0,
    };
  } catch (error) {
    console.error('Glassnode transaction metrics error:', error);
    return getMockTransactionMetrics();
  }
}

/**
 * Get velocity (transaction volume / supply)
 */
export async function getVelocity(): Promise<number> {
  if (!API_KEY) {
    return 0.14; // 14% turnover per day
  }

  try {
    const url = buildUrl(`${BASE_URL}/metrics/indicators/velocity`, {
      a: 'USDC',
      api_key: API_KEY,
    });

    const response = await fetchApi<Array<{ t: number; v: number }>>(url, {
      cacheTTL: CACHE_TTL.onchain,
    });

    return response.data[response.data.length - 1]?.v || 0;
  } catch (error) {
    console.error('Glassnode velocity error:', error);
    return 0.14;
  }
}

function getMockSupplyMetrics() {
  return {
    circulatingSupply: 61_180_000_000,
    change24h: 0.32,
    change7d: 1.85,
    change30d: 5.2,
  };
}

function getMockHolderDistribution() {
  return {
    total: 2_845_000,
    whales: 127, // > $10M
    large: 1_850, // $1M - $10M
    medium: 45_200, // $100K - $1M
    small: 2_797_823, // < $100K
  };
}

function getMockTransactionMetrics() {
  return {
    count24h: 185_420,
    volume24h: 8_500_000_000,
    avgTransactionSize: 45_850,
  };
}
