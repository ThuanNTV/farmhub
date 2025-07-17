import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { InstallmentsController } from './controller/installments.controller';
import { InstallmentsService } from 'src/modules/installments/service/installments.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
