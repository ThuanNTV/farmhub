// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// // import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// // import helmet from 'helmet';
// // import * as compression from 'compression';
// // import rateLimit from 'express-rate-limit';
// import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
// import { AllExceptionsFilter } from 'src/common/interceptors/all-exceptions.filter';

// async function bootstrap() {
//   const logger = new Logger('Bootstrap');

//   try {
//     logger.log('🔧 Đang khởi tạo ứng dụng...');

//     const app = await NestFactory.create(AppModule, {
//       logger: ['error', 'warn', 'log', 'debug', 'verbose'],
//     });

//     // Lấy ConfigService để đọc cấu hình
//     const configService = app.get(ConfigService);

//     // Cấu hình Security Headers
//     app.use(
//       helmet({
//         contentSecurityPolicy: {
//           directives: {
//             defaultSrc: ["'self'"],
//             styleSrc: ["'self'", "'unsafe-inline'"],
//             scriptSrc: ["'self'"],
//             imgSrc: ["'self'", 'data:', 'https:'],
//           },
//         },
//         crossOriginEmbedderPolicy: false,
//       }),
//     );

//     // Cấu hình nén response
//     app.use(compression());

//     // Rate limiting - Giới hạn số request
//     const rateLimitWindowMs = configService.get<number>(
//       'RATE_LIMIT_WINDOW_MS',
//       15 * 60 * 1000,
//     ); // 15 phút
//     const rateLimitMax = configService.get<number>('RATE_LIMIT_MAX', 100); // 100 requests per window

//     app.use(
//       rateLimit({
//         windowMs: rateLimitWindowMs,
//         max: rateLimitMax,
//         message: {
//           statusCode: 429,
//           message: 'Quá nhiều request từ IP này, vui lòng thử lại sau',
//           error: 'Too Many Requests',
//         },
//         standardHeaders: true,
//         legacyHeaders: false,
//       }),
//     );

//     // Global Validation Pipe với cấu hình chi tiết
//     app.useGlobalPipes(
//       new ValidationPipe({
//         whitelist: true, // Chỉ cho phép các property được định nghĩa trong DTO
//         forbidNonWhitelisted: true, // Từ chối request có property không được phép
//         transform: true, // Tự động chuyển đổi kiểu dữ liệu
//         transformOptions: {
//           enableImplicitConversion: true, // Tự động chuyển đổi kiểu ngầm định
//         },
//         disableErrorMessages:
//           configService.get<string>('NODE_ENV') === 'production', // Ẩn chi tiết lỗi ở production
//         exceptionFactory: (errors) => {
//           logger.warn('🔍 Validation errors:', errors);
//           return errors;
//         },
//       }),
//     );

//     // Global Interceptor & Filter
//     app.useGlobalInterceptors(new TransformInterceptor());
//     app.useGlobalFilters(new AllExceptionsFilter());

//     // CORS Configuration
//     const corsOrigins = configService.get<string>('CORS_ORIGIN');
//     const allowedOrigins = corsOrigins
//       ? corsOrigins.split(',')
//       : ['http://localhost:3000'];

//     app.enableCors({
//       origin: (
//         origin: string | undefined,
//         callback: (err: Error | null, allow?: boolean) => void,
//       ) => {
//         // Cho phép requests không có origin (mobile apps, Postman, etc.)
//         if (!origin) return callback(null, true);

//         if (
//           allowedOrigins.includes(origin) ||
//           configService.get<string>('NODE_ENV') === 'development'
//         ) {
//           callback(null, true);
//         } else {
//           callback(new Error('Not allowed by CORS policy'));
//         }
//       },
//       methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//       allowedHeaders: [
//         'Content-Type',
//         'Authorization',
//         'X-Requested-With',
//         'Accept',
//       ],
//       credentials: true,
//       maxAge: 86400, // 24 hours
//     });

//     // Cấu hình Swagger Documentation (chỉ cho development)
//     if (configService.get<string>('NODE_ENV') !== 'production') {
//       const swaggerConfig = new DocumentBuilder()
//         .setTitle('API Documentation')
//         .setDescription('API documentation cho ứng dụng')
//         .setVersion('1.0')
//         .addBearerAuth(
//           {
//             type: 'http',
//             scheme: 'bearer',
//             bearerFormat: 'JWT',
//             name: 'JWT',
//             description: 'Enter JWT token',
//             in: 'header',
//           },
//           'JWT-auth',
//         )
//         .build();

//       const document: object = SwaggerModule.createDocument(app, swaggerConfig);
//       SwaggerModule.setup('api-docs', app, document, {
//         swaggerOptions: {
//           persistAuthorization: true,
//         },
//       });

//       logger.log('📚 Swagger documentation: http://localhost:3000/api-docs');
//     }

//     // Graceful shutdown
//     app.enableShutdownHooks();

//     // Lắng nghe cổng
//     const port = configService.get<number>('PORT', 3000);
//     const host = configService.get<string>('HOST', '0.0.0.0');

//     await app.listen(port, host);

//     // Thông báo khởi động thành công
//     const environment = configService.get<string>('NODE_ENV', 'development');
//     logger.log(`🚀 Ứng dụng đang chạy trên: http://localhost:${port}`);
//     logger.log(`🌍 Môi trường: ${environment.toUpperCase()}`);
//     logger.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
//     logger.log(
//       `⚡ Rate limit: ${rateLimitMax} requests/${rateLimitWindowMs / 1000 / 60} phút`,
//     );

//     if (environment === 'development') {
//       logger.log('🛠️  Development mode - Tất cả tính năng debug đã được bật');
//     } else {
//       logger.log('🔐 Production mode - Bảo mật cao đã được kích hoạt');
//     }
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       logger.error(
//         '❌ Lỗi trong quá trình khởi tạo ứng dụng:',
//         error.message,
//         error.stack,
//       );
//     } else {
//       logger.error('❌ Lỗi trong quá trình khởi tạo ứng dụng:', String(error));
//     }
//     process.exit(1);
//   }
// }

// // Xử lý tín hiệu tắt ứng dụng
// process.on('SIGTERM', () => {
//   const logger = new Logger('Bootstrap');
//   logger.log('🛑 Đã nhận tín hiệu SIGTERM, đang tắt ứng dụng...');
// });

// process.on('SIGINT', () => {
//   const logger = new Logger('Bootstrap');
//   logger.log('🛑 Đã nhận tín hiệu SIGINT, đang tắt ứng dụng...');
//   process.exit(0);
// });

// // Xử lý lỗi không được bắt
// process.on('unhandledRejection', (reason, promise) => {
//   const logger = new Logger('Bootstrap');
//   logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// process.on('uncaughtException', (error: unknown) => {
//   const logger = new Logger('Bootstrap');
//   if (error instanceof Error) {
//     logger.error('❌ Uncaught Exception:', error.message, error.stack);
//   } else {
//     logger.error('❌ Uncaught Exception:', String(error));
//   }
//   process.exit(1);
// });

// bootstrap().catch((error) => {
//   const logger = new Logger('Bootstrap');
//   logger.error('❌ Lỗi trong quá trình bootstrap ứng dụng:', error);
//   process.exit(1);
// });
