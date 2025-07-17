import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Payment } from 'src/entities/tenant/payment.entity';
import { CreatePaymentDto } from 'src/modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from 'src/modules/payments/dto/update-payment.dto';
import { PaymentResponseDto } from 'src/modules/payments/dto/payment-response.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { PaymentTransactionService } from './transaction/payment-transaction.service';
import { PaymentGatewayService } from './transaction/payment-gateway.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class PaymentsService extends TenantBaseService<Payment> {
  protected readonly logger = new Logger(PaymentsService.name);
  protected primaryKey!: string;

  constructor(
    tenantDS: TenantDataSourceService,
    private readonly paymentTransactionService: PaymentTransactionService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {
    super(tenantDS, Payment);
    this.primaryKey = 'id';
  }

  /**
   * Create payment with external gateway processing
   * @param storeId Store ID
   * @param dto Payment creation data
   * @returns Created payment response
   */
  async createPayment(
    storeId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Creating payment for store: ${storeId}`);

      // Validate payment amount
      const amount = parseFloat(dto.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException(
          'Payment amount must be greater than zero',
        );
      }

      const entityData = DtoMapper.mapToEntity<Payment>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`Payment created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create payment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Create payment within transaction (for atomic operations)
   * @param orderId Order ID
   * @param amount Payment amount
   * @param paymentMethodId Payment method ID
   * @param paidByUserId User ID who made the payment
   * @param manager EntityManager for transaction
   * @returns Created payment
   */
  async createPaymentInTransaction(
    orderId: string,
    amount: number,
    paymentMethodId: string,
    paidByUserId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    return await this.paymentTransactionService.createPayment(
      orderId,
      amount,
      paymentMethodId,
      paidByUserId,
      manager,
    );
  }

  /**
   * Process payment through external gateway
   * @param amount Payment amount
   * @param paymentMethodId Payment method ID
   * @param orderId Order ID for reference
   * @returns Payment processing result
   */
  async processPaymentGateway(
    amount: number,
    paymentMethodId: string,
    orderId?: string,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    return await this.paymentGatewayService.processPayment(
      amount,
      paymentMethodId,
      orderId,
    );
  }

  /**
   * Verify payment status from external gateway
   * @param transactionId Transaction ID from gateway
   * @returns Payment verification result
   */
  async verifyPaymentGateway(transactionId: string): Promise<{
    success: boolean;
    status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
    amount?: number;
    error?: string;
  }> {
    return await this.paymentGatewayService.verifyPayment(transactionId);
  }

  async findPaymentById(
    storeId: string,
    id: string,
  ): Promise<PaymentResponseDto | null> {
    try {
      this.logger.debug(`Finding payment by ID: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Payment not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find payment: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<PaymentResponseDto> {
    try {
      this.logger.debug(`Finding payment by ID: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(`Payment with ID "${id}" not found`);
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find payment: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async findAllPayments(storeId: string): Promise<PaymentResponseDto[]> {
    try {
      this.logger.debug(`Finding all payments for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['order', 'payment_method', 'paid_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} payments`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find payments: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async updatePayment(
    storeId: string,
    id: string,
    dto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Updating payment: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Payment with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Validate payment amount if provided
      if (dto.amount !== undefined) {
        const amount = parseFloat(dto.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new BadRequestException(
            'Payment amount must be greater than zero',
          );
        }
      }

      const entityData = DtoMapper.mapToEntity<Payment>(
        dto as unknown as Record<string, unknown>,
      );

      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Payment updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update payment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removePayment(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(`Removing payment: ${id} from store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Payment with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      await repo.save(entity);

      this.logger.log(`Payment soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove payment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restorePayment(
    storeId: string,
    id: string,
  ): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Restoring payment: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Payment with ID "${id}" not found or not deleted`,
        );
      }

      entity.is_deleted = false;
      const restored = await repo.save(entity);

      this.logger.log(`Payment restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore payment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findWithFilters(
    storeId: string,
    filters: {
      status?: string;
      payment_method_id?: string;
      paid_by_user_id?: string;
      order_id?: string;
      min_amount?: number;
      max_amount?: number;
      start_date?: Date;
      end_date?: Date;
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'ASC' | 'DESC';
    },
  ) {
    try {
      this.logger.debug(`Finding payments with filters for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const queryBuilder = repo
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .leftJoinAndSelect('payment.payment_method', 'payment_method')
        .leftJoinAndSelect('payment.paid_by_user', 'paid_by_user')
        .where('payment.is_deleted = :is_deleted', { is_deleted: false });

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('payment.status = :status', {
          status: filters.status,
        });
      }

      if (filters.payment_method_id) {
        queryBuilder.andWhere('payment.paymentMethodId = :paymentMethodId', {
          paymentMethodId: filters.payment_method_id,
        });
      }

      if (filters.paid_by_user_id) {
        queryBuilder.andWhere('payment.paidByUserId = :paidByUserId', {
          paidByUserId: filters.paid_by_user_id,
        });
      }

      if (filters.order_id) {
        queryBuilder.andWhere('payment.orderId = :orderId', {
          orderId: filters.order_id,
        });
      }

      if (filters.min_amount !== undefined) {
        queryBuilder.andWhere('payment.amount >= :minAmount', {
          minAmount: filters.min_amount,
        });
      }

      if (filters.max_amount !== undefined) {
        queryBuilder.andWhere('payment.amount <= :maxAmount', {
          maxAmount: filters.max_amount,
        });
      }

      if (filters.start_date) {
        queryBuilder.andWhere('payment.createdAt >= :startDate', {
          startDate: filters.start_date,
        });
      }

      if (filters.end_date) {
        queryBuilder.andWhere('payment.createdAt <= :endDate', {
          endDate: filters.end_date,
        });
      }

      // Apply sorting
      const sortBy = filters.sort_by ?? 'created_at';
      const sortOrder = filters.sort_order ?? 'DESC';
      queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);

      // Apply pagination
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [payments, total] = await queryBuilder.getManyAndCount();

      this.logger.debug(`Found ${payments.length} payments with filters`);

      return {
        data: payments.map((payment) => this.mapToResponseDto(payment)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find payments with filters: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getPaymentStats(
    storeId: string,
    filters?: {
      start_date?: Date;
      end_date?: Date;
      payment_method_id?: string;
    },
  ) {
    try {
      this.logger.debug(`Getting payment stats for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const queryBuilder = repo
        .createQueryBuilder('payment')
        .where('payment.is_deleted = :is_deleted', { is_deleted: false });

      if (filters?.start_date) {
        queryBuilder.andWhere('payment.createdAt >= :startDate', {
          startDate: filters.start_date,
        });
      }

      if (filters?.end_date) {
        queryBuilder.andWhere('payment.createdAt <= :endDate', {
          endDate: filters.end_date,
        });
      }

      if (filters?.payment_method_id) {
        queryBuilder.andWhere('payment.paymentMethodId = :paymentMethodId', {
          paymentMethodId: filters.payment_method_id,
        });
      }

      const stats = await queryBuilder
        .select([
          'COUNT(*) as total_payments',
          'SUM(payment.amount) as total_amount',
          'AVG(payment.amount) as average_amount',
          'MIN(payment.amount) as min_amount',
          'MAX(payment.amount) as max_amount',
        ])
        .getRawOne<{
          total_payments: string;
          total_amount: string;
          average_amount: string;
          min_amount: string;
          max_amount: string;
        }>();

      this.logger.debug(`Payment stats calculated successfully`);

      return {
        total_payments: stats ? parseInt(stats.total_payments) || 0 : 0,
        total_amount: stats ? parseFloat(stats.total_amount) || 0 : 0,
        average_amount: stats ? parseFloat(stats.average_amount) || 0 : 0,
        min_amount: stats ? parseFloat(stats.min_amount) || 0 : 0,
        max_amount: stats ? parseFloat(stats.max_amount) || 0 : 0,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get payment stats: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private mapToResponseDto(entity: Payment): PaymentResponseDto {
    return {
      id: entity.id,
      orderId: entity.order_id,
      paymentMethodId: entity.payment_method_id,
      amount: entity.amount,
      status: entity.status,
      note: entity.note,
      paidByUserId: entity.paid_by_user_id,
      paidAt: entity.paid_at,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }
}
