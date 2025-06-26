// src/config/tenant-db.config.ts
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { Product } from 'src/entities/tenant/product.entity';
import { Category } from 'src/entities/tenant/category.entity';
import { Customer } from 'src/entities/tenant/customer.entity';
import { Order } from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';

// Export mảng entities riêng
export const tenantEntities = [Product, Category, Customer, Order, OrderItem];

export function getTenantDbConfig(schemaName: string): DataSourceOptions {
  return {
    type: 'postgres',
    host:
      process.env.TENANT_DB_HOST ?? process.env.GLOBAL_DB_HOST ?? 'localhost',
    port: parseInt(
      process.env.TENANT_DB_PORT ?? process.env.GLOBAL_DB_PORT ?? '5432',
    ),
    username: process.env.TENANT_DB_USER,
    password: process.env.TENANT_DB_PASSWORD,
    database: process.env.TENANT_DB_NAME?.trim() ?? 'farmhub_db', // 👉 cố định DB
    schema: schemaName, // 👉 mỗi tenant là 1 schema trong cùng database

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
      max: parseInt(process.env.TENANT_DB_POOL_MAX ?? '5'),
      min: parseInt(process.env.TENANT_DB_POOL_MIN ?? '0'),
      connectionTimeoutMillis: parseInt(
        process.env.TENANT_DB_CONNECTION_TIMEOUT ?? '60000',
      ),
      idleTimeoutMillis: parseInt(
        process.env.TENANT_DB_IDLE_TIMEOUT ?? '30000',
      ),
    },
  };
}
