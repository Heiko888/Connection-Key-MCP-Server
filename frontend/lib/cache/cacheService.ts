/**
 * Cache Service für Performance-Optimierung
 */

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  strategy?: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

class CacheService {
  private cache: Map<string, CacheItem> = new Map();
  private options: Required<CacheOptions>;
  private accessOrder: string[] = [];

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'lru'
    };
  }

  public set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const now = Date.now();
    
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      hits: 0
    };

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access info
    item.hits++;
    this.updateAccessOrder(key);
    
    return item.data;
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expiresAt : false;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  public size(): number {
    return this.cache.size;
  }

  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    expiredItems: number;
  } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, item) => sum + item.hits, 0);
    const expiredItems = Array.from(this.cache.values()).filter(item => Date.now() > item.expiresAt).length;
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits,
      expiredItems
    };
  }

  private evict(): void {
    switch (this.options.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
      case 'lfu':
        this.evictLFU();
        break;
    }
  }

  private evictLRU(): void {
    // Remove least recently used (oldest in access order)
    if (this.accessOrder.length > 0) {
      const keyToRemove = this.accessOrder[0];
      this.cache.delete(keyToRemove);
      this.removeFromAccessOrder(keyToRemove);
    }
  }

  private evictFIFO(): void {
    // Remove first in, first out (oldest by timestamp)
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removeFromAccessOrder(oldestKey);
    }
  }

  private evictLFU(): void {
    // Remove least frequently used (lowest hit count)
    let leastUsedKey = '';
    let leastHits = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.hits < leastHits) {
        leastHits = item.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.removeFromAccessOrder(leastUsedKey);
    }
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  public cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });
  }
}

// Singleton instances for different use cases
export const apiCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  strategy: 'lru'
});

export const userCache = new CacheService({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 100,
  strategy: 'lru'
});

export const analyticsCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 20,
  strategy: 'lfu'
});

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  cache: CacheService,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function and cache result
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Cache middleware for API calls
export function withCache<T>(
  apiCall: () => Promise<T>,
  cache: CacheService,
  key: string,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }
  
  // Make API call and cache result
  return apiCall().then(result => {
    cache.set(key, result, ttl);
    return result;
  });
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  apiCache.cleanup();
  userCache.cleanup();
  analyticsCache.cleanup();
}, 5 * 60 * 1000);
