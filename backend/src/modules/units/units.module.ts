import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { Unit } from 'src/entities/global/unit.entity';
import { UnitsService } from 'src/modules/units/service/units.service';
import { UnitsController } from 'src/modules/units/controller/units.controller';
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
