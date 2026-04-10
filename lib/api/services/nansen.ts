import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi } from '../client';
import { SmartMoneyFlow, WhaleWallet } from '@/lib/types';

const BASE_URL = API_CONFIG.nansen.baseUrl;
const API_KEY = API_CONFIG.nansen.apiKey;

/**
 * Get smart money flows for USDC
 * Note: Nansen is a premium service, API access requires enterprise plan
 */
export async function getSmartMoneyFlows(days: number = 7): Promise<SmartMoneyFlow[]> {
  if (!API_KEY) {
    console.warn('Nansen API key not configured');
    return getMockSmartMoneyFlows();
  }

  try {
    // Nansen API endpoints (example structure)
    const url = `${BASE_URL}/token/USDC/smart-money-flows`;

    const response = await fetchApi<{
      flows: Array<{
        date: string;
        inflow: number;
        outflow: number;
        topBuyers: Array<{ address: string; amount: number }>;
        topSellers: Array<{ address: string; amount: number }>;
      }>;
    }>(url, {
      headers: {
        'X-API-KEY': API_KEY,
      },
      cacheTTL: CACHE_TTL.smartMoney,
    });

    return response.data.flows.map((flow) => ({
      date: flow.date,
      inflow: flow.inflow,
      outflow: flow.outflow,
      net: flow.inflow - flow.outflow,
      topBuyers: flow.topBuyers,
      topSellers: flow.topSellers,
    }));
  } catch (error) {
    console.error('Nansen smart money flows error:', error);
    return getMockSmartMoneyFlows();
  }
}

/**
 * Get labeled whale wallets
 */
export async function getLabeledWhales(): Promise<WhaleWallet[]> {
  if (!API_KEY) {
    return [];
  }

  try {
    const url = `${BASE_URL}/token/USDC/whale-wallets`;

    const response = await fetchApi<{
      wallets: Array<{
        address: string;
        label: string;
        category: string;
        balance: number;
        change24h: number;
        change7d: number;
      }>;
    }>(url, {
      headers: {
        'X-API-KEY': API_KEY,
      },
      cacheTTL: CACHE_TTL.smartMoney,
    });

    return response.data.wallets.map((wallet) => ({
      address: wallet.address,
      label: wallet.label,
      balance: wallet.balance,
      change24h: wallet.change24h,
      change7d: wallet.change7d,
      category: wallet.category as WhaleWallet['category'],
    }));
  } catch (error) {
    console.error('Nansen labeled whales error:', error);
    return [];
  }
}

/**
 * Get wallet profiler data (categorize addresses)
 */
export async function getWalletCategories(): Promise<{
  exchanges: number;
  funds: number;
  defi: number;
  retail: number;
}> {
  if (!API_KEY) {
    return getMockWalletCategories();
  }

  try {
    const url = `${BASE_URL}/token/USDC/wallet-categories`;

    const response = await fetchApi<{
      categories: Record<string, number>;
    }>(url, {
      headers: {
        'X-API-KEY': API_KEY,
      },
      cacheTTL: CACHE_TTL.smartMoney,
    });

    return {
      exchanges: response.data.categories.exchanges || 0,
      funds: response.data.categories.funds || 0,
      defi: response.data.categories.defi || 0,
      retail: response.data.categories.retail || 0,
    };
  } catch (error) {
    console.error('Nansen wallet categories error:', error);
    return getMockWalletCategories();
  }
}

/**
 * Get token god mode insights (overall token health)
 */
export async function getTokenInsights(): Promise<{
  healthScore: number; // 0-100
  sentiment: 'bullish' | 'neutral' | 'bearish';
  riskLevel: 'low' | 'medium' | 'high';
  smartMoneyNetFlow: number;
}> {
  if (!API_KEY) {
    return {
      healthScore: 85,
      sentiment: 'bullish',
      riskLevel: 'low',
      smartMoneyNetFlow: 125_000_000,
    };
  }

  try {
    const url = `${BASE_URL}/token/USDC/insights`;

    const response = await fetchApi<{
      health_score: number;
      sentiment: string;
      risk_level: string;
      smart_money_net_flow: number;
    }>(url, {
      headers: {
        'X-API-KEY': API_KEY,
      },
      cacheTTL: CACHE_TTL.smartMoney,
    });

    return {
      healthScore: response.data.health_score,
      sentiment: response.data.sentiment as 'bullish' | 'neutral' | 'bearish',
      riskLevel: response.data.risk_level as 'low' | 'medium' | 'high',
      smartMoneyNetFlow: response.data.smart_money_net_flow,
    };
  } catch (error) {
    console.error('Nansen token insights error:', error);
    return {
      healthScore: 85,
      sentiment: 'bullish',
      riskLevel: 'low',
      smartMoneyNetFlow: 125_000_000,
    };
  }
}

function getMockSmartMoneyFlows(): SmartMoneyFlow[] {
  const flows: SmartMoneyFlow[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const inflow = 180_000_000 + (Math.random() - 0.5) * 80_000_000;
    const outflow = 145_000_000 + (Math.random() - 0.5) * 60_000_000;

    flows.push({
      date: date.toISOString().split('T')[0],
      inflow,
      outflow,
      net: inflow - outflow,
      topBuyers: [
        { address: '0x1234...5678', amount: 25_000_000 },
        { address: '0x2345...6789', amount: 18_000_000 },
        { address: '0x3456...789a', amount: 12_000_000 },
      ],
      topSellers: [
        { address: '0x4567...89ab', amount: 22_000_000 },
        { address: '0x5678...9abc', amount: 15_000_000 },
        { address: '0x6789...abcd', amount: 9_000_000 },
      ],
    });
  }

  return flows;
}

function getMockWalletCategories() {
  return {
    exchanges: 15_200_000_000, // 24.8%
    funds: 8_500_000_000, // 13.9%
    defi: 22_300_000_000, // 36.4%
    retail: 15_180_000_000, // 24.8%
  };
}
