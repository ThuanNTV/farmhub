import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { ReturnOrdersController } from 'src/modules/return-orders/controller/return-orders.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ReturnOrdersService } from 'src/modules/return-orders/service/return-orders.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ReturnOrdersController],
  providers: [ReturnOrdersService],
  exports: [ReturnOrdersService],
})
export class ReturnOrdersModule {}
