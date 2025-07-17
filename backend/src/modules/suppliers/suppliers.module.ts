import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SuppliersController } from './controller/suppliers.controller';
import { SuppliersService } from 'src/modules/suppliers/service/suppliers.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
