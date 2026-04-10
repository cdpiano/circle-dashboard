import { ApiResponse } from '../types';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public source?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  cacheTTL?: number; // Cache time-to-live in seconds
  cacheKey?: string;
}

/**
 * Generic API client with caching and error handling
 */
export async function fetchApi<T>(
  url: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTTL = 0,
    cacheKey = url,
  } = options;

  // Check cache
  if (cacheTTL > 0 && method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL * 1000) {
      return {
        data: cached.data as T,
        timestamp: cached.timestamp,
        cached: true,
        source: 'cache',
      };
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        url,
      );
    }

    const data = await response.json();
    const timestamp = Date.now();

    // Store in cache
    if (cacheTTL > 0 && method === 'GET') {
      cache.set(cacheKey, { data, timestamp });
    }

    return {
      data: data as T,
      timestamp,
      cached: false,
      source: url,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      url,
    );
  }
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Rate limiter utility
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  async throttle(): Promise<void> {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // Wait until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      // Retry after waiting
      return this.throttle();
    }

    this.requests.push(now);
  }
}

// Rate limiters for different APIs
const rateLimiters = {
  alphaVantage: new RateLimiter(5, 60 * 1000), // 5 per minute (conservative for free tier)
  newsapi: new RateLimiter(10, 60 * 1000), // 10 per minute
  etherscan: new RateLimiter(5, 1000), // 5 per second
};

export async function withRateLimit<T>(
  limiter: keyof typeof rateLimiters,
  fn: () => Promise<T>,
): Promise<T> {
  await rateLimiters[limiter].throttle();
  return fn();
}

/**
 * Retry logic for failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
