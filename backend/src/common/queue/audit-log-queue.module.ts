import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditLogProcessor } from './audit-log.processor';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { AuditLogQueueService } from 'src/common/queue/audit-log-queue.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'audit-log',
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3, // Retry 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds delay
        },
      },
    }),
    TenantModule,
  ],
  providers: [AuditLogProcessor, AuditLogQueueService],
  exports: [AuditLogQueueService],
})
export class AuditLogQueueModule {}
