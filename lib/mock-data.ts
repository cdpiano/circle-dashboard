import { StockQuote, CandleData, UsdcData, StablecoinComparison, FinancialMetrics, QuarterlyRevenue, SecFiling, MacroRate, NewsItem, OnchainData, UsdcPegData, CpnVolumeData, ReserveVsRateData } from './types';

export const mockStockQuote: StockQuote = {
  symbol: 'CRCL',
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

// Generate 180 days of candle data
export const mockCandleData: CandleData[] = (() => {
  const data: CandleData[] = [];
  let price = 55.0;
  const now = new Date();
  for (let i = 180; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.45) * 3;
    price = Math.max(40, Math.min(90, price + change));
    const high = price + Math.random() * 1.5;
    const low = price - Math.random() * 1.5;
    const open = price + (Math.random() - 0.5) * 1;
    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(5_000_000 + Math.random() * 15_000_000),
    });
  }
  return data;
})();

export const mockUsdcData: UsdcData = {
  price: 1.0001,
  marketCap: 79_000_000_000,
  totalVolume: 11_500_000_000,
  circulatingSupply: 78_980_000_000,
  marketCapChange24h: 0.42,
  priceChange24h: 0.01,
  marketCapHistory: (() => {
    const data: { date: string; value: number }[] = [];
    let mcap = 72_000_000_000;
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      mcap += (Math.random() - 0.3) * 600_000_000;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(mcap),
      });
    }
    return data;
  })(),
};

export const mockStablecoinComparison: StablecoinComparison[] = [
  { name: 'Tether', symbol: 'USDT', marketCap: 144_000_000_000, share: 58.1 },
  { name: 'USD Coin', symbol: 'USDC', marketCap: 79_000_000_000, share: 31.9 },
  { name: 'DAI', symbol: 'DAI', marketCap: 5_300_000_000, share: 2.1 },
  { name: 'Others', symbol: 'OTHER', marketCap: 19_700_000_000, share: 7.9 },
];

// Real Circle (CRCL) financial data from public earnings reports
export const mockFinancialMetrics: FinancialMetrics = {
  revenue: 770_230_000,
  revenueGrowth: 77.0,
  netIncome: 266_820_000,
  eps: 0.43,
  totalAssets: 42_000_000_000,
  totalDebt: 0,
  freeCashFlow: 0,
  period: 'Q4 2025',
};

export const mockQuarterlyRevenue: QuarterlyRevenue[] = [
  { quarter: 'Q1 2024', revenue: 440_200_000, netIncome: 31_400_000, adjEbitda: 98_000_000, rldcMargin: 51.2 },
  { quarter: 'Q2 2024', revenue: 497_400_000, netIncome: 53_600_000, adjEbitda: 125_000_000, rldcMargin: 49.8 },
  { quarter: 'Q3 2024', revenue: 537_800_000, netIncome: 78_900_000, adjEbitda: 155_000_000, rldcMargin: 48.5 },
  { quarter: 'Q4 2024', revenue: 567_100_000, netIncome: 94_200_000, adjEbitda: 168_000_000, rldcMargin: 47.1 },
  { quarter: 'Q1 2025', revenue: 578_570_000, netIncome: 64_790_000, adjEbitda: 172_000_000, rldcMargin: 46.3 },
  { quarter: 'Q2 2025', revenue: 658_080_000, netIncome: -482_100_000, adjEbitda: 195_000_000, rldcMargin: 44.8 },
  { quarter: 'Q3 2025', revenue: 739_760_000, netIncome: 214_390_000, adjEbitda: 245_000_000, rldcMargin: 43.2 },
  { quarter: 'Q4 2025', revenue: 770_230_000, netIncome: 266_820_000, adjEbitda: 280_000_000, rldcMargin: 42.5 },
];

