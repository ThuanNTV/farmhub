import { Module } from '@nestjs/common';

import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { TenantModule } from 'src/config/tenant.module';
import { ProductsController } from 'src/controller/products.controller';
import { ProductsService } from 'src/service/products.service';

@Module({
  imports: [TenantModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
