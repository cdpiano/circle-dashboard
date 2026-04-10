import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi, buildUrl, withRateLimit } from '../client';
import { NewsItem } from '@/lib/types';

const BASE_URL = API_CONFIG.newsapi.baseUrl;
const API_KEY = API_CONFIG.newsapi.apiKey;

/**
 * Get news about Circle and USDC
 */
export async function getCircleNews(pageSize: number = 20): Promise<NewsItem[]> {
  if (!API_KEY) {
    console.warn('NewsAPI key not configured, using mock data');
    return getMockNews();
  }

  try {
    const url = buildUrl(`${BASE_URL}/everything`, {
      q: 'Circle OR USDC OR "USD Coin" OR CRCL',
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: String(pageSize),
      apiKey: API_KEY,
    });

    const response = await withRateLimit('newsapi', () =>
      fetchApi<{
        articles: Array<{
          title: string;
          description: string;
          source: { name: string };
          url: string;
          publishedAt: string;
          urlToImage?: string;
        }>;
      }>(url, {
        cacheTTL: CACHE_TTL.news,
      }),
    );

    return response.data.articles.map((article, index) => ({
      id: `news-${index}`,
      title: article.title,
      summary: article.description || '',
      source: article.source.name,
      url: article.url,
      datetime: article.publishedAt,
      sentiment: analyzeSentiment(article.title + ' ' + article.description),
      image: article.urlToImage,
    }));
  } catch (error) {
    console.error('NewsAPI error:', error);
    return getMockNews();
  }
}

/**
 * Get crypto market news
 */
export async function getCryptoNews(pageSize: number = 10): Promise<NewsItem[]> {
  if (!API_KEY) {
    return [];
  }

  try {
    const url = buildUrl(`${BASE_URL}/everything`, {
      q: 'cryptocurrency OR stablecoin OR DeFi',
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: String(pageSize),
      apiKey: API_KEY,
    });

    const response = await withRateLimit('newsapi', () =>
      fetchApi<{
        articles: Array<{
          title: string;
          description: string;
          source: { name: string };
          url: string;
          publishedAt: string;
          urlToImage?: string;
        }>;
      }>(url, {
        cacheTTL: CACHE_TTL.news,
      }),
    );

    return response.data.articles.map((article, index) => ({
      id: `crypto-news-${index}`,
      title: article.title,
      summary: article.description || '',
      source: article.source.name,
      url: article.url,
      datetime: article.publishedAt,
      sentiment: analyzeSentiment(article.title + ' ' + article.description),
      image: article.urlToImage,
    }));
  } catch (error) {
    console.error('NewsAPI crypto news error:', error);
    return [];
  }
}

/**
 * Simple sentiment analysis based on keywords
 */
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  if (!text) return 'neutral';

  const textLower = text.toLowerCase();

  const positiveWords = [
    'surge',
    'gain',
    'rise',
    'growth',
    'bullish',
    'success',
    'adoption',
    'milestone',
    'expands',
    'wins',
    'partnership',
    'breakthrough',
  ];

  const negativeWords = [
    'drop',
    'fall',
    'loss',
    'bearish',
    'crisis',
    'concern',
    'risk',
    'lawsuit',
    'fraud',
    'hack',
    'vulnerability',
    'decline',
  ];

  const positiveCount = positiveWords.filter((word) => textLower.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => textLower.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getMockNews(): NewsItem[] {
  return [
    {
      id: '1',
      title: 'Circle Files for IPO on New York Stock Exchange',
      summary:
        'Circle Internet Financial has filed its S-1 with the SEC for a public listing on the NYSE under the ticker CRCL.',
      source: 'Bloomberg',
      url: '#',
      datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
    },
    {
      id: '2',
      title: 'USDC Market Cap Surpasses $60 Billion Milestone',
      summary:
        'The USDC stablecoin has reached a new all-time high in market capitalization, driven by institutional adoption.',
      source: 'CoinDesk',
      url: '#',
      datetime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
    },
    {
      id: '3',
      title: 'Federal Reserve Holds Interest Rates Steady at 4.25%',
      summary: "The Fed decided to maintain current rates, impacting Circle's reserve yield strategy.",
      source: 'Reuters',
      url: '#',
      datetime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
    },
    {
      id: '4',
      title: 'Circle Expands USDC Support to 5 New Blockchain Networks',
      summary:
        'Circle announced native USDC support on additional blockchain networks to expand cross-chain capabilities.',
      source: 'The Block',
      url: '#',
      datetime: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
    },
    {
      id: '5',
      title: 'Stablecoin Regulation Bill Advances in US Congress',
      summary: 'The proposed legislation would create a federal framework for stablecoin issuers like Circle.',
      source: 'Politico',
      url: '#',
      datetime: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
    },
  ];
}