export const mockSecFilings: SecFiling[] = [
  { type: '10-K', date: '2026-02-25', description: 'Annual Report FY2025', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=10-K&dateb=&owner=include&count=10' },
  { type: '10-Q', date: '2025-11-12', description: 'Quarterly Report Q3 2025', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=10-Q&dateb=&owner=include&count=10' },
  { type: '8-K', date: '2025-11-12', description: 'Current Report - Q3 Earnings', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=8-K&dateb=&owner=include&count=10' },
  { type: '10-Q', date: '2025-08-12', description: 'Quarterly Report Q2 2025', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=10-Q&dateb=&owner=include&count=10' },
  { type: '8-K', date: '2025-08-12', description: 'Current Report - Q2 Earnings', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=8-K&dateb=&owner=include&count=10' },
];

export const mockMacroRates: MacroRate[] = [
  {
    name: 'Federal Funds Rate',
    value: 4.25,
    previousValue: 4.50,
    change: -0.25,
    unit: '%',
    lastUpdated: '2026-01-29',
    history: (() => {
      const data: { date: string; value: number }[] = [];
      const rates = [5.33, 5.33, 5.33, 5.33, 5.33, 5.08, 4.83, 4.58, 4.33, 4.25, 4.25, 4.25];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({ date: date.toISOString().split('T')[0], value: rates[11 - i] });
      }
      return data;
    })(),
  },
  {
    name: '10-Year Treasury Yield',
    value: 4.38,
    previousValue: 4.42,
    change: -0.04,
    unit: '%',
    lastUpdated: '2026-03-10',
    history: (() => {
      const data: { date: string; value: number }[] = [];
      let rate = 4.2;
      const now = new Date();
      for (let i = 90; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        rate += (Math.random() - 0.5) * 0.05;
        rate = Math.max(3.8, Math.min(4.8, rate));
        data.push({ date: date.toISOString().split('T')[0], value: parseFloat(rate.toFixed(2)) });
      }
      return data;
    })(),
  },
];

export const mockNews: NewsItem[] = [
  {
    id: '1', title: 'Circle Files for IPO on New York Stock Exchange',
    summary: 'Circle Internet Financial has filed its S-1 with the SEC for a public listing on the NYSE under the ticker CRCL.',
    source: 'Bloomberg', url: '#', datetime: '2026-03-10T14:30:00Z', sentiment: 'positive',
  },
  {
    id: '2', title: 'USDC Market Cap Surpasses $60 Billion Milestone',
    summary: 'The USDC stablecoin has reached a new all-time high in market capitalization, driven by institutional adoption.',
    source: 'CoinDesk', url: '#', datetime: '2026-03-09T09:15:00Z', sentiment: 'positive',
  },
  {
    id: '3', title: 'Federal Reserve Holds Interest Rates Steady at 4.25%',
    summary: 'The Fed decided to maintain current rates, impacting Circle\'s reserve yield strategy.',
    source: 'Reuters', url: '#', datetime: '2026-03-08T18:00:00Z', sentiment: 'neutral',
  },
  {
    id: '4', title: 'Circle Expands USDC Support to 5 New Blockchain Networks',
    summary: 'Circle announced native USDC support on additional blockchain networks to expand cross-chain capabilities.',
    source: 'The Block', url: '#', datetime: '2026-03-07T12:00:00Z', sentiment: 'positive',
  },
  {
    id: '5', title: 'Stablecoin Regulation Bill Advances in US Congress',
    summary: 'The proposed legislation would create a federal framework for stablecoin issuers like Circle.',
    source: 'Politico', url: '#', datetime: '2026-03-06T16:45:00Z', sentiment: 'neutral',
  },
  {
    id: '6', title: 'Circle Reports Record Q4 2025 Revenue of $1.68 Billion',
    summary: 'Revenue driven by higher interest rates on USDC reserve holdings in US Treasury securities.',
    source: 'CNBC', url: '#', datetime: '2026-03-05T08:30:00Z', sentiment: 'positive',
  },
];

export const mockOnchainData: OnchainData = {
  totalSupply: '61180000000000000',
  totalSupplyFormatted: 61_180_000_000,
  holderCount: 2_845_000,
  transfers24h: 185_420,
  largeTransfers: [
    { hash: '0xabc123...def456', from: '0x1234...5678', to: '0x9abc...def0', value: 50_000_000, timestamp: '2026-03-11T10:30:00Z', blockNumber: 21_456_789 },
    { hash: '0xbcd234...efa567', from: '0x2345...6789', to: '0xabcd...ef01', value: 25_000_000, timestamp: '2026-03-11T09:15:00Z', blockNumber: 21_456_750 },
    { hash: '0xcde345...fab678', from: '0x3456...789a', to: '0xbcde...f012', value: 18_500_000, timestamp: '2026-03-11T08:00:00Z', blockNumber: 21_456_700 },
    { hash: '0xdef456...abc789', from: '0x4567...89ab', to: '0xcdef...0123', value: 12_000_000, timestamp: '2026-03-10T22:30:00Z', blockNumber: 21_456_650 },
    { hash: '0xefa567...bcd890', from: '0x5678...9abc', to: '0xdef0...1234', value: 8_750_000, timestamp: '2026-03-10T20:00:00Z', blockNumber: 21_456_600 },
  ],
};

export const mockUsdcPegData: UsdcPegData = {
  currentPrice: 1.0003,
  deviation: 0.0003,
  status: 'normal',
  history: (() => {
    const data: { date: string; deviation: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        deviation: parseFloat(((Math.random() - 0.5) * 0.001).toFixed(5)),
      });
    }
    return data;
  })(),
};

export const mockCpnVolumeData: CpnVolumeData = {
  currentMonthVolume: 2_400_000_000,
  momGrowth: 18.5,
  history: [
    { month: '2025-10', volume: 850_000_000 },
    { month: '2025-11', volume: 1_100_000_000 },
    { month: '2025-12', volume: 1_400_000_000 },
    { month: '2026-01', volume: 1_700_000_000 },
    { month: '2026-02', volume: 2_050_000_000 },
    { month: '2026-03', volume: 2_400_000_000 },
  ],
};

export const mockReserveVsRateData: ReserveVsRateData = {
  quarters: [
    { quarter: 'Q1 2024', fedRate: 5.33, reserveYield: 5.10, spread: -0.23 },
    { quarter: 'Q2 2024', fedRate: 5.33, reserveYield: 5.15, spread: -0.18 },
    { quarter: 'Q3 2024', fedRate: 5.00, reserveYield: 4.85, spread: -0.15 },
    { quarter: 'Q4 2024', fedRate: 4.50, reserveYield: 4.40, spread: -0.10 },
    { quarter: 'Q1 2025', fedRate: 4.25, reserveYield: 4.18, spread: -0.07 },
    { quarter: 'Q2 2025', fedRate: 4.00, reserveYield: 3.95, spread: -0.05 },
    { quarter: 'Q3 2025', fedRate: 3.75, reserveYield: 3.72, spread: -0.03 },
    { quarter: 'Q4 2025', fedRate: 3.50, reserveYield: 3.48, spread: -0.02 },
  ],
};
