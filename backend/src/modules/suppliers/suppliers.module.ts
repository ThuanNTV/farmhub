import { Module } from '@nestjs/common';
import { SuppliersController } from 'src/modules/suppliers/controller/suppliers.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SuppliersService } from 'src/modules/suppliers/service/suppliers.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
