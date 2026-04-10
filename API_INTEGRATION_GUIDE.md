# Circle Dashboard - API Integration Guide

This guide explains how to configure and use all the data sources integrated into the Circle Dashboard.

## Overview

The dashboard integrates **15+ data sources** across 3 phases:
- **Phase 1**: Free core data APIs (Circle, CoinGecko, FRED, SEC EDGAR, Yahoo Finance)
- **Phase 2**: Enhanced analytics APIs (Alpha Vantage, DeFiLlama, NewsAPI, CryptoCompare)
- **Phase 3**: Advanced/Premium APIs (Dune, Nansen, Glassnode)

---

## Phase 1: Free Core Data APIs

### 1. Circle Official API
**Purpose**: USDC supply by blockchain, reserve attestation

**Setup**:
```bash
CIRCLE_API_KEY=your_circle_api_key_here
```

- Sign up: https://developers.circle.com
- Free tier available
- **Features**: Supply by chain, transparency reports

---

### 2. CoinGecko API
**Purpose**: USDC price, market cap, stablecoin comparison

**Setup**:
```bash
COINGECKO_API_KEY=your_coingecko_key_here
```

- Sign up: https://www.coingecko.com/en/api
- Free tier: 10-50 calls/min
- **Features**: Real-time pricing, market data, historical charts

---

### 3. FRED (Federal Reserve Economic Data)
**Purpose**: Macro rates (Fed Funds, Treasury yields, CPI)

**Setup**:
```bash
FRED_API_KEY=your_fred_key_here
```

- Sign up: https://fred.stlouisfed.org/docs/api/api_key.html
- **Completely FREE** - no limits
- **Features**: Official Fed data, interest rates, economic indicators

---

### 4. SEC EDGAR
**Purpose**: SEC filings (10-K, 10-Q, 8-K), financial statements

**Setup**: No API key required! Public API

- Documentation: https://www.sec.gov/developer
- **Features**: Official financial reports, earnings, regulatory filings

---

### 5. Yahoo Finance
**Purpose**: CRCL stock price, historical data

**Setup**: No official API key required

- Uses unofficial public endpoints
- **Features**: Real-time stock quotes, historical candles, volume

---

## Phase 2: Enhanced Analytics APIs

### 6. Alpha Vantage
**Purpose**: Advanced stock data, technical indicators, financial statements

