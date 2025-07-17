import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { Unit } from 'src/entities/global/unit.entity';
import { UnitsService } from './service/units.service';
import { UnitsController } from './controller/units.controller';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    SecurityModule,
    AuditLogsModule,
    GlobalDatabaseModule,
    TypeOrmModule.forFeature([Unit], 'globalConnection'),
    AuditLogAsyncModule,
  ],
  providers: [UnitsService],
  controllers: [UnitsController],
  exports: [UnitsService],
})
export class UnitsModule {}
