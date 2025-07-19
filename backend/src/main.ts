import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Server } from 'http';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { RedisCacheService } from './common/cache/redis-cache.service';
import { INestApplication } from '@nestjs/common';
import { createWinstonLogger } from './utils/logger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/interceptors/all-exceptions.filter';
import { HealthCheckResult } from './common/types/common.types';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Tạo NestJS app với Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(),
  });

  const server = app.getHttpServer() as Server;
  const address = server.address();

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptor & Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // --- Swagger setup ---
  const environment = process.env.NODE_ENV ?? 'production';
  if (environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle('FarmHub API')
      .setDescription('FarmHub Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const { execSync } = await import('child_process');
    // Export OpenAPI JSON file
    writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

    // Convert json to Yaml
    try {
      execSync('npm run openapi:yaml', { stdio: 'inherit' });
      logger.log('✅ Đã chuyển đổi openapi.json sang YAML!');
    } catch (err) {
      if (err instanceof Error) {
        logger.error('❌ Lỗi chuyển đổi openapi.json:', err.message);
      } else {
        logger.error('❌ Lỗi chuyển đổi openapi.json:', err);
      }
    }
  }

  // Listen
  const port = Number(process.env.PORT) || 3000;
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? ['*'];
  const host =
    address == null
      ? 'localhost'
      : typeof address === 'string'
        ? address
        : address.address;

  await app.listen(port);

  // Check Redis connection
  const redisStatus = await checkRedisConnection(app, logger);

  // Display startup information
  displayStartupInfo(
    logger,
    environment,
    host,
    port,
    allowedOrigins,
    redisStatus,
  );
}

async function checkRedisConnection(
  app: any,
  logger: Logger,
): Promise<HealthCheckResult> {
  try {
    // Ép kiểu app về INestApplication để tránh warning
    const redisService = (app as INestApplication).get(RedisCacheService);

    // Test Redis connection by setting a test key (không truyền TTL)
    await redisService.set('startup:test', 'Redis connection test');
    const testValue = await redisService.get('startup:test');

    if (testValue === 'Redis connection test') {
      // Get Redis statistics
      const redisStats = await redisService.getStats();
      logger.log('✅ Redis connection successful');
      return { connected: true, stats: redisStats?.stats };
    } else {
      logger.warn(
        '⚠️ Redis connection test failed - unexpected value returned',
      );
      return { connected: false, error: 'Unexpected test value returned' };
    }
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

function displayStartupInfo(
  logger: Logger,
  environment: string,
  host: string,
  port: number,
  allowedOrigins: string[],
  redisStatus: HealthCheckResult,
) {
  const baseUrl = `http://${host}:${port}`;

  // Header
  logger.log('='.repeat(60));
  logger.log('🌾 FarmHub API Server Started Successfully');
  logger.log('='.repeat(60));

  // Basic Info
  logger.log(`🚀 Server URL: ${baseUrl}`);
  logger.log(`🌍 Environment: ${environment.toUpperCase()}`);
  logger.log(`📡 Port: ${port}`);

  // Redis Status
  logger.log('');
  logger.log('🗄️  Cache & Storage:');
  if (redisStatus.connected) {
    logger.log(`   🔴 Redis: Connected`);
    if (redisStatus.stats) {
      logger.log(`   📊 Redis Stats:`);
      // Đảm bảo các trường là string/number khi log
      const stats = redisStatus.stats as {
        connected_clients?: number;
        used_memory?: string;
        redis_version?: string;
      };
      logger.log(
        `      - Connected Clients: ${typeof stats.connected_clients === 'number' ? stats.connected_clients : 'N/A'}`,
      );
      logger.log(
        `      - Used Memory: ${typeof stats.used_memory === 'string' ? stats.used_memory : 'N/A'}`,
      );
      logger.log(
        `      - Redis Version: ${typeof stats.redis_version === 'string' ? stats.redis_version : 'N/A'}`,
      );
    }
  } else {
    logger.log(
      `   ❌ Redis: Disconnected - ${redisStatus.error ?? 'Unknown error'}`,
    );
  }

  // Development-specific info
  if (environment === 'development') {
    logger.log('');
    logger.log('📋 Development Features:');
    logger.log(`   📚 Swagger UI: ${baseUrl}/api`);
    logger.log(`   📄 OpenAPI JSON: ./openapi.json`);
    logger.log(`   🔧 Debug Mode: Enabled`);
    logger.log(`   🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
  } else {
    logger.log('');
    logger.log('🔐 Production Features:');
    logger.log(`   🛡️  Security: Enhanced`);
    logger.log(`   🔒 CORS: Configured`);
  }

  logger.log('');
  logger.log('✅ All systems ready - Happy coding!');
  logger.log('='.repeat(60));
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('='.repeat(60));
  logger.error('❌ FarmHub API Failed to Start');
  logger.error('='.repeat(60));
  logger.error('Error details:', error);
  logger.error('='.repeat(60));
  process.exit(1);
});
