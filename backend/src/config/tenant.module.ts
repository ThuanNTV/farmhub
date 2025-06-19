// src/tenant/tenant.module.ts
import { Module } from '@nestjs/common';
import { TenantDataSourceService } from './tenant-datasource.service';
import { GlobalDatabaseModule } from './global-database.module';

@Module({
  imports: [GlobalDatabaseModule],
  providers: [TenantDataSourceService],
  exports: [TenantDataSourceService],
})
export class TenantModule {}
