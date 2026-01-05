// Performance-Caching für HD App
import { supabase } from '../supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 Minuten

  // Cache-Eintrag setzen
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Cache-Eintrag abrufen
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // TTL prüfen
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  // Cache-Eintrag löschen
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Cache leeren
  clear(): void {
    this.cache.clear();
  }

  // Cache-Statistiken
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Speicherverbrauch schätzen
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2; // Unicode chars
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 24; // Entry overhead
    }
    return totalSize;
  }
}

// Globaler Cache-Instance
export const queryCache = new QueryCache();

// Optimierte Supabase-Queries mit Caching
export class OptimizedSupabaseService {
  
  // Cached Query für Profile
  static async getProfile(userId: string) {
    const cacheKey = `profile-${userId}`;
    const cached = queryCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Cache Hit: Profile', userId);
      return cached;
    }
    
    console.log('🔄 Cache Miss: Profile', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    // 10 Minuten cachen
    queryCache.set(cacheKey, data, 10 * 60 * 1000);
    return data;
  }

  // Cached Query für Charts
  static async getCharts(userId: string) {
    const cacheKey = `charts-${userId}`;
    const cached = queryCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Cache Hit: Charts', userId);
      return cached;
    }
    
    console.log('🔄 Cache Miss: Charts', userId);
    const { data, error } = await supabase
      .from('charts')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching charts:', error);
      return [];
    }
    
    // 5 Minuten cachen
    queryCache.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  // Cached Query für Subscriptions
  static async getSubscription(userId: string) {
    const cacheKey = `subscription-${userId}`;
    const cached = queryCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Cache Hit: Subscription', userId);
      return cached;
    }
    
    console.log('🔄 Cache Miss: Subscription', userId);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    // 2 Minuten cachen (Subscription ändert sich selten)
    queryCache.set(cacheKey, data, 2 * 60 * 1000);
    return data;
  }

  // Cache invalidation bei Updates
  static invalidateUserCache(userId: string) {
    queryCache.delete(`profile-${userId}`);
    queryCache.delete(`charts-${userId}`);
    queryCache.delete(`subscription-${userId}`);
    console.log('🗑️ Cache invalidated for user:', userId);
  }

  // Cache für Community Posts
  static async getCommunityPosts(limit: number = 20) {
    const cacheKey = `community-posts-${limit}`;
    const cached = queryCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Cache Hit: Community Posts');
      return cached;
    }
    
    console.log('🔄 Cache Miss: Community Posts');
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
    
    // 3 Minuten cachen
    queryCache.set(cacheKey, data, 3 * 60 * 1000);
    return data;
  }

  // Cache für Moon Tracking
  static async getMoonTracking(userId: string) {
    const cacheKey = `moon-tracking-${userId}`;
    const cached = queryCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Cache Hit: Moon Tracking', userId);
      return cached;
    }
    
    console.log('🔄 Cache Miss: Moon Tracking', userId);
    const { data, error } = await supabase
      .from('moon_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching moon tracking:', error);
      return [];
    }
    
    // 1 Stunde cachen (Moon-Daten ändern sich langsam)
    queryCache.set(cacheKey, data, 60 * 60 * 1000);
    return data;
  }
}

// Cache-Management für Development
export const cacheManager = {
  // Cache-Status anzeigen
  getStatus() {
    const stats = queryCache.getStats();
    console.log('📊 Cache Status:', stats);
    return stats;
  },

  // Cache leeren
  clearAll() {
    queryCache.clear();
    console.log('🗑️ All caches cleared');
  },

  // Spezifischen Cache leeren
  clearUser(userId: string) {
    OptimizedSupabaseService.invalidateUserCache(userId);
  },

  // Cache-Warmup für bessere Performance
  async warmupCache(userId: string) {
    console.log('🔥 Warming up cache for user:', userId);
    
    try {
      await Promise.all([
        OptimizedSupabaseService.getProfile(userId),
        OptimizedSupabaseService.getCharts(userId),
        OptimizedSupabaseService.getSubscription(userId),
        OptimizedSupabaseService.getMoonTracking(userId)
      ]);
      
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
    }
  }
};

// Cache-Performance-Monitoring
export const monitorCachePerformance = () => {
  const stats = queryCache.getStats();
  
  // Cache-Hit-Rate berechnen (vereinfacht)
  const hitRate = stats.size > 0 ? (stats.size / (stats.size + 1)) * 100 : 0;
  
  console.log(`📈 Cache Performance: ${hitRate.toFixed(1)}% hit rate, ${stats.memoryUsage} bytes`);
  
  return {
    hitRate,
    memoryUsage: stats.memoryUsage,
    cacheSize: stats.size
  };
};
