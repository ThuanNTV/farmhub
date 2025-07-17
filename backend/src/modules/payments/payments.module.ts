import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './service/payments.service';
import { PaymentTransactionService } from './service/transaction/payment-transaction.service';
import { PaymentGatewayService } from './service/transaction/payment-gateway.service';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentTransactionService,
    PaymentGatewayService,
  ],
  exports: [PaymentsService, PaymentTransactionService, PaymentGatewayService],
})
export class PaymentsModule {}
