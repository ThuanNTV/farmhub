import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ReturnOrderItemsService } from './service/return-order-items.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ReturnOrderItemsController } from './controller/return-order-items.controller';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  providers: [ReturnOrderItemsService, TenantDataSourceService],
  controllers: [ReturnOrderItemsController],
  exports: [ReturnOrderItemsService],
})
export class ReturnOrderItemsModule {}
