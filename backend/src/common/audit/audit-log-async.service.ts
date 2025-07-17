import { Injectable, Logger } from '@nestjs/common';
import {
  AuditLogQueueService,
  AuditLogJobData,
} from '../queue/audit-log-queue.service';

/**
 * Service cung cấp API đơn giản cho việc ghi audit log bất đồng bộ
 * Thay thế cho việc ghi audit log trực tiếp vào database
 */
@Injectable()
export class AuditLogAsyncService {
  private readonly logger = new Logger(AuditLogAsyncService.name);

  constructor(private auditLogQueue: AuditLogQueueService) {}

  /**
   * Ghi audit log cho việc tạo record
   */
  async logCreate(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    newData: any,
    storeId?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'CREATE',
      resource,
      resourceId,
      newValue: newData,
      timestamp: new Date(),
      storeId,
      ...additionalData,
    };

    await this.auditLogQueue.addAuditLog(auditData);
  }

  /**
   * Ghi audit log cho việc cập nhật record
   */
  async logUpdate(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    oldData: any,
    newData: any,
    storeId?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'UPDATE',
      resource,
      resourceId,
      oldValue: oldData,
      newValue: newData,
      timestamp: new Date(),
      storeId,
      ...additionalData,
    };

    await this.auditLogQueue.addAuditLog(auditData);
  }

  /**
   * Ghi audit log cho việc xóa record
   */
  async logDelete(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    deletedData: any,
    storeId?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'DELETE',
      resource,
      resourceId,
      oldValue: deletedData,
      timestamp: new Date(),
      storeId,
      ...additionalData,
    };

    await this.auditLogQueue.addAuditLog(auditData);
  }

  /**
   * Ghi audit log cho việc đăng nhập
   */
  async logLogin(
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'LOGIN',
      resource: 'authentication',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      ...additionalData,
    };

    await this.auditLogQueue.addCriticalAuditLog(auditData);
  }

  /**
   * Ghi audit log cho việc đăng xuất
   */
  async logLogout(
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'LOGOUT',
      resource: 'authentication',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      ...additionalData,
    };

    await this.auditLogQueue.addCriticalAuditLog(auditData);
  }

  /**
   * Ghi audit log cho các hành động quan trọng với độ ưu tiên cao
   */
  async logCriticalAction(
    userId: string,
    userName: string,
    action: string,
    resource: string,
    resourceId?: string,
    data?: any,
    storeId?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action,
      resource,
      resourceId,
      details: data,
      timestamp: new Date(),
      storeId,
      ...additionalData,
    };

    await this.auditLogQueue.addCriticalAuditLog(auditData);
  }

  /**
   * Ghi audit log bulk cho nhiều hành động cùng lúc
   */
  async logBulkActions(auditDataArray: AuditLogJobData[]): Promise<void> {
    // Thêm timestamp cho tất cả nếu chưa có
    const dataWithTimestamp = auditDataArray.map((data) => ({
      ...data,
      timestamp: data.timestamp || new Date(),
    }));

    await this.auditLogQueue.addBulkAuditLogs(dataWithTimestamp);
  }

  /**
   * Lấy trạng thái queue để monitoring
   */
  async getQueueStatus() {
    return await this.auditLogQueue.getQueueStatus();
  }

  /**
   * Xóa tất cả jobs trong queue (chỉ dùng cho testing)
   */
  async clearQueue(): Promise<void> {
    await this.auditLogQueue.clearQueue();
  }
}
