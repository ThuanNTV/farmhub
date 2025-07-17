import { Module } from '@nestjs/common';
import { DispatchOrderItemsController } from './controller/dispatch-order-items.controller';
import { DispatchOrderItemsService } from './service/dispatch-order-items.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [DispatchOrderItemsController],
  providers: [DispatchOrderItemsService, TenantDataSourceService],
  exports: [DispatchOrderItemsService],
})
export class DispatchOrderItemsModule {}