**Setup**:
```bash
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

- Sign up: https://www.alphavantage.co/support/#api-key
- Free tier: 25 requests/day
- Paid plans: $49.99 - $249.99/month
- **Features**: Valuation metrics (P/E, P/S), income statements, balance sheets, RSI, MACD

---

### 7. Financial Modeling Prep (FMP)
**Purpose**: Deep financial data, DCF models

**Setup**:
```bash
FMP_API_KEY=your_fmp_key_here
```

- Sign up: https://site.financialmodelingprep.com/developer/docs
- Free tier: 250 requests/day
- **Features**: Financial ratios, DCF valuations, earnings calendar

---

### 8. DeFiLlama
**Purpose**: USDC distribution across DeFi protocols

**Setup**: No API key required! Public API

- Documentation: https://defillama.com/docs/api
- **Completely FREE**
- **Features**: TVL by protocol, stablecoin dominance, DeFi analytics

---

### 9. NewsAPI
**Purpose**: Circle and crypto news aggregation

**Setup**:
```bash
NEWSAPI_KEY=your_newsapi_key_here
```

- Sign up: https://newsapi.org/register
- Free tier: 100 requests/day
- **Features**: News sentiment analysis, multi-source aggregation

---

### 10. CryptoCompare
**Purpose**: Crypto-specific news and data

**Setup**:
```bash
CRYPTOCOMPARE_API_KEY=your_cryptocompare_key_here
```

- Sign up: https://min-api.cryptocompare.com/
- **Features**: Crypto news, sentiment, social data

---

## Phase 3: Advanced/Premium APIs

### 11. Dune Analytics
**Purpose**: Custom on-chain queries, whale tracking, mint/burn data

**Setup**:
```bash
DUNE_API_KEY=your_dune_api_key_here
```

- Sign up: https://dune.com/docs/api/
- Requires creating queries on Dune dashboard
- **Features**: Custom SQL queries, whale wallets, holder distribution

**Note**: You need to create queries on Dune.com first, then execute them via API

---

### 12. Nansen
**Purpose**: Smart money tracking, labeled wallets, token insights

**Setup**:
```bash
NANSEN_API_KEY=your_nansen_api_key_here
```

- Contact Nansen for API access (enterprise plan required)
- Premium service: $$$$
- **Features**: 500M+ labeled wallets, smart money flows, "God Mode" insights

---

### 13. Glassnode
**Purpose**: On-chain metrics, holder distribution, velocity

**Setup**:
```bash
GLASSNODE_API_KEY=your_glassnode_key_here
```

- Sign up: https://docs.glassnode.com/api/
- Free tier available with limited metrics
- **Features**: 7500+ metrics, supply dynamics, active addresses

---

## Blockchain Data APIs

### 14. Etherscan
**Purpose**: Ethereum on-chain data, USDC contract interactions

**Setup**:
```bash
ETHERSCAN_API_KEY=your_etherscan_key_here
```

- Sign up: https://etherscan.io/apis
- Free tier: 5 calls/second
- **Features**: Transaction history, smart contract events, holder list

---

### 15. Alchemy
**Purpose**: Multi-chain RPC, enhanced APIs

**Setup**:
```bash
ALCHEMY_API_KEY=your_alchemy_key_here
```

- Sign up: https://www.alchemy.com/
- **Features**: Multi-chain support, NFT APIs, webhooks

---

## Quick Start

### 1. Copy Environment Variables
```bash
cp .env.example .env.local
```

### 2. Add Your API Keys
Edit `.env.local` and add keys for the services you want to use.

### 3. Start in Mock Mode (No Keys Required)
```bash
USE_MOCK=true npm run dev
```

### 4. Enable Real APIs
Remove or set `USE_MOCK=false` in `.env.local`, then restart:
```bash
npm run dev
```

---

## Data Sources by Feature

### Stock Price & Financials
- Yahoo Finance → Real-time CRCL price
- Alpha Vantage → Valuation metrics, technical indicators
- SEC EDGAR → Official filings
- FMP → Deep financial analysis

### USDC Market Data
- CoinGecko → Price, market cap, volume
- Circle API → Supply by blockchain
- DeFiLlama → Stablecoin dominance

### DeFi Analytics
- DeFiLlama → USDC in protocols (Aave, Compound, etc.)
- Dune Analytics → Custom DeFi queries

### On-Chain Data
- Etherscan → Ethereum transactions
- Glassnode → Supply metrics, active addresses
- Dune → Mint/burn events, whale tracking
- Nansen → Smart money flows

### Macro Economy
- FRED → Fed rates, Treasury yields, CPI

### News & Sentiment
- NewsAPI → Circle/USDC news
- CryptoCompare → Crypto-specific news

### Whale & Smart Money Tracking
- Dune Analytics → Top holders
- Nansen → Labeled wallets, smart money
- Glassnode → Holder distribution

---

## API Rate Limits & Costs

| Service | Free Tier | Rate Limit | Cost |
|---------|-----------|------------|------|
| **CoinGecko** | ✅ Yes | 10-50/min | Free or $199/mo Pro |
| **FRED** | ✅ Yes | Unlimited | **FREE** |
| **SEC EDGAR** | ✅ Yes | 10/sec | **FREE** |
| **Yahoo Finance** | ✅ Yes | Unofficial | **FREE** |
| **Alpha Vantage** | ✅ Yes | 25/day | $49.99-$249.99/mo |
| **FMP** | ✅ Yes | 250/day | $0-$69/mo |
| **DeFiLlama** | ✅ Yes | Unlimited | **FREE** |
| **NewsAPI** | ✅ Yes | 100/day | $0-$449/mo |
| **Dune** | ✅ Limited | 10 queries/mo | $99-$390/mo |
| **Nansen** | ❌ No | N/A | Enterprise only |
| **Glassnode** | ✅ Limited | Varies | $0-$799/mo |
| **Etherscan** | ✅ Yes | 5/sec | **FREE** |

---

## Architecture

### API Service Layer
```
lib/api/
├── config.ts           # API endpoints and keys
├── client.ts           # Fetch wrapper with caching & rate limiting
├── services/
│   ├── circle.ts       # Circle Official API
│   ├── coingecko.ts    # CoinGecko
│   ├── fred.ts         # FRED
│   ├── sec.ts          # SEC EDGAR
│   ├── yahoo-finance.ts
│   ├── alpha-vantage.ts
│   ├── defillama.ts
│   ├── newsapi.ts
│   ├── dune.ts
│   ├── glassnode.ts
│   └── nansen.ts
└── index.ts            # Unified exports
```

### API Routes
```
app/api/
├── stock/route.ts      # Stock quotes & history
├── usdc/route.ts       # USDC market data
├── macro/route.ts      # Macro rates
├── news/route.ts       # News feed
├── financials/route.ts # Financial metrics
├── onchain/route.ts    # On-chain data
├── defi/route.ts       # DeFi distribution
└── analytics/route.ts  # Growth, whales, smart money
```

---

## Caching Strategy

The dashboard implements intelligent caching to minimize API calls:

| Data Type | Cache TTL |
|-----------|-----------|
| Stock Quote | 60 seconds |
| Stock History | 1 hour |
| USDC Price | 60 seconds |
| USDC Supply | 5 minutes |
| Macro Rates | 1 hour |
| Financials | 24 hours |
| News | 5 minutes |
| On-chain | 5 minutes |
| DeFi | 10 minutes |

---

## Error Handling

All API services include:
1. **Automatic fallback to mock data** if API fails
2. **Retry logic** (up to 3 attempts with exponential backoff)
3. **Rate limiting** to avoid hitting API limits
4. **Graceful degradation** - dashboard works even if some APIs are unavailable

---

## Adding New Components

To display new data on the dashboard:

1. Add API route in `app/api/[name]/route.ts`
2. Create component in `components/[category]/[Name].tsx`
3. Add to main page in `app/page.tsx`

Example:
```tsx
import DefiDistribution from '@/components/defi/DefiDistribution';

