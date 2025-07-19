import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PaymentsController } from 'src/modules/payments/controller/payments.controller';
import { PaymentsService } from 'src/modules/payments/service/payments.service';
import { PaymentTransactionService } from 'src/modules/payments/service/transaction/payment-transaction.service';
import { PaymentGatewayService } from 'src/modules/payments/service/transaction/payment-gateway.service';

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
