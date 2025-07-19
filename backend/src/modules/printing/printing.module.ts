import { Module } from '@nestjs/common';
import { PrintingController } from 'src/modules/printing/controller/printing.controller';
import { PrintingService } from 'src/modules/printing/service/printing.service';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PrintingController],
  providers: [PrintingService],
})
export class PrintingModule {}
