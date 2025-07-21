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
    targetTable: string,
    targetId: string,
    newData: any,
    storeId: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'CREATE',
      targetTable,
      targetId,
      newValue: newData,
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
    targetTable: string,
    targetId: string,
    oldData: any,
    newData: any,
    storeId: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'UPDATE',
      targetTable,
      targetId,
      oldValue: oldData,
      newValue: newData,
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
    targetTable: string,
    targetId: string,
    deletedData: any,
    storeId: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'DELETE',
      targetTable,
      targetId,
      oldValue: deletedData,
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
    storeId: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'LOGIN',
      targetTable: 'authentication',
      targetId: userId,
      storeId,
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
    storeId: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action: 'LOGOUT',
      targetTable: 'authentication',
      targetId: userId,
      storeId,
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
    targetTable: string,
    targetId: string,
    data: any,
    storeId: string,
    additionalData?: Partial<AuditLogJobData>,
  ): Promise<void> {
    const auditData: AuditLogJobData = {
      userId,
      userName,
      action,
      targetTable,
      targetId,
      details: data,
      storeId,
      ...additionalData,
    };

    await this.auditLogQueue.addCriticalAuditLog(auditData);
  }

  /**
   * Ghi audit log bulk cho nhiều hành động cùng lúc
   */
  async logBulkActions(auditDataArray: AuditLogJobData[]): Promise<void> {
    await this.auditLogQueue.addBulkAuditLogs(auditDataArray);
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
