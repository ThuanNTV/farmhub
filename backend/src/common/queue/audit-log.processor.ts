import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogJobData } from 'src/common/queue/audit-log-queue.service';

@Processor('audit-log')
export class AuditLogProcessor {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  @Process('process-audit-log')
  async processAuditLog(job: Job<AuditLogJobData>): Promise<void> {
    const { data } = job;

    try {
      this.logger.debug(
        `Processing audit log job: ${data.action} by ${data.userName}`,
      );

      // Tạo audit log entity
      const auditLog = new AuditLog();
      auditLog.user_id = data.userId;
      auditLog.user_name = data.userName;
      auditLog.action = data.action;
      auditLog.target_table = data.targetTable;
      auditLog.target_id = data.targetId;
      auditLog.store_id = data.storeId;
      auditLog.old_value = data.oldValue;
      auditLog.new_value = data.newValue;
      auditLog.metadata = data.metadata;
      auditLog.ip_address = data.ipAddress;
      auditLog.user_agent = data.userAgent;
      auditLog.session_id = data.sessionId;
      auditLog.details = data.details;

      // Lưu vào database
      const dataSource = await this.tenantDataSourceService.getTenantDataSource(
        data.storeId,
      );
      const auditLogRepo = dataSource.getRepository(AuditLog);
      const savedLog = await auditLogRepo.save(auditLog);

      this.logger.debug(`Audit log saved successfully: ${savedLog.id}`);

      // Log metrics cho monitoring
      this.logMetrics(data.action, 'SUCCESS');
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to process audit log: ${err.message}`,
        err.stack,
      );
      this.logMetrics(data.action, 'FAILED');

      // Log chi tiết lỗi để debug
      this.logger.error(`Failed audit log data: ${JSON.stringify(data)}`);

      // Rethrow để Bull queue có thể retry
      throw error;
    }
  }

  /**
   * Xử lý khi job bị lỗi sau khi retry hết
   */
  @OnQueueFailed()
  async handleFailedJob(
    job: Job<AuditLogJobData>,
    error: Error,
  ): Promise<void> {
    const { data } = job;

    this.logger.error(
      `Audit log job failed permanently: ${data.action} by ${data.userName}`,
    );

    // Ghi vào file log như fallback cuối cùng
    this.logger.error(`PERMANENT_FAILURE_AUDIT_LOG: ${JSON.stringify(data)}`);

    // Có thể gửi alert đến monitoring system
    this.sendFailureAlert(data);
  }

  /**
   * Log metrics cho monitoring
   */
  private logMetrics(action: string, status: 'SUCCESS' | 'FAILED'): void {
    const metrics = {
      type: 'audit_log_processing',
      action,
      status,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`AUDIT_LOG_METRICS: ${JSON.stringify(metrics)}`);
  }

  /**
   * Gửi alert khi job thất bại vĩnh viễn
   */
  private sendFailureAlert(data: AuditLogJobData): void {
    // Implement logic gửi alert đến monitoring system
    // Ví dụ: Slack, Email, PagerDuty, etc.

    const alertData = {
      type: 'AUDIT_LOG_FAILURE',
      severity: 'HIGH',
      message: `Audit log job failed permanently: ${data.action} by ${data.userName}`,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(`AUDIT_LOG_ALERT: ${JSON.stringify(alertData)}`);
  }
}
