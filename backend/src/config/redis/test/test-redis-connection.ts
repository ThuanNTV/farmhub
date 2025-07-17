#!/usr/bin/env ts-node

/**
 * Test Redis Connection Script
 * Tests connection to Redis Cloud
 */

import Redis from 'ioredis';

async function testRedisConnection() {
  console.log('🔍 Testing Redis Cloud Connection...');

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

  try {
    // Test basic connection
    console.log('📡 Connecting to Redis...');
    await redis.ping();
    console.log('✅ Redis connection successful!');

    // Test basic operations
    console.log('🧪 Testing basic operations...');

    // Set a test key
    await redis.set('test:connection', 'Hello Redis Cloud!', 'EX', 60);
    console.log('✅ Set operation successful');

    // Get the test key
    const value = await redis.get('test:connection');
    console.log(`✅ Get operation successful: ${value}`);

    // Test cache operations
    console.log('🚀 Testing cache operations...');

    // Set with TTL
    await redis.setex('test:ttl', 30, 'This will expire in 30 seconds');
    console.log('✅ Set with TTL successful');

    // Check TTL
    const ttl = await redis.ttl('test:ttl');
    console.log(`✅ TTL check successful: ${ttl} seconds remaining`);

    // Test pattern operations
    await redis.set('test:pattern:1', 'value1');
    await redis.set('test:pattern:2', 'value2');
    await redis.set('test:other:3', 'value3');

    const keys = await redis.keys('test:pattern:*');
    console.log(`✅ Pattern matching successful: Found ${keys.length} keys`);

    // Test Redis info
    console.log('📊 Getting Redis info...');
    const info = await redis.info();
    const lines = info.split('\r\n');
    const stats: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }

    console.log('📈 Redis Statistics:');
    console.log(`- Redis Version: ${stats.redis_version}`);
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

    // Cleanup test keys
    console.log('🧹 Cleaning up test keys...');
    await redis.del(
      'test:connection',
      'test:ttl',
      'test:pattern:1',
      'test:pattern:2',
      'test:other:3',
    );
    console.log('✅ Cleanup completed');

    console.log('🎉 All Redis tests passed!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  } finally {
    await redis.quit();
    console.log('🔌 Redis connection closed');
  }
}

// Run the test
testRedisConnection().catch(console.error);
