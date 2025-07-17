import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PromotionsController } from './controller/promotions.controller';
import { PromotionsService } from 'src/modules/promotions/service/promotions.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
