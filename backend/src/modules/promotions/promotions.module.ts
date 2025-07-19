import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PromotionsController } from 'src/modules/promotions/controller/promotions.controller';
import { PromotionsService } from 'src/modules/promotions/service/promotions.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
