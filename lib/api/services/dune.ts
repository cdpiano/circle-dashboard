import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi } from '../client';
import { WhaleWallet, MintBurnData, GrowthMetrics } from '@/lib/types';

const BASE_URL = API_CONFIG.dune.baseUrl;
const API_KEY = API_CONFIG.dune.apiKey;

/**
 * Execute a Dune query and get results
 * Note: Dune queries need to be pre-created on dune.com dashboard
 */
async function executeDuneQuery<T>(queryId: string): Promise<T[]> {
  if (!API_KEY) {
    throw new Error('Dune API key not configured');
  }

  // First, execute the query
  const executeUrl = `${BASE_URL}/query/${queryId}/execute`;

  const executeResponse = await fetchApi<{ execution_id: string }>(executeUrl, {
    method: 'POST',
    headers: {
      'X-Dune-API-Key': API_KEY,
    },
  });

  const executionId = executeResponse.data.execution_id;

  // Poll for results
  const resultsUrl = `${BASE_URL}/execution/${executionId}/results`;

  // Wait a bit for query to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const resultsResponse = await fetchApi<{
    result: {
      rows: T[];
    };
  }>(resultsUrl, {
    headers: {
      'X-Dune-API-Key': API_KEY,
    },
    cacheTTL: CACHE_TTL.onchain,
  });

  return resultsResponse.data.result.rows;
}

/**
 * Get USDC whale wallets
 * Requires a pre-created Dune query that returns top USDC holders
 */
export async function getUsdcWhales(): Promise<WhaleWallet[]> {
  try {
    // Example query ID - would need to create actual query on Dune
    const WHALE_QUERY_ID = '1234567';

    const data = await executeDuneQuery<{
      address: string;
      balance: number;
      label?: string;
      category?: string;
    }>(WHALE_QUERY_ID);

    return data.map((row) => ({
      address: row.address,
      label: row.label,
      balance: row.balance,
      change24h: 0, // Would need time-series query
      change7d: 0,
      category: (row.category as WhaleWallet['category']) || 'unknown',
    }));
  } catch (error) {
    console.error('Dune whales error:', error);
    return getMockWhaleData();
  }
}

/**
 * Get USDC mint/burn data
 */
export async function getUsdcMintBurnData(days: number = 30): Promise<MintBurnData[]> {
  try {
    const MINTBURN_QUERY_ID = '1234568';

    const data = await executeDuneQuery<{
      date: string;
      minted: number;
      burned: number;
    }>(MINTBURN_QUERY_ID);

    return data.map((row) => ({
      date: row.date,
      minted: row.minted,
      burned: row.burned,
      net: row.minted - row.burned,
    }));
  } catch (error) {
    console.error('Dune mint/burn error:', error);
    return getMockMintBurnData();
  }
}

/**
 * Get growth metrics from on-chain data
 */
export async function getGrowthMetrics(): Promise<GrowthMetrics> {
  try {
    const GROWTH_QUERY_ID = '1234569';

    const data = await executeDuneQuery<{
      metric: string;
      value: number;
    }>(GROWTH_QUERY_ID);

    const metrics = data.reduce(
      (acc, row) => {
        acc[row.metric] = row.value;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      newHolders24h: metrics.newHolders24h || 0,
      newHolders7d: metrics.newHolders7d || 0,
      newHolders30d: metrics.newHolders30d || 0,
      activeAddresses24h: metrics.activeAddresses24h || 0,
      activeAddresses7d: metrics.activeAddresses7d || 0,
      activeAddresses30d: metrics.activeAddresses30d || 0,
      netFlow24h: metrics.netFlow24h || 0,
      netFlow7d: metrics.netFlow7d || 0,
      netFlow30d: metrics.netFlow30d || 0,
    };
  } catch (error) {
    console.error('Dune growth metrics error:', error);
    return getMockGrowthMetrics();
  }
}

function getMockWhaleData(): WhaleWallet[] {
  return [
    {
      address: '0x1234...5678',
      label: 'Binance',
      balance: 5_200_000_000,
      change24h: 85_000_000,
      change7d: 320_000_000,
      category: 'exchange',
    },
    {
      address: '0x2345...6789',
      label: 'Coinbase',
      balance: 3_800_000_000,
      change24h: -45_000_000,
      change7d: 120_000_000,
      category: 'exchange',
    },
    {
      address: '0x3456...789a',
      label: 'Jump Trading',
      balance: 1_200_000_000,
      change24h: 12_000_000,
      change7d: 55_000_000,
      category: 'fund',
    },
    {
      address: '0x4567...89ab',
      balance: 850_000_000,
      change24h: -8_000_000,
      change7d: -15_000_000,
      category: 'unknown',
    },
    {
      address: '0x5678...9abc',
      label: 'Circle Treasury',
      balance: 2_500_000_000,
      change24h: 0,
      change7d: 0,
      category: 'treasury',
    },
  ];
}

function getMockMintBurnData(): MintBurnData[] {
  const data: MintBurnData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseMint = 200_000_000;
    const baseBurn = 180_000_000;

    data.push({
      date: date.toISOString().split('T')[0],
      minted: baseMint + (Math.random() - 0.5) * 100_000_000,
      burned: baseBurn + (Math.random() - 0.5) * 80_000_000,
      net: (baseMint - baseBurn) + (Math.random() - 0.5) * 50_000_000,
    });
  }

  return data;
}

function getMockGrowthMetrics(): GrowthMetrics {
  return {
    newHolders24h: 4_250,
    newHolders7d: 32_100,
    newHolders30d: 142_000,
    activeAddresses24h: 185_420,
    activeAddresses7d: 876_300,
    activeAddresses30d: 2_450_000,
    netFlow24h: 45_000_000,
    netFlow7d: 320_000_000,
    netFlow30d: 1_200_000_000,
  };
}
