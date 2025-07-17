import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsController } from './controller/payment-methods.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { PaymentMethodsService } from './service/payment-methods.service';
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
