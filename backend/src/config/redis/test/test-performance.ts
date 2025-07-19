#!/usr/bin/env ts-node

/**
 * Performance Test Script for FarmHub
 * Tests database queries, caching, and partition performance
 */

import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { performance } from 'perf_hooks';
import { AppModule } from 'src/app.module';
import { RedisCacheService } from 'src/common/cache/redis-cache.service';

interface PerformanceResult {
  operation: string;
  duration: number;
  cacheHit?: boolean;
  rowsAffected?: number;
}

class PerformanceTester {
  private results: PerformanceResult[] = [];
  private cacheService!: RedisCacheService;
  private dataSource!: DataSource;

  constructor() {}

  async initialize() {
    console.log('🚀 Initializing Performance Tester...');

    const app = await NestFactory.createApplicationContext(AppModule);
    this.cacheService = app.get(RedisCacheService);
    this.dataSource = app.get(DataSource);

    console.log('✅ Performance Tester initialized');
  }

  private async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.results.push({ operation, duration });
    console.log(`⏱️  ${operation}: ${duration.toFixed(2)}ms`);

    return result;
  }

  async testDatabaseQueries() {
    console.log('\n📊 Testing Database Queries...');

    // Test 1: Simple query without cache
    await this.measureOperation('Query products without cache', async () => {
      const result = await this.dataSource.query(
        'SELECT * FROM product WHERE is_active = true LIMIT 100',
      );
      return result.length;
    });

    // Test 2: Query with complex join
    await this.measureOperation('Query orders with joins', async () => {
      const result = await this.dataSource.query(`
        SELECT o.order_id, o.order_code, c.name as customer_name, 
               COUNT(oi.order_item_id) as item_count
        FROM "order" o
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN order_item oi ON o.order_id = oi.order_id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY o.order_id, o.order_code, c.name
        ORDER BY o.created_at DESC
        LIMIT 50
      `);
      return result.length;
    });

    // Test 3: Aggregation query
    await this.measureOperation('Aggregation query', async () => {
      const result = await this.dataSource.query(`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          status,
          COUNT(*) as count,
          SUM(total_amount) as total
        FROM "order"
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', created_at), status
        ORDER BY date DESC, status
      `);
      return result.length;
    });

    // Test 4: Full-text search
    await this.measureOperation('Full-text search', async () => {
      const result = await this.dataSource.query(`
        SELECT product_id, name, description
        FROM product
        WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', 'apple')
        AND is_active = true
        LIMIT 20
      `);
      return result.length;
    });
  }

  async testCaching() {
    console.log('\n🚀 Testing Caching Performance...');

    const testData = {
      id: 'test-product-123',
      name: 'Test Product',
      price: 99.99,
      stock: 100,
    };

    // Test 1: Set cache
    await this.measureOperation('Set cache', async () => {
      await this.cacheService.set('test:product:123', testData);
    });

    // Test 2: Get cache (should be fast)
    await this.measureOperation('Get cache (hit)', async () => {
      const result = await this.cacheService.get('test:product:123');
      return result ? 'hit' : 'miss';
    });

    // Test 3: Get non-existent cache (miss)
    await this.measureOperation('Get cache (miss)', async () => {
      const result = await this.cacheService.get('test:product:999');
      return result ? 'hit' : 'miss';
    });

    // Test 4: Cache with function
    await this.measureOperation('Cache with function', async () => {
      const result = await this.cacheService.withCache(
        'test:expensive:operation',
        async () => {
          // Simulate expensive operation
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { data: 'expensive result', timestamp: Date.now() };
        },
        { ttl: 60 },
      );
      return result;
    });

    // Test 5: Cache invalidation
    await this.measureOperation('Cache invalidation', async () => {
      await this.cacheService.set('test:pattern:1', 'data1');
      await this.cacheService.set('test:pattern:2', 'data2');
      await this.cacheService.set('test:other:3', 'data3');

      await this.cacheService.invalidatePattern('test:pattern:*');

      const remaining1 = await this.cacheService.get('test:pattern:1');
      const remaining2 = await this.cacheService.get('test:other:3');

      return { pattern1: remaining1, other: remaining2 };
    });
  }

  async testPartitionQueries() {
    console.log('\n🧱 Testing Partition Performance...');

    // Test 1: Query current month partition
    await this.measureOperation('Query current month partition', async () => {
      const result = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM audit_log
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `);
      return result[0]?.count || 0;
    });

    // Test 2: Query specific partition
    await this.measureOperation('Query specific partition', async () => {
      const result = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM audit_log_2024_07
        WHERE created_at >= '2024-07-01'
        AND created_at < '2024-08-01'
      `);
      return result[0]?.count || 0;
    });

    // Test 3: Cross-partition query
    await this.measureOperation('Cross-partition query', async () => {
      const result = await this.dataSource.query(`
        SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
        FROM audit_log
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
      `);
      return result.length;
    });
  }

  async testConcurrentOperations() {
    console.log('\n⚡ Testing Concurrent Operations...');

    const concurrentCount = 10;
    const promises: Promise<any>[] = [];

    // Test concurrent cache operations
    for (let i = 0; i < concurrentCount; i++) {
      promises.push(
        this.measureOperation(`Concurrent cache get ${i}`, async () => {
          return await this.cacheService.get(`test:concurrent:${i}`);
        }),
      );
    }

    await Promise.all(promises);

    // Test concurrent database queries
    const dbPromises: Promise<any>[] = [];
    for (let i = 0; i < concurrentCount; i++) {
      dbPromises.push(
        this.measureOperation(`Concurrent DB query ${i}`, async () => {
          const result = await this.dataSource.query(
            'SELECT COUNT(*) as count FROM product WHERE is_active = true',
          );
          return result[0]?.count || 0;
        }),
      );
    }

    await Promise.all(dbPromises);
  }

  async testCacheStatistics() {
    console.log('\n📈 Cache Statistics...');

    try {
      const stats = await this.cacheService.getStats();
      if (stats?.stats) {
        console.log('Redis Statistics:');
        console.log(`- Connected Clients: ${stats.stats.connected_clients}`);
        console.log(`- Used Memory: ${stats.stats.used_memory}`);
        console.log(`- Keyspace Hits: ${stats.stats.keyspace_hits}`);
        console.log(`- Keyspace Misses: ${stats.stats.keyspace_misses}`);

        const hitRate =
          stats.stats.keyspace_hits /
          (stats.stats.keyspace_hits + stats.stats.keyspace_misses);
        console.log(`- Hit Rate: ${(hitRate * 100).toFixed(2)}%`);
      }
    } catch (error) {
      console.log(
        '❌ Could not get cache statistics:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  generateReport() {
    console.log('\n📋 Performance Test Report');
    console.log('='.repeat(50));

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / this.results.length;

    console.log(`Total Operations: ${this.results.length}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);

    console.log('\nTop 5 Slowest Operations:');
    this.results
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.operation}: ${result.duration.toFixed(2)}ms`,
        );
      });

    console.log('\nPerformance Categories:');
    const fast = this.results.filter((r) => r.duration < 10).length;
    const medium = this.results.filter(
      (r) => r.duration >= 10 && r.duration < 100,
    ).length;
    const slow = this.results.filter((r) => r.duration >= 100).length;

    console.log(`- Fast (< 10ms): ${fast} operations`);
    console.log(`- Medium (10-100ms): ${medium} operations`);
    console.log(`- Slow (> 100ms): ${slow} operations`);
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');

    // Clear test cache keys
    await this.cacheService.invalidatePattern('test:*');

    console.log('✅ Cleanup completed');
  }
}

async function main() {
  const tester = new PerformanceTester();

  try {
    await tester.initialize();

    await tester.testDatabaseQueries();
    await tester.testCaching();
    await tester.testPartitionQueries();
    await tester.testConcurrentOperations();
    await tester.testCacheStatistics();

    tester.generateReport();
    await tester.cleanup();
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
