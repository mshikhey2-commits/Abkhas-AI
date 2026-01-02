// Advanced Multi-Layer Caching System for ABKHAS AI
// Implements memory cache, localStorage, and IndexedDB for optimal performance

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
  maxSize?: number; // Maximum cache size in bytes
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
  size: number;
}

// Layer 1: Memory Cache (fastest, limited by RAM)
export class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 52428800; // 50MB default
  private currentSize: number = 0;

  set<T>(key: string, data: T, ttl?: number): void {
    const size = JSON.stringify(data).length;
    
    // Evict if exceeds maxSize
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      const entry = this.cache.get(firstKey);
      if (entry) {
        this.currentSize -= entry.size;
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      size,
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      currentMemory: this.currentMemory,
      maxMemory: this.maxSize,
      hitRate: this.hitRate,
    };
  }

  private hitRate = 0;
}

// Layer 2: LocalStorage Cache (persistent, ~5-10MB limit)
export class LocalStorageCache {
  private prefix = "abkhas_";

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        size: 0,
      };

      const serialized = JSON.stringify(entry);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("LocalStorage quota exceeded, clearing old entries");
        this.clearOldestEntries();
        // Retry
        try {
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            size: 0,
          };
          const serialized = JSON.stringify(entry);
          localStorage.setItem(this.prefix + key, serialized);
        } catch (retryError) {
          console.error("Failed to set cache even after clearing:", retryError);
        }
      } else {
        console.error("Failed to set cache:", error);
      }
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check TTL
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Failed to get cache:", error);
      return null;
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error("Failed to delete cache:", error);
      return false;
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  private clearOldestEntries(): void {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .map((k) => ({
        key: k,
        timestamp: JSON.parse(localStorage.getItem(k) || "{}").timestamp || 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 10%
    const toRemove = Math.ceil(keys.length * 0.1);
    for (let i = 0; i < toRemove && i < keys.length; i++) {
      localStorage.removeItem(keys[i].key);
    }
  }
}

// Layer 3: IndexedDB Cache (large storage, ~50MB+)
export class IndexedDBCache {
  private dbName = "AbkhasCache";
  private storeName = "cache";
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
    });
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const entry: CacheEntry<T> & { key: string } = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
        size: 0,
      };

      const request = store.put(entry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check TTL
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
          this.delete(key);
          resolve(null);
        } else {
          resolve(entry.data);
        }
      };
    });
  }

  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Unified Cache Manager (uses all 3 layers)
export class CacheManager {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();
  private indexedDBCache = new IndexedDBCache();
  private initialized = false;

  async init(): Promise<void> {
    await this.indexedDBCache.init();
    this.initialized = true;
  }

  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    // Save to all layers
    this.memoryCache.set(key, data, ttl);
    this.localStorageCache.set(key, data, ttl);

    if (this.initialized) {
      await this.indexedDBCache.set(key, data, ttl);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory first (fastest)
    let data = this.memoryCache.get<T>(key);
    if (data !== null) return data;

    // Try localStorage
    data = this.localStorageCache.get<T>(key);
    if (data !== null) {
      this.memoryCache.set(key, data); // Refill memory cache
      return data;
    }

    // Try IndexedDB
    if (this.initialized) {
      data = await this.indexedDBCache.get<T>(key);
      if (data !== null) {
        this.memoryCache.set(key, data);
        this.localStorageCache.set(key, data);
        return data;
      }
    }

    return null;
  }

  async has(key: string): Promise<boolean> {
    return (
      this.memoryCache.has(key) ||
      this.localStorageCache.has(key) ||
      (this.initialized && (await this.indexedDBCache.has(key)))
    );
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.localStorageCache.delete(key);
    if (this.initialized) {
      await this.indexedDBCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.localStorageCache.clear();
    if (this.initialized) {
      await this.indexedDBCache.clear();
    }
  }

  // Cache products with 6-hour TTL
  async cacheProducts(products: any[], ttl = 6 * 60 * 60 * 1000): Promise<void> {
    await this.set("products", products, ttl);
  }

  async getProducts(): Promise<any[] | null> {
    return this.get("products");
  }

  // Cache user preferences with 30-day TTL
  async cacheUserPreferences(preferences: any): Promise<void> {
    await this.set("userPreferences", preferences, 30 * 24 * 60 * 60 * 1000);
  }

  async getUserPreferences(): Promise<any> {
    return this.get("userPreferences");
  }

  // Cache search results with 1-hour TTL
  async cacheSearchResults(query: string, results: any[]): Promise<void> {
    await this.set(`search_${query}`, results, 60 * 60 * 1000);
  }

  async getSearchResults(query: string): Promise<any[] | null> {
    return this.get(`search_${query}`);
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

export const getCacheManager = async (): Promise<CacheManager> => {
  if (!cacheManager) {
    cacheManager = new CacheManager();
    await cacheManager.init();
  }
  return cacheManager;
};

export default CacheManager;
