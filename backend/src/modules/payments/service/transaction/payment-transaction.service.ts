import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
} from '../../../../entities/tenant/payment.entity';
import { EntityManager } from 'typeorm';

/**
 * Service for handling payment transactions within database transactions
 * This service provides atomic payment operations for use within larger transactions
 */
@Injectable()
export class PaymentTransactionService {
  private readonly logger = new Logger(PaymentTransactionService.name);

  /**
   * Create payment record within an existing transaction
   * @param orderId Order ID
   * @param amount Payment amount
   * @param paymentMethodId Payment method ID
   * @param paidByUserId User ID who made the payment
   * @param manager EntityManager for transaction
   * @returns Created payment
   */
  async createPayment(
    orderId: string,
    amount: number,
    paymentMethodId: string,
    paidByUserId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    try {
      this.logger.debug(
        `Creating payment within transaction - Order: ${orderId}, Amount: ${amount}`,
      );

      const paymentRepo = manager.getRepository(Payment);

      // Validate payment amount
      if (amount <= 0) {
        throw new BadRequestException('❌ Số tiền thanh toán phải lớn hơn 0');
      }

      // Create payment record
      const payment = paymentRepo.create({
        order_id: orderId,
        amount: amount.toString(),
        payment_method_id: paymentMethodId,
        paid_by_user_id: paidByUserId,
        status: PaymentStatus.PAID,
        paid_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      });

      const savedPayment = await paymentRepo.save(payment);

      this.logger.log(
        `Payment created successfully within transaction - ID: ${savedPayment.id}`,
      );

      return savedPayment;
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      const errStack =
        typeof error === 'object' && error !== null && 'stack' in error
          ? (error as { stack?: string }).stack
          : undefined;
      this.logger.error(
        `Failed to create payment within transaction: ${errMsg}`,
        errStack,
      );
      throw error;
    }
  }

  /**
   * Update payment status within an existing transaction
   * @param paymentId Payment ID
   * @param status New payment status
   * @param manager EntityManager for transaction
   * @returns Updated payment
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    manager: EntityManager,
  ): Promise<Payment> {
    try {
      this.logger.debug(
        `Updating payment status within transaction - ID: ${paymentId}, Status: ${status}`,
      );

      const paymentRepo = manager.getRepository(Payment);

      const payment = await paymentRepo.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new BadRequestException(`Payment with ID ${paymentId} not found`);
      }

      payment.status = status;
      payment.updated_at = new Date();

      const updatedPayment = await paymentRepo.save(payment);

      this.logger.log(
        `Payment status updated successfully within transaction - ID: ${paymentId}`,
      );

      return updatedPayment;
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      const errStack =
        typeof error === 'object' && error !== null && 'stack' in error
          ? (error as { stack?: string }).stack
          : undefined;
      this.logger.error(
        `Failed to update payment status within transaction: ${errMsg}`,
        errStack,
      );
      throw error;
    }
  }

  /**
   * Cancel payment within an existing transaction
   * @param paymentId Payment ID
   * @param manager EntityManager for transaction
   * @returns Updated payment
   */
  async cancelPayment(
    paymentId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    try {
      this.logger.debug(
        `Canceling payment within transaction - ID: ${paymentId}`,
      );

      return await this.updatePaymentStatus(
        paymentId,
        PaymentStatus.CANCELED,
        manager,
      );
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      const errStack =
        typeof error === 'object' && error !== null && 'stack' in error
          ? (error as { stack?: string }).stack
          : undefined;
      this.logger.error(
        `Failed to cancel payment within transaction: ${errMsg}`,
        errStack,
      );
      throw error;
    }
  }

  /**
   * Refund payment within an existing transaction
   * @param paymentId Payment ID
   * @param manager EntityManager for transaction
   * @returns Updated payment
   */
  async refundPayment(
    paymentId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    try {
      this.logger.debug(
        `Refunding payment within transaction - ID: ${paymentId}`,
      );

      return await this.updatePaymentStatus(
        paymentId,
        PaymentStatus.REFUND,
        manager,
      );
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      const errStack =
        typeof error === 'object' && error !== null && 'stack' in error
          ? (error as { stack?: string }).stack
          : undefined;
      this.logger.error(
        `Failed to refund payment within transaction: ${errMsg}`,
        errStack,
      );
      throw error;
    }
  }

  async processPayment(
    totalPaid: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; error?: string }> {
    this.logger.debug(
      `Stub: processPayment với số tiền ${totalPaid} và phương thức ${paymentMethodId}`,
    );
    // TODO: Thêm logic xử lý thanh toán thực tế nếu cần
    return { success: true };
  }
}
