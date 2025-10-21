import type { GeolocatedStory } from './types';

/**
 * Simple in-memory cache for news stories
 * In production, replace with Redis or another distributed cache
 */
export class NewsCache {
  private cache: Map<string, { data: GeolocatedStory[]; timestamp: number }>;
  private readonly TTL: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 10) {
    this.cache = new Map();
    this.TTL = ttlMinutes * 60 * 1000;
  }

  /**
   * Get cached stories if still valid
   */
  get(key: string = 'global'): GeolocatedStory[] | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit for "${key}" (age: ${Math.round(age / 1000)}s)`);
    return cached.data;
  }

  /**
   * Set cached stories
   */
  set(data: GeolocatedStory[], key: string = 'global'): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`Cached ${data.length} stories for "${key}"`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { entries: number; totalStories: number; oldestAge: number } {
    const now = Date.now();
    let totalStories = 0;
    let oldestAge = 0;

    for (const value of this.cache.values()) {
      totalStories += value.data.length;
      const age = now - value.timestamp;
      if (age > oldestAge) {
        oldestAge = age;
      }
    }

    return {
      entries: this.cache.size,
      totalStories,
      oldestAge: Math.round(oldestAge / 1000),
    };
  }
}

// Singleton instance
export const newsCache = new NewsCache(10); // 10 minute TTL
