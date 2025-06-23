import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ProductsController } from 'src/controller/products.controller';
import { ProductsService } from 'src/service/products.service';

@Module({
  imports: [TenantModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
