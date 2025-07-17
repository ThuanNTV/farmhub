import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { InventoryTransfersController } from './controller/inventory-transfers.controller';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [InventoryTransfersController],
  providers: [InventoryTransfersService],
  exports: [InventoryTransfersService],
})
export class InventoryTransfersModule {}
