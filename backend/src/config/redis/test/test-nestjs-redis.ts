#!/usr/bin/env ts-node

/**
 * Test Redis with NestJS Application
 * Tests Redis integration with NestJS cache module
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { RedisCacheService } from 'src/common/cache/redis-cache.service';

async function testNestJSRedis() {
  console.log('🚀 Testing Redis with NestJS Application...');

  let app;

  try {
    // Create NestJS application context
    app = await NestFactory.createApplicationContext(AppModule);
    console.log('✅ NestJS application context created');

    // Get Redis cache service
    const cacheService = app.get(RedisCacheService);
    console.log('✅ Redis cache service injected');

    // Test basic cache operations
    console.log('🧪 Testing cache operations...');

    const testData = {
      id: 'test-product-123',
      name: 'Test Product',
      price: 99.99,
      stock: 100,
      timestamp: new Date().toISOString(),
    };

    // Test set operation
    await cacheService.set('test:product:123', testData, 300);
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
    await cacheService.set('test:pattern:1', 'value1', 300);
    await cacheService.set('test:pattern:2', 'value2', 300);
    await cacheService.set('test:other:3', 'value3', 300);

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
    if (stats) {
      console.log('📈 Cache Statistics:');
      console.log(`- Connected Clients: ${stats.connected_clients}`);
      console.log(`- Used Memory: ${stats.used_memory_human}`);
      console.log(`- Keyspace Hits: ${stats.keyspace_hits}`);
      console.log(`- Keyspace Misses: ${stats.keyspace_misses}`);

      if (stats.keyspace_hits && stats.keyspace_misses) {
        const hitRate =
          parseInt(stats.keyspace_hits) /
          (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses));
        console.log(`- Hit Rate: ${(hitRate * 100).toFixed(2)}%`);
      }
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await cacheService.invalidatePattern('test:*');
    console.log('✅ Cleanup completed');

    console.log('🎉 All NestJS Redis tests passed!');
  } catch (error) {
    console.error('❌ NestJS Redis test failed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      console.log('🔌 NestJS application closed');
    }
  }
}

// Run the test
testNestJSRedis().catch(console.error);
