import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { TenantModule } from 'src/config/tenant.module';

@Module({
  imports: [TenantModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
