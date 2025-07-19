import { Module } from '@nestjs/common';
import { FileAttachmentsController } from 'src/modules/file-attachments/controller/file-attachments.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { FileAttachmentsService } from './service/file-attachments.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [FileAttachmentsController],
  providers: [FileAttachmentsService],
  exports: [FileAttachmentsService],
})
export class FileAttachmentsModule {}
