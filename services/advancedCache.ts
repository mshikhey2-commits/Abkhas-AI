/**
 * Advanced Caching Strategy
 * Implements smart caching with TTL and cache busting
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheConfig {
  ttl?: number; // Default TTL in milliseconds
  storage?: 'memory' | 'localStorage' | 'both';
  debug?: boolean;
}

class AdvancedCache {
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private PREFIX = 'cache_';

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: 30 * 60 * 1000, // 30 minutes default
      storage: 'both',
      debug: false,
      ...config,
    };

    this.cleanupExpired();
  }

  /**
   * Get from cache
   */
  get<T = any>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      this.log(`Cache HIT: ${key}`);
      return memoryEntry.data as T;
    }

    // Check localStorage if enabled
    if (this.config.storage === 'localStorage' || this.config.storage === 'both') {
      try {
        const stored = localStorage.getItem(this.PREFIX + key);
        if (stored) {
          const entry = JSON.parse(stored) as CacheEntry;
          if (!this.isExpired(entry)) {
            this.log(`Cache HIT (localStorage): ${key}`);
            // Move to memory for faster access
            this.memoryCache.set(key, entry);
            return entry.data as T;
          } else {
            localStorage.removeItem(this.PREFIX + key);
          }
        }
      } catch (e) {
        this.log(`Cache read error: ${key}`, 'warn');
      }
    }

    this.log(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set in cache
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl || 30 * 60 * 1000,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in localStorage if enabled
    if (this.config.storage === 'localStorage' || this.config.storage === 'both') {
      try {
        localStorage.setItem(this.PREFIX + key, JSON.stringify(entry));
        this.log(`Cache SET (both): ${key}`);
      } catch (e) {
        this.log(`Cache write error: ${key}`, 'warn');
      }
    } else {
      this.log(`Cache SET (memory): ${key}`);
    }
  }

  /**
   * Remove from cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) {
      // ignore
    }
    this.log(`Cache REMOVE: ${key}`);
  }

  /**
   * Check if data exists and is fresh
   */
  has(key: string): boolean {
    const entry = this.memoryCache.get(key) || this.getFromStorage(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Get with async resolver (cache-aside pattern)
   */
  async getOrFetch<T = any>(
    key: string,
    resolver: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and store
    try {
      const data = await resolver();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      this.log(`Fetch error for ${key}`, 'error');
      throw error;
    }
  }

  /**
   * Get multiple entries
   */
  getMultiple<T = any>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  /**
   * Set multiple entries
   */
  setMultiple<T = any>(entries: Record<string, T>, ttl?: number): void {
    Object.entries(entries).forEach(([key, data]) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // ignore
    }
    this.log('Cache CLEARED');
  }

  /**
   * Get cache size
   */
  getSize(): { memory: number; storage: number } {
    let storage = 0;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          storage += localStorage.getItem(key)?.length || 0;
        }
      });
    } catch (e) {
      // ignore
    }

    let memory = 0;
    this.memoryCache.forEach(entry => {
      memory += JSON.stringify(entry).length;
    });

    return { memory, storage };
  }

  /**
   * Get cache stats
   */
  getStats(): {
    entries: number;
    memory: string;
    storage: string;
    oldest: Date | null;
    newest: Date | null;
  } {
    const size = this.getSize();
    const entries = Array.from(this.memoryCache.values());

    return {
      entries: this.memoryCache.size,
      memory: `${(size.memory / 1024).toFixed(2)} KB`,
      storage: `${(size.storage / 1024).toFixed(2)} KB`,
      oldest: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.timestamp))) : null,
      newest: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.timestamp))) : null,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpired(): void {
    // Memory cleanup
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.memoryCache.delete(key));

    // localStorage cleanup
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const entry = JSON.parse(stored) as CacheEntry;
              if (this.isExpired(entry)) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (e) {
      // ignore
    }

    if (expiredKeys.length > 0) {
      this.log(`Cleaned up ${expiredKeys.length} expired entries`);
    }

    // Schedule next cleanup
    setTimeout(() => this.cleanupExpired(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get from localStorage
   */
  private getFromStorage(key: string): CacheEntry | null {
    try {
      const stored = localStorage.getItem(this.PREFIX + key);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Logging utility
   */
  private log(message: string, level: 'log' | 'warn' | 'error' = 'log'): void {
    if (this.config.debug) {
      console[level](`[AdvancedCache] ${message}`);
    }
  }
}

// Create singleton instance
export const cache = new AdvancedCache({ debug: false });

// Export hook for React components
export const useCache = () => {
  return {
    get: <T = any>(key: string) => cache.get<T>(key),
    set: <T = any>(key: string, data: T, ttl?: number) => cache.set(key, data, ttl),
    remove: (key: string) => cache.remove(key),
    has: (key: string) => cache.has(key),
    getOrFetch: <T = any>(key: string, resolver: () => Promise<T>, ttl?: number) =>
      cache.getOrFetch(key, resolver, ttl),
    clear: () => cache.clear(),
    getStats: () => cache.getStats(),
  };
};
