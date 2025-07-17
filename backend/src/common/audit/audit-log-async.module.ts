import { Module } from '@nestjs/common';
import { AuditLogAsyncService } from './audit-log-async.service';

@Module({
  providers: [AuditLogAsyncService],
  exports: [AuditLogAsyncService],
})
export class AuditLogAsyncModule {}
