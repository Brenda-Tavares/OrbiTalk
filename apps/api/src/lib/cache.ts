import { FastifyInstance } from "fastify";

interface CacheEntry<T> {
  data: T;
  expires: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
    setInterval(() => this.cleanup(), 60000);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds || this.ttl;
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const contentCache = new SimpleCache(300);
export const profileCache = new SimpleCache(600);
export const translationCache = new SimpleCache(3600);

export function rateLimit(requests: number, windowMs: number) {
  const requestsMap = new Map<string, { count: number; resetTime: number }>();

  return {
    check: (key: string): boolean => {
      const now = Date.now();
      const record = requestsMap.get(key);

      if (!record || now > record.resetTime) {
        requestsMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (record.count >= requests) {
        return false;
      }

      record.count++;
      return true;
    },
    reset: (key: string): void => {
      requestsMap.delete(key);
    },
  };
}

export const aiRateLimit = rateLimit(10, 60000);
export const moderationRateLimit = rateLimit(30, 60000);
export const translationRateLimit = rateLimit(100, 60000);

export function getCacheKey(prefix: string, ...args: string[]): string {
  return `${prefix}:${args.join(":")}`;
}
