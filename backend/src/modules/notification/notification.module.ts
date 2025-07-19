import { Module } from '@nestjs/common';
import { NotificationController } from 'src/modules/notification/controller/notification.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { NotificationService } from 'src/service/global/notification.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [NotificationController],
  providers: [NotificationService, TenantDataSourceService],
  exports: [NotificationService],
})
export class NotificationModule {}
