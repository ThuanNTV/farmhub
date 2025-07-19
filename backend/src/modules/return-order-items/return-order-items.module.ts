import { Module } from '@nestjs/common';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { ReturnOrderItemsController } from 'src/modules/return-order-items/controller/return-order-items.controller';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ReturnOrderItemsService } from 'src/modules/return-order-items/service/return-order-items.service';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  providers: [ReturnOrderItemsService, TenantDataSourceService],
  controllers: [ReturnOrderItemsController],
  exports: [ReturnOrderItemsService],
})
export class ReturnOrderItemsModule {}
