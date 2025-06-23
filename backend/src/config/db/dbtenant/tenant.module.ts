// src/tenant/tenant.module.ts
import { Module } from '@nestjs/common';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [GlobalDatabaseModule],
  providers: [TenantDataSourceService],
  exports: [TenantDataSourceService],
})
export class TenantModule {}
