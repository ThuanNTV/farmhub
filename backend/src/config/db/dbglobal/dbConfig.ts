// src/config/global-db.config.ts (Ví dụ)
import { DataSourceOptions } from 'typeorm'; // <-- Import DataSourceOptions từ 'typeorm'
import { config } from 'dotenv';
import { join } from 'path';
import { Store } from 'src/entities/global/store.entity';
import { User } from 'src/entities/global/user.entity';

config();

export const dbConfig: DataSourceOptions = {
  // <-- Khai báo rõ ràng kiểu là DataSourceOptions
  type: 'postgres', // Đảm bảo type là 'postgres'
  url: process.env.GLOBAL_DATABASE_URL,

  synchronize: process.env.NODE_ENV === 'development' ? true : false, // Chỉ dùng trong môi trường development
  logging:
    process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],

  entities: [Store, User],
  migrations: [join(__dirname, '..', 'global', 'migrations', '*{.ts,.js}')],
  migrationsRun: false,

  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,

  extra: {
    max: parseInt(process.env.GLOBAL_DB_POOL_MAX ?? '10'),
    min: parseInt(process.env.GLOBAL_DB_POOL_MIN ?? '1'),
    connectionTimeoutMillis: parseInt(
      process.env.GLOBAL_DB_CONNECTION_TIMEOUT ?? '60000',
    ),
    idleTimeoutMillis: parseInt(process.env.GLOBAL_DB_IDLE_TIMEOUT ?? '30000'),
  },
  // Nếu bạn không dùng cache hoặc redis ở đây, hãy bỏ thuộc tính `cache` đi.
  // Nếu dùng, hãy đảm bảo cấu hình cache đúng với TypeORM DataSourceOptions
  // cache: process.env.REDIS_URL ? { type: 'redis', options: { /* ... */ } } : false,
};
