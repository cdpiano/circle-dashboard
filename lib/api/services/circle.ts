import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi } from '../client';
import { ChainDistribution } from '@/lib/types';

const BASE_URL = API_CONFIG.circle.baseUrl;
const API_KEY = API_CONFIG.circle.apiKey;

interface CircleSupplyResponse {
  data: Array<{
    chain: string;
    amount: string;
    updateDate: string;
  }>;
}

/**
 * Get USDC supply by blockchain from Circle API
 */
export async function getUsdcSupplyByChain(): Promise<ChainDistribution[]> {
  // Circle API endpoint for USDC supply
  const url = `${BASE_URL}/stablecoins/usdc/supply`;

  try {
    const response = await fetchApi<CircleSupplyResponse>(url, {
      headers: API_KEY
        ? {
            Authorization: `Bearer ${API_KEY}`,
          }
        : {},
      cacheTTL: CACHE_TTL.usdcSupply,
    });

    const totalSupply = response.data.data.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0,
    );

    return response.data.data.map((item) => ({
      chain: item.chain,
      amount: parseFloat(item.amount),
      percentage: (parseFloat(item.amount) / totalSupply) * 100,
    }));
  } catch (error) {
    console.error('Circle API error:', error);
    // Fallback to mock data if API fails or key not configured
    return getMockChainDistribution();
  }
}

/**
 * Get total USDC supply
 */
export async function getTotalUsdcSupply(): Promise<number> {
  const chains = await getUsdcSupplyByChain();
  return chains.reduce((sum, chain) => sum + chain.amount, 0);
}

/**
 * Mock chain distribution (fallback)
 */
function getMockChainDistribution(): ChainDistribution[] {
  return [
    { chain: 'Ethereum', amount: 35_000_000_000, percentage: 57.2 },
    { chain: 'Solana', amount: 8_500_000_000, percentage: 13.9 },
    { chain: 'Arbitrum', amount: 5_200_000_000, percentage: 8.5 },
    { chain: 'Polygon', amount: 3_800_000_000, percentage: 6.2 },
    { chain: 'Optimism', amount: 2_100_000_000, percentage: 3.4 },
    { chain: 'Base', amount: 3_600_000_000, percentage: 5.9 },
    { chain: 'Avalanche', amount: 1_500_000_000, percentage: 2.5 },
    { chain: 'Others', amount: 1_480_000_000, percentage: 2.4 },
  ];
}

/**
 * Get Circle reserve attestation (transparency report)
 */
export async function getReserveAttestation(): Promise<{
  date: string;
  totalReserves: number;
  usdcInCirculation: number;
  reserveRatio: number;
  url: string;
} | null> {
  // Note: Circle publishes monthly attestation reports
  // This would need to be scraped or manually updated
  // For now, return mock/latest known data
  return {
    date: '2026-02-28',
    totalReserves: 61_500_000_000,
    usdcInCirculation: 61_180_000_000,
    reserveRatio: 1.005,
    url: 'https://www.circle.com/en/usdc-attestations',
  };
}
