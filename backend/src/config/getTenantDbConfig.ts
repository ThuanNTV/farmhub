// src/config/tenant-db.config.ts (Ví dụ)
import { DataSourceOptions } from 'typeorm'; // <-- Import DataSourceOptions từ 'typeorm'
import { config } from 'dotenv';
import { join } from 'path';
import { Product } from 'src/entities/tenant/product.entity';
// Import tất cả các entities của Tenant DB

// ... (các import entities khác)

// Export mảng entities riêng
export const tenantEntities = [Product];

export function getTenantDbConfig(dbName: string): DataSourceOptions {
  // <-- Khai báo rõ ràng kiểu là DataSourceOptions
  return {
    type: 'postgres', // Đảm bảo type là 'postgres'
    host:
      process.env.TENANT_DB_HOST ||
      process.env.GLOBAL_DB_HOST ||
      'tenant-db.neon.tech',
    port: parseInt(
      process.env.TENANT_DB_PORT || process.env.GLOBAL_DB_PORT || '5432',
    ),
    username: process.env.TENANT_DB_USER,
    password: process.env.TENANT_DB_PASSWORD,
    database: dbName,

    synchronize: true,
    logging: false,

    entities: tenantEntities,
    migrations: [join(__dirname, '..', 'tenant', 'migrations', '*{.ts,.js}')],
    migrationsRun: false,

    ssl:
      process.env.TENANT_DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,

    extra: {
      max: parseInt(process.env.TENANT_DB_POOL_MAX || '5'),
      min: parseInt(process.env.TENANT_DB_POOL_MIN || '0'),
      connectionTimeoutMillis: parseInt(
        process.env.TENANT_DB_CONNECTION_TIMEOUT || '60000',
      ),
      idleTimeoutMillis: parseInt(
        process.env.TENANT_DB_IDLE_TIMEOUT || '30000',
      ),
    },
    // Nếu không dùng cache ở đây, hãy bỏ thuộc tính `cache` đi.
  };
}
