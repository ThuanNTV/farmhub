import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from 'src/common/interceptors/all-exceptions.filter';
import { Server } from 'http';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
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

  // Listen
  const port = Number(process.env.PORT) || 3000;
  const environment = process.env.NODE_ENV ?? 'production';
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? ['*'];
  const host =
    address == null
      ? 'localhost'
      : typeof address === 'string'
        ? address
        : address.address;

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`🌍 Môi trường: ${environment}`);

  if (environment === 'development') {
    logger.log('🛠️ Development mode - Tất cả tính năng debug đã được bật');
    logger.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
  } else {
    logger.log('🔐 Production mode - Bảo mật cao đã được kích hoạt');
  }
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Error during application bootstrap', error);
  process.exit(1);
});
// TODO: refactor output message
