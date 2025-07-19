// src/config/tenant-db.config.ts
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';

import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { Category } from 'src/entities/tenant/category.entity';
import { Customer } from 'src/entities/tenant/customer.entity';
import { DebtTransaction } from 'src/entities/tenant/debt_transaction.entity';
import { DispatchOrder } from 'src/entities/tenant/dispatch_order.entity';
import { DispatchOrderItem } from 'src/entities/tenant/dispatch_order_item.entity';
import { ExternalSystemLog } from 'src/entities/tenant/external_system_log.entity';
import { FileAttachment } from 'src/entities/tenant/file_attachment.entity';
import { Installment } from 'src/entities/tenant/installment.entity';
import { InventoryTransfer } from 'src/entities/tenant/inventory_transfer.entity';
import { InventoryTransferItem } from 'src/entities/tenant/inventory_transfer_item.entity';
import { JobSchedule } from 'src/entities/tenant/job_schedule.entity';
import { LoyaltyPointLog } from 'src/entities/tenant/loyalty_point_log.entity';
import { Notification } from 'src/entities/tenant/notification.entity';
import { Order } from 'src/entities/tenant/order.entity';
import { Payment } from 'src/entities/tenant/payment.entity';
import { PriceHistory } from 'src/entities/tenant/price_history.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { Promotion } from 'src/entities/tenant/promotion.entity';
import { ReturnOrder } from 'src/entities/tenant/return_order.entity';
import { ReturnOrderItem } from 'src/entities/tenant/return_order_item.entity';
import { ScheduledTask } from 'src/entities/tenant/scheduled_task.entity';
import { StockAdjustment } from 'src/entities/tenant/stock_adjustment.entity';
import { StoreSetting } from 'src/entities/tenant/store_setting.entity';
import { Supplier } from 'src/entities/tenant/supplier.entity';
import { UserActivityLog } from 'src/entities/tenant/user_activity_log.entity';
import { Voucher } from 'src/entities/tenant/voucher.entity';
import { WebhookLog } from 'src/entities/tenant/webhook_log.entity';
import { Tag } from 'src/entities/tenant/tag.entity';
import { VoucherUsageLog } from 'src/entities/tenant/voucher_usage_log.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';

export const tenantEntities = [
  AuditLog,
  Category,
  Customer,
  DebtTransaction,
  DispatchOrder,
  DispatchOrderItem,
  ExternalSystemLog,
  FileAttachment,
  Installment,
  InventoryTransfer,
  InventoryTransferItem,
  JobSchedule,
  LoyaltyPointLog,
  Notification,
  Order,
  OrderItem,
  Payment,
  PriceHistory,
  Product,
  Promotion,
  ReturnOrder,
  ReturnOrderItem,
  ScheduledTask,
  StockAdjustment,
  StoreSetting,
  Supplier,
  UserActivityLog,
  Voucher,
  WebhookLog,
  Tag,
  VoucherUsageLog,
];

export function getTenantDbConfig(schemaName: string): DataSourceOptions {
  // 👇 Xử lý SSL an toàn cho môi trường production
  const sslConfig =
    process.env.TENANT_DB_SSL === 'true'
      ? {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
          ...(process.env.DB_CA_PATH && {
            ca: fs.readFileSync(process.env.DB_CA_PATH).toString(),
          }),
        }
      : false;

  return {
    type: 'postgres',
    host:
      process.env.TENANT_DB_HOST ?? process.env.GLOBAL_DB_HOST ?? 'localhost',
    port: parseInt(
      process.env.TENANT_DB_PORT ?? process.env.GLOBAL_DB_PORT ?? '5432',
      10,
    ),
    username: process.env.TENANT_DB_USER,
    password: process.env.TENANT_DB_PASSWORD,
    database: process.env.TENANT_DB_NAME?.trim() ?? 'farmhub_db',
    schema: schemaName,

    // 👇 Tối ưu hóa hiệu năng và ổn định
    synchronize: process.env.NODE_ENV !== 'production',
    logging:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error', 'schema'],
    entities: tenantEntities,
    migrations: [join(__dirname, '..', 'tenant', 'migrations', '*{.ts,.js}')],
    migrationsRun: process.env.NODE_ENV === 'production',
    migrationsTransactionMode: 'each', // 👈 Quan trọng cho multi-tenant
    ssl: sslConfig,

    // 👇 Tối ưu connection pooling
    extra: {
      max: parseInt(process.env.TENANT_DB_POOL_MAX ?? '20', 10),
      min: parseInt(process.env.TENANT_DB_POOL_MIN ?? '5', 10),
      acquireTimeoutMillis: parseInt(
        process.env.TENANT_DB_CONNECTION_TIMEOUT ?? '2000',
        10,
      ),
      idleTimeoutMillis: parseInt(
        process.env.TENANT_DB_IDLE_TIMEOUT ?? '10000',
        10,
      ),
      reapIntervalMillis: parseInt(
        process.env.TENANT_DB_REAP_INTERVAL ?? '3000',
        10,
      ),
    },

    // 👇 Ngăn chặn query slow trong production
    maxQueryExecutionTime:
      process.env.NODE_ENV === 'production' ? 1000 : undefined,

    // 👇 Giám sát hiệu năng
    cache: {
      duration: 30000, // 30s cache cho query
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    },
  } as DataSourceOptions;
}
