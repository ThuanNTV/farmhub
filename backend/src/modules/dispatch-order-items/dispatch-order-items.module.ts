import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { DispatchOrderItemsController } from 'src/modules/dispatch-order-items/controller/dispatch-order-items.controller';
import { DispatchOrderItemsService } from 'src/modules/dispatch-order-items/service/dispatch-order-items.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [DispatchOrderItemsController],
  providers: [DispatchOrderItemsService, TenantDataSourceService],
  exports: [DispatchOrderItemsService],
})
export class DispatchOrderItemsModule {}
