import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { FileAttachmentsController } from './controller/file-attachments.controller';
import { FileAttachmentsService } from 'src/modules/file-attachments/service/file-attachments.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [FileAttachmentsController],
  providers: [FileAttachmentsService],
  exports: [FileAttachmentsService],
})
export class FileAttachmentsModule {}
