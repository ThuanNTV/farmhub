import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { DispatchOrdersController } from 'src/modules/dispatch-orders/controller/dispatch-orders.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { DispatchOrdersService } from 'src/modules/dispatch-orders/service/dispatch-orders.service';

@Module({
  imports: [SecurityModule, AuditLogsModule, TenantModule, AuditLogAsyncModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [DispatchOrdersController],
  providers: [DispatchOrdersService],
  exports: [DispatchOrdersService],
})
export class DispatchOrdersModule {}
