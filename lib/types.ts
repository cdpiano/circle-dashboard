// Stock data
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
}

export interface CandleData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// USDC data
export interface UsdcData {
  price: number;
  marketCap: number;
  totalVolume: number;
  circulatingSupply: number;
  marketCapChange24h: number;
  priceChange24h: number;
  marketCapHistory: { date: string; value: number }[];
}

export interface StablecoinComparison {
  name: string;
  symbol: string;
  marketCap: number;
  share: number;
}

// Financial data
export interface FinancialMetrics {
  revenue: number;
  revenueGrowth: number;
  netIncome: number;
  eps: number;
  totalAssets: number;
  totalDebt: number;
  freeCashFlow: number;
  period: string;
}

export interface QuarterlyRevenue {
  quarter: string;
  revenue: number;
  netIncome: number;
  adjEbitda?: number;
  rldcMargin?: number;
}

export interface SecFiling {
  type: string;
  date: string;
  description: string;
  url: string;
}

// Macro data
export interface MacroRate {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  lastUpdated: string;
  history: { date: string; value: number }[];
}

// News
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  datetime: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  image?: string;
}

// On-chain
export interface OnchainData {
  totalSupply: string;
  totalSupplyFormatted: number;
  holderCount?: number;
  transfers24h?: number;
  largeTransfers: LargeTransfer[];
}

export interface LargeTransfer {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: string;
  blockNumber: number;
}

// Dashboard section props
export interface SectionProps {
  className?: string;
}

// ============================================
// NEW DATA TYPES FOR ENHANCED FEATURES
// ============================================

// DeFi & Protocol Data
export interface DeFiProtocolData {
  protocol: string;
  tvl: number;
  usdcAmount: number;
  share: number;
  apy?: number;
  change24h: number;
}

export interface ChainDistribution {
  chain: string;
  amount: number;
  percentage: number;
  holders?: number;
  transactions24h?: number;
}

// Valuation & Financial Ratios
export interface ValuationMetrics {
  pe?: number; // Price to Earnings
  ps?: number; // Price to Sales
  pb?: number; // Price to Book
  pegRatio?: number;
  evToEbitda?: number;
  priceToFreeCashFlow?: number;
  marketCapToRevenue?: number;
}

export interface ProfitabilityMetrics {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number; // Return on Equity
  roa: number; // Return on Assets
  roic: number; // Return on Invested Capital
}

export interface RevenuePerUsdc {
  value: number; // Revenue per USDC in circulation
  trend: 'up' | 'down' | 'stable';
  history: { date: string; value: number }[];
}

// Reserve & Risk Data
export interface ReserveComposition {
  assetType: string; // "US Treasury", "Cash", "Commercial Paper", etc.
  amount: number;
  percentage: number;
  maturity?: string; // e.g., "< 3 months"
}

export interface DepegEvent {
  date: string;
  minPrice: number;
  maxPrice: number;
  duration: number; // in minutes
  recovered: boolean;
  cause?: string;
}

export interface RiskMetrics {
  reserves: ReserveComposition[];
  reserveRatio: number; // e.g., 1.05 means 105% backed
  depegEvents: DepegEvent[];
  regulatoryStatus: string;
  auditDate?: string;
  attestationUrl?: string;
}

// Growth & Adoption Metrics
export interface GrowthMetrics {
  newHolders24h: number;
  newHolders7d: number;
  newHolders30d: number;
  activeAddresses24h: number;
  activeAddresses7d: number;
  activeAddresses30d: number;
  netFlow24h: number; // Positive = net minting
  netFlow7d: number;
  netFlow30d: number;
}

export interface MintBurnData {
  date: string;
  minted: number;
  burned: number;
  net: number;
}

export interface UseCaseDistribution {
  category: string; // "DeFi", "CEX", "Payments", "Treasury", "Other"
  amount: number;
  percentage: number;
}

// Smart Money & Whale Tracking
export interface WhaleWallet {
  address: string;
  label?: string; // "Binance", "Jump Trading", etc.
  balance: number;
  change24h: number;
  change7d: number;
  category: 'exchange' | 'fund' | 'treasury' | 'unknown';
}

export interface SmartMoneyFlow {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
  topBuyers: { address: string; amount: number }[];
  topSellers: { address: string; amount: number }[];
}

// Macro Correlation Data
export interface CorrelationData {
  asset: string; // "BTC", "ETH", "DXY", "SPY"
  correlation: number; // -1 to 1
  period: '7d' | '30d' | '90d';
}

export interface InterestRateSensitivity {
  rate: number;
  projectedRevenue: number;
  projectedMargin: number;
}

// Competitive Comparison
export interface CompetitorMetrics {
  name: string;
  symbol: string;
  marketCap: number;
  revenue?: number;
  pe?: number;
  ps?: number;
  growth?: number;
}

// Technical Indicators (for stock)
export interface TechnicalIndicators {
  rsi: number; // Relative Strength Index
  macd: { value: number; signal: number; histogram: number };
  sma50: number;
  sma200: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  volume: number;
  volumeAvg: number;
}

// Sentiment Analysis
export interface SentimentData {
  overall: 'bullish' | 'neutral' | 'bearish';
  score: number; // -100 to 100
  sources: {
    twitter: number;
    news: number;
    reddit?: number;
  };
  trending: boolean;
  mentionsChange24h: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  cached: boolean;
  source: string;
  error?: string;
}

// USDC Peg (Premium/Discount) data
export interface UsdcPegData {
  currentPrice: number;
  deviation: number;
  status: 'normal' | 'watch' | 'depeg-risk';
  history: { date: string; deviation: number }[];
}

// CPN (Circle Payments Network) data
export interface CpnVolumeData {
  currentMonthVolume: number;
  momGrowth: number;
  history: { month: string; volume: number }[];
}

// Reserve vs Fed Rate data
export interface ReserveVsRateData {
  quarters: {
    quarter: string;
    fedRate: number;
    reserveYield: number;
    spread: number;
  }[];
}