// In your page:
<DefiDistribution />
```

---

## Recommended Setup for Different Use Cases

### 1. **Free Tier Only** (No paid APIs)
Enable: CoinGecko, FRED, SEC EDGAR, Yahoo Finance, DeFiLlama
- Cost: $0/month
- Coverage: ~70% of features

### 2. **Budget Setup** ($50-100/month)
Add: Alpha Vantage ($50), NewsAPI ($30)
- Cost: ~$80/month
- Coverage: ~85% of features

### 3. **Professional Setup** ($200-500/month)
Add: Dune Analytics ($99), Glassnode ($99-299), FMP ($69)
- Cost: ~$300/month
- Coverage: ~95% of features

### 4. **Enterprise Setup** ($1000+/month)
Add: Nansen (enterprise), CoinGecko Pro ($199)
- Cost: $1000+/month
- Coverage: 100% of features

---

## Troubleshooting

### "API key not configured" warnings
- Check `.env.local` has the correct key name
- Restart dev server after adding keys

### Rate limit errors
- Dashboard has built-in rate limiting
- If you hit limits, consider upgrading to paid tier

### Mock data still showing
- Make sure `USE_MOCK=false` in `.env.local`
- Check API keys are valid
- Look at browser console for error messages

---

## Support

For issues with specific APIs:
- Check the provider's documentation
- Verify your API key is active
- Check rate limits haven't been exceeded

For dashboard issues:
- Check browser console for errors
- Verify `.env.local` configuration
- Try running in mock mode first

---

## Next Steps

1. ✅ All API services created
2. ✅ All route handlers updated
3. ✅ New UI components for advanced features
4. 🔲 Deploy to production
5. 🔲 Set up monitoring for API health
6. 🔲 Add more data visualizations

---

**Happy investing! 📈**
