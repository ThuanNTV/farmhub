#!/usr/bin/env ts-node

/**
 * Simple Redis Test Script
 * Tests Redis cache service without NestJS dependencies
 */

import Redis from 'ioredis';
import { RedisCacheService } from 'src/common/cache/redis-cache.service';

async function testRedisSimple() {
  console.log('🚀 Testing Redis Cache Service...');

  // Create Redis client
  const redis = new Redis({
    host: 'redis-15376.c8.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 15376,
    password: 'cKJ33HfJNxKyXxR36RcwqD91ijzexy47',
    db: 0,
    connectTimeout: 10000,
    lazyConnect: true,
    keepAlive: 30000,
    family: 4,
  });

  // Create cache service instance
  const cacheService = new RedisCacheService(redis as any);

  try {
    // Test basic operations
    console.log('🧪 Testing basic cache operations...');

    const testData = {
      id: 'test-product-123',
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      timestamp: new Date().toISOString(),
    };

    // Test set operation
    await cacheService.set('test:product:123', testData);
    console.log('✅ Cache set operation successful');

    // Test get operation
    const cachedData = await cacheService.get('test:product:123');
    console.log('✅ Cache get operation successful');
    console.log('📦 Cached data:', cachedData);

    // Test cache miss
    const nonExistentData = await cacheService.get('test:product:999');
    console.log('✅ Cache miss test successful:', nonExistentData);

    // Test withCache helper
    console.log('🔄 Testing withCache helper...');
    const expensiveResult = await cacheService.withCache(
      'test:expensive:operation',
      async () => {
        console.log('  ⏳ Simulating expensive operation...');
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          data: 'expensive result',
          timestamp: Date.now(),
          random: Math.random(),
        };
      },
      { ttl: 60 },
    );
    console.log('✅ withCache helper successful:', expensiveResult);

    // Test cache invalidation
    console.log('🗑️ Testing cache invalidation...');
    await cacheService.set('test:pattern:1', 'value1');
    await cacheService.set('test:pattern:2', 'value2');
    await cacheService.set('test:other:3', 'value3');

    await cacheService.invalidatePattern('test:pattern:*');

    const remaining1 = await cacheService.get('test:pattern:1');
    const remaining2 = await cacheService.get('test:other:3');

    console.log('✅ Cache invalidation test:', {
      pattern1: remaining1,
      other: remaining2,
    });

    // Test cache statistics
    console.log('📊 Testing cache statistics...');
    const stats = await cacheService.getStats();
    if (stats && stats.stats) {
      console.log('\ud83d\udcc8 Cache Statistics:');
      console.log(`- Connected Clients: ${stats.stats.connected_clients}`);
      console.log(`- Used Memory: ${stats.stats.used_memory}`);
      console.log(`- Keyspace Hits: ${stats.stats.keyspace_hits}`);
      console.log(`- Keyspace Misses: ${stats.stats.keyspace_misses}`);

      if (
        typeof stats.stats.keyspace_hits === 'number' &&
        typeof stats.stats.keyspace_misses === 'number'
      ) {
        const hitRate =
          stats.stats.keyspace_hits /
          (stats.stats.keyspace_hits + stats.stats.keyspace_misses);
        console.log(`- Hit Rate: ${(hitRate * 100).toFixed(2)}%`);
      }
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await cacheService.invalidatePattern('test:*');
    console.log('✅ Cleanup completed');

    console.log('🎉 All Redis cache service tests passed!');
  } catch (error) {
    console.error('❌ Redis cache service test failed:', error);
    process.exit(1);
  } finally {
    await redis.quit();
    console.log('🔌 Redis connection closed');
  }
}

// Run the test
testRedisSimple().catch(console.error);
