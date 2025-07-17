import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisStats } from 'src/common/types/common.types';

export interface CacheConfig {
  ttl?: number;
  prefix?: string;
}

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key;
      const value = await this.cacheManager.get<string>(fullKey);

      if (value) {
        this.logger.debug(`Cache HIT: ${fullKey}`);
        // Try to parse JSON, fallback to raw value
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      } else {
        this.logger.debug(`Cache MISS: ${fullKey}`);
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value to cache (dùng TTL mặc định ở config)
   */
  async set<T>(key: string, value: T, prefix?: string): Promise<void> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key;
      const storeValue =
        typeof value === 'object' ? JSON.stringify(value) : value;
      await this.cacheManager.set(fullKey, storeValue);
      this.logger.debug(`Cache SET: ${fullKey} (default TTL)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = prefix ? `${prefix}:${key}` : key;
      await this.cacheManager.del(fullKey);
      this.logger.debug(`Cache DEL: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // For Redis, we need to use the underlying client
      const store = (this.cacheManager as unknown as { store?: unknown }).store;
      if (
        store &&
        typeof (store as { getClient?: () => unknown }).getClient === 'function'
      ) {
        const client = (store as { getClient: () => unknown }).getClient();
        if (
          client &&
          typeof (client as { keys?: (pattern: string) => Promise<string[]> })
            .keys === 'function'
        ) {
          const keys = await (
            client as { keys: (pattern: string) => Promise<string[]> }
          ).keys(pattern);
          for (const key of keys) {
            await this.cacheManager.del(key);
          }
          this.logger.debug(
            `Cache DEL PATTERN: ${pattern} (${keys.length} keys)`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // For Redis, we need to use the underlying client
      const store = (this.cacheManager as unknown as { store?: unknown }).store;
      if (
        store &&
        typeof (store as { getClient?: () => unknown }).getClient === 'function'
      ) {
        const client = (store as { getClient: () => unknown }).getClient();
        if (
          client &&
          typeof (client as { flushdb?: () => Promise<void> }).flushdb ===
            'function'
        ) {
          await (client as { flushdb: () => Promise<void> }).flushdb();
          this.logger.debug('Cache RESET: All cache cleared');
        }
      }
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<RedisStats | null> {
    try {
      // Get the underlying Redis client from cacheManager
      const store = (this.cacheManager as unknown as { store?: unknown }).store;
      if (
        store &&
        typeof (store as { getClient?: () => unknown }).getClient === 'function'
      ) {
        const client = (store as { getClient: () => unknown }).getClient();
        if (
          client &&
          typeof (client as { info?: () => Promise<string> }).info ===
            'function'
        ) {
          const info = await (client as { info: () => Promise<string> }).info();
          return this.parseRedisInfo(info);
        }
      }
      return {
        connected: false,
        error: 'Redis client or info() not available',
      };
    } catch (e) {
      return { connected: false, error: (e as Error).message };
    }
  }

  /**
   * Parse Redis INFO command output
   */
  private parseRedisInfo(info: string): RedisStats {
    const lines = info.split('\r\n');
    const stats: Record<string, unknown> = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }

    return {
      connected: true,
      stats: {
        redis_version: (stats.redis_version as string) || '',
        total_connections_received:
          parseInt(stats.total_connections_received as string) || 0,
        total_commands_processed:
          parseInt(stats.total_commands_processed as string) || 0,
        keyspace_hits: parseInt(stats.keyspace_hits as string) || 0,
        keyspace_misses: parseInt(stats.keyspace_misses as string) || 0,
        used_memory: (stats.used_memory as string) || '',
        used_memory_peak: (stats.used_memory_peak as string) || '',
        connected_clients: parseInt(stats.connected_clients as string) || 0,
        blocked_clients: parseInt(stats.blocked_clients as string) || 0,
      },
    };
  }

  /**
   * withCache helper (không truyền TTL từng lần set)
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    config?: CacheConfig,
  ): Promise<T> {
    const cached = await this.get<T>(key, config?.prefix);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, config?.prefix);
    return result;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await this.delPattern(pattern);
  }

  /**
   * Invalidate cache for specific entity
   */
  async invalidateEntity(entity: string, id?: string): Promise<void> {
    const pattern = id ? `${entity}:${id}` : `${entity}:*`;
    await this.invalidatePattern(pattern);
  }
}
