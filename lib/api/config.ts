// API Configuration
export const API_CONFIG = {
  // Phase 1: Free Core APIs
  circle: {
    baseUrl: 'https://api.circle.com/v1',
    apiKey: process.env.CIRCLE_API_KEY,
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY,
  },
  fred: {
    baseUrl: 'https://api.stlouisfed.org/fred',
    apiKey: process.env.FRED_API_KEY,
  },
  sec: {
    baseUrl: 'https://data.sec.gov',
    // No API key needed, but requires User-Agent header
  },
  yahooFinance: {
    baseUrl: 'https://query2.finance.yahoo.com',
    // No official API key
  },

  // Phase 2: Enhanced Analytics
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    rateLimit: 25, // requests per day for free tier
  },
  fmp: {
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    apiKey: process.env.FMP_API_KEY,
    rateLimit: 250, // requests per day for free tier
  },
  defillama: {
    baseUrl: 'https://api.llama.fi',
    // No API key needed
  },
  newsapi: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.NEWSAPI_KEY,
    rateLimit: 100, // requests per day for free tier
  },
  cryptocompare: {
    baseUrl: 'https://min-api.cryptocompare.com/data',
    apiKey: process.env.CRYPTOCOMPARE_API_KEY,
  },

  // Phase 3: Advanced/Premium
  dune: {
    baseUrl: 'https://api.dune.com/api/v1',
    apiKey: process.env.DUNE_API_KEY,
  },
  nansen: {
    baseUrl: 'https://api.nansen.ai/v1',
    apiKey: process.env.NANSEN_API_KEY,
  },
  glassnode: {
    baseUrl: 'https://api.glassnode.com/v1',
    apiKey: process.env.GLASSNODE_API_KEY,
  },

  // Blockchain Data
  etherscan: {
    baseUrl: 'https://api.etherscan.io/v2/api',
    apiKey: process.env.ETHERSCAN_API_KEY,
    rateLimit: 5, // calls per second for free tier
  },
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY,
  },
  thegraph: {
    apiKey: process.env.THEGRAPH_API_KEY,
  },

  // Optional
  finnhub: {
    baseUrl: 'https://finnhub.io/api/v1',
    apiKey: process.env.FINNHUB_API_KEY,
  },
  debank: {
    baseUrl: 'https://pro-openapi.debank.com/v1',
    apiKey: process.env.DEBANK_API_KEY,
  },
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  },
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  alphaVantage: { requests: 25, period: 'day' },
  fmp: { requests: 250, period: 'day' },
  newsapi: { requests: 100, period: 'day' },
  etherscan: { requests: 5, period: 'second' },
} as const;

// Cache TTL (Time to Live) in seconds
export const CACHE_TTL = {
  stockQuote: 60, // 1 minute
  stockHistory: 3600, // 1 hour
  usdcPrice: 60, // 1 minute
  usdcSupply: 300, // 5 minutes
  macroRates: 3600, // 1 hour
  financials: 86400, // 24 hours
  news: 300, // 5 minutes
  onchain: 300, // 5 minutes
  defi: 600, // 10 minutes
  smartMoney: 600, // 10 minutes
} as const;
