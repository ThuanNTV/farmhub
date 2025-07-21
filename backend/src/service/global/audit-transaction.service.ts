import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';

/**
 * Service for handling audit log operations within database transactions
 * This service provides atomic audit logging for use within larger transactions
 */
@Injectable()
export class AuditTransactionService {
  private readonly logger = new Logger(AuditTransactionService.name);

  constructor(private auditLogAsyncService: AuditLogAsyncService) {}

  /**
   * Create audit log within an existing transaction
   * @param userId User ID who performed the action
   * @param action Action performed
   * @param targetTable Target table name
   * @param targetId Target record ID
   * @param metadata Additional metadata
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async createAuditLog(
    userId: string,
    action: string,
    targetTable: string,
    targetId: string,
    metadata: Record<string, unknown>,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Creating audit log within transaction - User: ${userId}, Action: ${action}, Table: ${targetTable}, Target: ${targetId}`,
      );

      const auditRepo = manager.getRepository(AuditLog);
      const auditLog = auditRepo.create({
        user_id: userId,
        action,
        target_table: targetTable,
        target_id: targetId,
        metadata,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      });

      const savedAuditLog = await auditRepo.save(auditLog);

      this.logger.log(
        `Audit log created successfully within transaction - ID: ${savedAuditLog.id}`,
      );

      return savedAuditLog;
    } catch (error) {
      this.logger.error(
        `Failed to create audit log within transaction: ${error && typeof error === 'object' && 'message' in error ? (error as Error).message : String(error)}`,
        error && typeof error === 'object' && 'stack' in error
          ? (error as Error).stack
          : undefined,
      );
      throw error;
    }
  }

  /**
   * Create order creation audit log
   * @param userId User ID who created the order
   * @param orderId Order ID
   * @param orderData Order data
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logOrderCreation(
    userId: string,
    orderId: string,
    orderData: Record<string, unknown>,
    manager?: EntityManager,
    storeId?: string,
  ): Promise<void> {
    if (manager) {
      // Ghi log trong transaction nếu bắt buộc
      await this.createAuditLog(
        userId,
        'CREATE_ORDER',
        'order',
        orderId,
        {
          orderData,
          timestamp: new Date().toISOString(),
          operation: 'order_creation',
        },
        manager,
      );
    } else if (storeId) {
      // Ghi log bất đồng bộ qua queue
      await this.auditLogAsyncService.logCreate(
        userId,
        userId,
        'order',
        orderId,
        orderData,
        storeId,
        { details: JSON.stringify({ operation: 'order_creation' }) },
      );
    }
  }

  /**
   * Create order update audit log
   * @param userId User ID who updated the order
   * @param orderId Order ID
   * @param oldData Old order data
   * @param newData New order data
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logOrderUpdate(
    userId: string,
    orderId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging order update - User: ${userId}, Order: ${orderId}`,
      );

      return await this.createAuditLog(
        userId,
        'UPDATE_ORDER',
        'order',
        orderId,
        {
          oldData,
          newData,
          timestamp: new Date().toISOString(),
          operation: 'order_update',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log order update: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create order cancellation audit log
   * @param userId User ID who cancelled the order
   * @param orderId Order ID
   * @param reason Cancellation reason
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logOrderCancellation(
    userId: string,
    orderId: string,
    reason: string,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging order cancellation - User: ${userId}, Order: ${orderId}, Reason: ${reason}`,
      );

      return await this.createAuditLog(
        userId,
        'CANCEL_ORDER',
        'order',
        orderId,
        {
          reason,
          timestamp: new Date().toISOString(),
          operation: 'order_cancellation',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log order cancellation: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create stock update audit log
   * @param userId User ID who updated stock
   * @param productId Product ID
   * @param stockChange Stock change amount
   * @param reason Reason for stock change
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logStockUpdate(
    userId: string,
    productId: string,
    stockChange: number,
    reason: string,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging stock update - User: ${userId}, Product: ${productId}, Change: ${stockChange}`,
      );

      return await this.createAuditLog(
        userId,
        'UPDATE_STOCK',
        'product',
        productId,
        {
          stockChange,
          reason,
          timestamp: new Date().toISOString(),
          operation: 'stock_update',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log stock update: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create payment audit log
   * @param userId User ID who made the payment
   * @param paymentId Payment ID
   * @param paymentData Payment data
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logPayment(
    userId: string,
    paymentId: string,
    paymentData: Record<string, unknown>,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging payment - User: ${userId}, Payment: ${paymentId}`,
      );

      return await this.createAuditLog(
        userId,
        'CREATE_PAYMENT',
        'payment',
        paymentId,
        {
          paymentData,
          timestamp: new Date().toISOString(),
          operation: 'payment_creation',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log payment: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create product creation audit log
   * @param userId User ID who created the product
   * @param productId Product ID
   * @param productData Product data
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logProductCreation(
    userId: string,
    productId: string,
    productData: Record<string, unknown>,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging product creation - User: ${userId}, Product: ${productId}`,
      );

      return await this.createAuditLog(
        userId,
        'CREATE_PRODUCT',
        'product',
        productId,
        {
          productData,
          timestamp: new Date().toISOString(),
          operation: 'product_creation',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log product creation: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create customer action audit log
   * @param userId User ID who performed the action
   * @param customerId Customer ID
   * @param action Action performed
   * @param actionData Action data
   * @param manager EntityManager for transaction
   * @returns Created audit log
   */
  async logCustomerAction(
    userId: string,
    customerId: string,
    action: string,
    actionData: Record<string, unknown>,
    manager: EntityManager,
  ): Promise<AuditLog> {
    try {
      this.logger.debug(
        `Logging customer action - User: ${userId}, Customer: ${customerId}, Action: ${action}`,
      );

      return await this.createAuditLog(
        userId,
        action,
        'customer',
        customerId,
        {
          actionData,
          timestamp: new Date().toISOString(),
          operation: 'customer_action',
        },
        manager,
      );
    } catch (error) {
      this.logger.error(
        `Failed to log customer action: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
