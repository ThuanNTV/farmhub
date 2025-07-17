import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { DispatchOrdersController } from './controller/dispatch-orders.controller';
import { DispatchOrdersService } from 'src/modules/dispatch-orders/service/dispatch-orders.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, AuditLogsModule, TenantModule, AuditLogAsyncModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [DispatchOrdersController],
  providers: [DispatchOrdersService],
  exports: [DispatchOrdersService],
})
export class DispatchOrdersModule {}
