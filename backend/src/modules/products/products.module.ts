import { Module } from '@nestjs/common';
import { ProductsController } from 'src/modules/products/controller/products.controller';
import { ProductsService } from 'src/modules/products/service/products.service';
import { InventoryTransactionService } from 'src/modules/products/service/inventory/inventory-transaction.service';
import { InventoryAnalyticsService } from 'src/modules/products/service/inventory-analytics.service';
import { SupplierIntegrationService } from 'src/modules/products/service/supplier-integration.service';
import { SupplierIntegrationExtendedService } from 'src/modules/products/service/supplier-integration-extended.service';
import { ProductRecommendationsService } from 'src/modules/products/service/product-recommendations.service';
import { AdvancedSearchService } from 'src/modules/products/service/advanced-search.service';
import { ProductVariantsService } from 'src/modules/products/service/product-variants.service';
import { ProductVariantsController } from 'src/modules/products/controller/product-variants.controller';
import { ProductSeoService } from 'src/modules/products/service/product-seo.service';
import { ProductSeoController } from 'src/modules/products/controller/product-seo.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PriceHistoriesModule } from 'src/modules/price-histories/price-histories.module';
import { ReportModule } from 'src/modules/report/report.module';
import { SuppliersModule } from 'src/modules/suppliers/suppliers.module';

@Module({
  imports: [
    SecurityModule,
    TenantModule,
    AuditLogsModule,
    AuditLogAsyncModule,
    PriceHistoriesModule,
    ReportModule,
    SuppliersModule,
  ],
  controllers: [
    ProductsController,
    ProductVariantsController,
    ProductSeoController,
  ],
  providers: [
    ProductsService,
    InventoryTransactionService,
    InventoryAnalyticsService,
    SupplierIntegrationService,
    SupplierIntegrationExtendedService,
    ProductRecommendationsService,
    AdvancedSearchService,
    ProductVariantsService,
    ProductSeoService,
  ],
  exports: [
    ProductsService,
    InventoryTransactionService,
    InventoryAnalyticsService,
    SupplierIntegrationService,
    SupplierIntegrationExtendedService,
    ProductRecommendationsService,
    AdvancedSearchService,
    ProductVariantsService,
    ProductSeoService,
  ],
})
export class ProductsModule {}
