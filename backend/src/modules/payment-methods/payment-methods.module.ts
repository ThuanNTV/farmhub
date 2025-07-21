import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsController } from 'src/modules/payment-methods/controller/payment-methods.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { SecurityModule } from 'src/common/auth/security.module';
import { GlobalDatabaseModule } from 'src/config/db/dbglobal/global-database.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    SecurityModule,
    AuditLogsModule,
    GlobalDatabaseModule,
    TypeOrmModule.forFeature([PaymentMethod], 'globalConnection'),
    AuditLogAsyncModule,
  ],
  exports: [PaymentMethodsService],
  providers: [PaymentMethodsService],
  controllers: [PaymentMethodsController],
})
export class PaymentMethodsModule {}
