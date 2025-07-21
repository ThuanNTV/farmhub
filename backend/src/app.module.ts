import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { RedisCacheModule } from 'src/common/cache/redis-cache.module';
import { WinstonLoggerModule } from 'src/utils/logger';
import { GlobalEntityService } from 'src/service/global-entity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/core/auth/auth.module';
import { StoresModule } from 'src/modules/stores/stores.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { CustomersModule } from 'src/modules/customers/customers.module';
import { LogLevelControllerModule } from 'src/controllers/log-level.controller.module';
import { BullModule } from '@nestjs/bull';
import { GlobalDatabaseModule } from 'src/config/db/dbglobal/global-database.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { User } from 'src/entities/global/user.entity';
import { Bank } from 'src/entities/global/bank.entity';
import { Unit } from 'src/entities/global/unit.entity';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { Store } from 'src/entities/global/store.entity';
import { AuditLogQueueModule } from 'src/common/queue/audit-log-queue.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { VouchersModule } from 'src/modules/vouchers/vouchers.module';
import { SuppliersModule } from 'src/modules/suppliers/suppliers.module';
import { StoreSettingsModule } from 'src/modules/store-settings/store-settings.module';
import { DispatchOrdersModule } from 'src/modules/dispatch-orders/dispatch-orders.module';
import { ReturnOrdersModule } from 'src/modules/return-orders/return-orders.module';
import { StockAdjustmentsModule } from 'src/modules/stock-adjustments/stock-adjustments.module';
import { InventoryTransfersModule } from 'src/modules/inventory-transfers/inventory-transfers.module';
import { PriceHistoriesModule } from 'src/modules/price-histories/price-histories.module';
import { PromotionsModule } from 'src/modules/promotions/promotions.module';
import { InstallmentsModule } from 'src/modules/installments/installments.module';
import { DebtTransactionsModule } from 'src/modules/debt-transactions/debt-transactions.module';
import { LoyaltyPointLogsModule } from 'src/modules/loyalty-point-logs/loyalty-point-logs.module';
import { JobSchedulesModule } from 'src/modules/job-schedules/job-schedules.module';
import { WebhookLogsModule } from 'src/modules/webhook-logs/webhook-logs.module';
import { ExternalSystemLogsModule } from 'src/modules/external-system-logs/external-system-logs.module';
import { FileAttachmentsModule } from 'src/modules/file-attachments/file-attachments.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { ReportModule } from 'src/modules/report/report.module';
import { PrintingModule } from 'src/modules/printing/printing.module';
import { RecreateOrderModule } from 'src/modules/recreate-order/recreate-order.module';
import { StockTransferModule } from 'src/modules/stock-transfer/stock-transfer.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { DashboardAnalyticsModule } from 'src/modules/dashboard-analytics/dashboard-analytics.module';
import { TagModule } from 'src/modules/tag/tag.module';
import { BankModule } from 'src/modules/bank/bank.module';
import { VoucherUsageLogModule } from 'src/modules/voucher-usage-log/voucher-usage-log.module';
import { PaymentMethodsModule } from 'src/modules/payment-methods/payment-methods.module';
import { UserStoreMappingsModule } from 'src/modules/user-store-mappings/user-store-mappings.module';
import { ReturnOrderItemsModule } from 'src/modules/return-order-items/return-order-items.module';
import { UnitsModule } from 'src/modules/units/units.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB ?? '0', 10),
      },
    }),
    RedisCacheModule,
    GlobalDatabaseModule,
    WinstonLoggerModule,
    TypeOrmModule.forFeature(
      [User, Bank, Unit, PaymentMethod, Store],
      'globalConnection',
    ),
    AuthModule,
    StoresModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    VouchersModule,
    SuppliersModule,
    StoreSettingsModule,
    DispatchOrdersModule,
    ReturnOrdersModule,
    StockAdjustmentsModule,
    InventoryTransfersModule,
    PriceHistoriesModule,
    PromotionsModule,
    InstallmentsModule,
    DebtTransactionsModule,
    LoyaltyPointLogsModule,
    JobSchedulesModule,
    WebhookLogsModule,
    ExternalSystemLogsModule,
    FileAttachmentsModule,
    AuditLogsModule,
    DashboardModule,
    ReportModule,
    PrintingModule,
    RecreateOrderModule,
    StockTransferModule,
    NotificationModule,
    DashboardAnalyticsModule,
    TagModule,
    BankModule,
    VoucherUsageLogModule,
    PaymentMethodsModule,
    UnitsModule,
    UserStoreMappingsModule,
    ReturnOrderItemsModule,
    AuditLogQueueModule,
    LogLevelControllerModule,
  ],
  providers: [TenantDataSourceService, GlobalEntityService],
  controllers: [AppController],
})
export class AppModule {}
