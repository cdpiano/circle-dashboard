import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi } from '../client';
import { DeFiProtocolData } from '@/lib/types';

const BASE_URL = API_CONFIG.defillama.baseUrl;

/**
 * Get USDC distribution across DeFi protocols
 */
export async function getUsdcDefiDistribution(): Promise<DeFiProtocolData[]> {
  try {
    // Get stablecoin data for USDC
    const url = `${BASE_URL}/stablecoins/usd-coin`;

    const response = await fetchApi<{
      chainCirculating: Record<
        string,
        {
          current: Record<string, number>;
        }
      >;
    }>(url, {
      cacheTTL: CACHE_TTL.defi,
    });

    // DeFiLlama doesn't provide per-protocol USDC breakdown directly
    // We'd need to query individual protocol TVLs
    // For now, use protocols endpoint to get top protocols

    const protocolsUrl = `${BASE_URL}/protocols`;
    const protocolsResponse = await fetchApi<
      Array<{
        name: string;
        tvl: number;
        category: string;
        change_1d?: number;
      }>
    >(protocolsUrl, {
      cacheTTL: CACHE_TTL.defi,
    });

    // Filter for major DeFi protocols that use USDC
    const majorProtocols = protocolsResponse.data
      .filter((p) => ['Dexes', 'Lending', 'CDP'].includes(p.category))
      .slice(0, 10);

    // Estimate USDC share (in reality, would need to query each protocol's API)
    const totalTvl = majorProtocols.reduce((sum, p) => sum + p.tvl, 0);

    return majorProtocols.map((protocol) => ({
      protocol: protocol.name,
      tvl: protocol.tvl,
      usdcAmount: protocol.tvl * 0.3, // Estimate ~30% is in stablecoins
      share: (protocol.tvl / totalTvl) * 100,
      change24h: protocol.change_1d || 0,
    }));
  } catch (error) {
    console.error('DeFiLlama API error:', error);
    return getMockDefiData();
  }
}

/**
 * Get stablecoin market data
 */
export async function getStablecoinMarketData(): Promise<{
  totalMarketCap: number;
  usdcMarketCap: number;
  usdcDominance: number;
}> {
  try {
    const url = `${BASE_URL}/stablecoins`;

    const response = await fetchApi<{
      peggedAssets: Array<{
        symbol: string;
        circulating: {
          peggedUSD: number;
        };
      }>;
    }>(url, {
      cacheTTL: CACHE_TTL.usdcSupply,
    });

    const stablecoins = response.data.peggedAssets;
    const totalMarketCap = stablecoins.reduce(
      (sum, asset) => sum + asset.circulating.peggedUSD,
      0,
    );

    const usdc = stablecoins.find((asset) => asset.symbol === 'USDC');
    const usdcMarketCap = usdc?.circulating.peggedUSD || 0;

    return {
      totalMarketCap,
      usdcMarketCap,
      usdcDominance: (usdcMarketCap / totalMarketCap) * 100,
    };
  } catch (error) {
    console.error('DeFiLlama stablecoin data error:', error);
    return {
      totalMarketCap: 230_000_000_000,
      usdcMarketCap: 61_200_000_000,
      usdcDominance: 26.6,
    };
  }
}

/**
 * Get USDC chain distribution from DeFiLlama
 */
export async function getUsdcChainDistribution(): Promise<
  Array<{ chain: string; amount: number; percentage: number }>
> {
  try {
    const url = `${BASE_URL}/stablecoin/usd-coin`;

    const response = await fetchApi<{
      chainCirculating: Record<
        string,
        {
          current: {
            peggedUSD: number;
          };
        }
      >;
    }>(url, {
      cacheTTL: CACHE_TTL.usdcSupply,
    });

    const chains = response.data.chainCirculating;
    const totalAmount = Object.values(chains).reduce(
      (sum, chain) => sum + chain.current.peggedUSD,
      0,
    );

    return Object.entries(chains)
      .map(([chain, data]) => ({
        chain,
        amount: data.current.peggedUSD,
        percentage: (data.current.peggedUSD / totalAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error('DeFiLlama chain distribution error:', error);
    return getMockChainData();
  }
}

function getMockChainData(): Array<{ chain: string; amount: number; percentage: number }> {
  return [
    { chain: 'Ethereum', amount: 25_000_000_000, percentage: 50.0 },
    { chain: 'Solana', amount: 7_500_000_000, percentage: 15.0 },
    { chain: 'Arbitrum', amount: 5_000_000_000, percentage: 10.0 },
    { chain: 'Polygon', amount: 4_000_000_000, percentage: 8.0 },
    { chain: 'Base', amount: 3_500_000_000, percentage: 7.0 },
    { chain: 'Optimism', amount: 2_500_000_000, percentage: 5.0 },
    { chain: 'Avalanche', amount: 1_500_000_000, percentage: 3.0 },
    { chain: 'Others', amount: 1_000_000_000, percentage: 2.0 },
  ];
}

function getMockDefiData(): DeFiProtocolData[] {
  return [
    {
      protocol: 'Aave',
      tvl: 12_500_000_000,
      usdcAmount: 4_200_000_000,
      share: 22.5,
      apy: 3.2,
      change24h: 1.2,
    },
    {
      protocol: 'Compound',
      tvl: 3_800_000_000,
      usdcAmount: 1_500_000_000,
      share: 8.0,
      apy: 2.8,
      change24h: -0.5,
    },
    {
      protocol: 'Uniswap',
      tvl: 5_200_000_000,
      usdcAmount: 2_100_000_000,
      share: 11.2,
      change24h: 2.1,
    },
    {
      protocol: 'Curve',
      tvl: 4_100_000_000,
      usdcAmount: 2_800_000_000,
      share: 15.0,
      apy: 4.5,
      change24h: 0.8,
    },
    {
      protocol: 'MakerDAO',
      tvl: 7_600_000_000,
      usdcAmount: 1_900_000_000,
      share: 10.2,
      change24h: -1.2,
    },
  ];
}
