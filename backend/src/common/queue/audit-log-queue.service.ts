import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface AuditLogJobData {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  storeId?: string;
  sessionId?: string;
  details?: any;
}

@Injectable()
export class AuditLogQueueService {
  private readonly logger = new Logger(AuditLogQueueService.name);

  constructor(@InjectQueue('audit-log') private auditLogQueue: Queue) {}

  /**
   * Thêm audit log job vào queue (bất đồng bộ)
   */
  async addAuditLog(data: AuditLogJobData): Promise<void> {
    try {
      await this.auditLogQueue.add('process-audit-log', data, {
        priority: this.getPriority(data.action),
        delay: 0, // Process immediately
      });

      this.logger.debug(
        `Audit log job added: ${data.action} by ${data.userName}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to add audit log job: ${err.message}`,
        err.stack,
      );

      // Fallback: Log to file immediately if queue fails
      this.logger.warn(`Audit log fallback: ${JSON.stringify(data)}`);
    }
  }

  /**
   * Thêm audit log job với độ ưu tiên cao (cho critical actions)
   */
  async addCriticalAuditLog(data: AuditLogJobData): Promise<void> {
    try {
      await this.auditLogQueue.add('process-audit-log', data, {
        priority: 1, // Highest priority
        delay: 0,
        attempts: 5, // More retry attempts for critical logs
      });

      this.logger.debug(
        `Critical audit log job added: ${data.action} by ${data.userName}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to add critical audit log job: ${err.message}`,
        err.stack,
      );

      // Fallback: Log to file immediately
      this.logger.error(`Critical audit log fallback: ${JSON.stringify(data)}`);
    }
  }

  /**
   * Thêm nhiều audit log jobs cùng lúc (bulk)
   */
  async addBulkAuditLogs(dataArray: AuditLogJobData[]): Promise<void> {
    try {
      const jobs = dataArray.map((data) => ({
        name: 'process-audit-log',
        data,
        opts: {
          priority: this.getPriority(data.action),
          delay: 0,
        },
      }));

      await this.auditLogQueue.addBulk(jobs);

      this.logger.debug(`Bulk audit log jobs added: ${dataArray.length} jobs`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to add bulk audit log jobs: ${err.message}`,
        err.stack,
      );

      // Fallback: Log each item to file
      dataArray.forEach((data) => {
        this.logger.warn(`Bulk audit log fallback: ${JSON.stringify(data)}`);
      });
    }
  }

  /**
   * Lấy thông tin trạng thái queue
   */
  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.auditLogQueue.getWaiting(),
        this.auditLogQueue.getActive(),
        this.auditLogQueue.getCompleted(),
        this.auditLogQueue.getFailed(),
        this.auditLogQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get queue status: ${err.message}`,
        err.stack,
      );
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }

  /**
   * Xóa tất cả jobs trong queue (chỉ dùng cho testing)
   */
  async clearQueue(): Promise<void> {
    try {
      await this.auditLogQueue.clean(0, 'completed');
      await this.auditLogQueue.clean(0, 'failed');
      await this.auditLogQueue.clean(0, 'wait');
      await this.auditLogQueue.clean(0, 'active');

      this.logger.debug('Audit log queue cleared');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to clear queue: ${err.message}`, err.stack);
    }
  }

  /**
   * Xác định độ ưu tiên của job dựa trên action
   */
  private getPriority(action: string): number {
    const criticalActions = [
      'DELETE_STORE',
      'DELETE_USER',
      'CREATE_SUPER_ADMIN',
      'SYSTEM_CONFIG_CHANGE',
      'SECURITY_BREACH',
      'UNAUTHORIZED_ACCESS',
    ];

    const highPriorityActions = [
      'CREATE_STORE',
      'UPDATE_STORE',
      'CREATE_USER',
      'UPDATE_USER',
      'LOGIN_FAILED',
      'PASSWORD_CHANGE',
    ];

    if (criticalActions.includes(action)) {
      return 1; // Highest priority
    }

    if (highPriorityActions.includes(action)) {
      return 5; // High priority
    }

    return 10; // Normal priority
  }
}
