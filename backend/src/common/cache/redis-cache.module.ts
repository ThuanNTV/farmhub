import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('REDIS_TTL', 600), // default 10 minutes
        max: configService.get('REDIS_MAX_ITEMS', 1000),
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        // Additional options for Redis Cloud
        connectTimeout: 10000,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
        // SSL/TLS for Redis Cloud (if needed)
        // tls: {
        //   rejectUnauthorized: false
        // }
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [CacheModule, RedisCacheService],
})
export class RedisCacheModule {}
