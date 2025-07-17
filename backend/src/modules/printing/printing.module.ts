import { Module } from '@nestjs/common';
import { PrintingController } from './controller/printing.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PrintingService } from './service/printing.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PrintingController],
  providers: [PrintingService],
})
export class PrintingModule {}
