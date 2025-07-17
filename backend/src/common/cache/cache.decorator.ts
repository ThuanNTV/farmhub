import { SetMetadata } from '@nestjs/common';
import { PropertyDescriptor } from 'src/common/types/common.types';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_TTL_METADATA = 'cache_ttl_metadata';

export interface CacheOptions {
  key?: string;
  ttl?: number;
  prefix?: string;
}

/**
 * Cache decorator for methods
 * Usage: @Cacheable({ key: 'user', ttl: 300 })
 */
export const Cacheable = (options: CacheOptions = {}) => {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY_METADATA, options.key ?? propertyKey)(
      target as object,
      propertyKey,
      descriptor,
    );
    SetMetadata(CACHE_TTL_METADATA, options.ttl)(
      target as object,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};

/**
 * Cache key decorator
 * Usage: @CacheKey('user')
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * Cache TTL decorator
 * Usage: @CacheTTL(300)
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * Cache invalidate decorator
 * Usage: @CacheInvalidate('user:*')
 */
export const CacheInvalidate = (pattern: string) => {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const result = (await originalMethod.apply(this, args)) as unknown;

      // Invalidate cache after method execution
      const self = this as {
        cacheService?: {
          invalidatePattern: (pattern: string) => Promise<void>;
        };
      };
      if (
        self.cacheService &&
        typeof self.cacheService.invalidatePattern === 'function'
      ) {
        await self.cacheService.invalidatePattern(pattern);
      }

      return result;
    };

    return descriptor;
  };
};
