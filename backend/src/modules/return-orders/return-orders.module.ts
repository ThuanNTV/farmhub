import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ReturnOrdersController } from './controller/return-orders.controller';
import { ReturnOrdersService } from 'src/modules/return-orders/service/return-orders.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ReturnOrdersController],
  providers: [ReturnOrdersService],
  exports: [ReturnOrdersService],
})
export class ReturnOrdersModule {}
