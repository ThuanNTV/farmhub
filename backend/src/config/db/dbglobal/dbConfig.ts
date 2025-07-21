import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { Store } from 'src/entities/global/store.entity';
import { User } from 'src/entities/global/user.entity';

config();

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.GLOBAL_DATABASE_URL,

  synchronize: process.env.NODE_ENV === 'development' ? true : false,
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
    max: parseInt(process.env.GLOBAL_DB_POOL_MAX ?? '20'),
    min: parseInt(process.env.GLOBAL_DB_POOL_MIN ?? '5'),
    acquireTimeoutMillis: parseInt(
      process.env.GLOBAL_DB_CONNECTION_TIMEOUT ?? '2000',
    ),
    idleTimeoutMillis: parseInt(process.env.GLOBAL_DB_IDLE_TIMEOUT ?? '10000'),
    reapIntervalMillis: parseInt(process.env.GLOBAL_DB_REAP_INTERVAL ?? '3000'),
  },
  // Nếu bạn không dùng cache hoặc redis ở đây, hãy bỏ thuộc tính `cache` đi.
  // Nếu dùng, hãy đảm bảo cấu hình cache đúng với TypeORM DataSourceOptions
  // cache: process.env.REDIS_URL ? { type: 'redis', options: { /* ... */ } } : false,
};
