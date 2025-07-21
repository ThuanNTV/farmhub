import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '@modules/payments/controller/payments.controller';
import { PaymentsService } from '@modules/payments/service/payments.service';
import { CreatePaymentDto } from '@modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from '@modules/payments/dto/update-payment.dto';
import { Payment, PaymentStatus } from 'src/entities/tenant/payment.entity';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { SecurityService } from 'src/service/global/security.service';
import { Reflector } from '@nestjs/core';
import { PaymentResponseDto } from '@modules/payments/dto/payment-response.dto';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: jest.Mocked<PaymentsService>;

  const storeId = 'store-uuid-123';
  const paymentId = 'payment-uuid-456';

  // This is the mock for the RESPONSE DTO
  const mockPaymentResponse: PaymentResponseDto = {
    id: paymentId,
    orderId: 'order-uuid-789',
    amount: '250.75',
    paidAt: new Date(),
    paymentMethodId: 'pm-cash',
    status: PaymentStatus.PAID,
    note: 'Test payment',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPaymentsService = {
      createPayment: jest.fn(),
      findWithFilters: jest.fn(),
      getPaymentStats: jest.fn(),
      findOne: jest.fn(),
      updatePayment: jest.fn(),
      removePayment: jest.fn(),
      restorePayment: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        // Mock Guards and their dependencies
        {
          provide: EnhancedAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: PermissionGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: SecurityService,
          useValue: { validateRequest: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: Reflector,
          useValue: { get: jest.fn() },
        },
        // Mock Interceptor and its dependencies
        {
          provide: AuditInterceptor,
          useValue: { intercept: jest.fn((_, next) => next.handle()) }, // Bypass interceptor
        },
        {
          provide: AuditLogAsyncService,
          useValue: { create: jest.fn() }, // Dependency for AuditInterceptor
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createPayment and return the result', async () => {
      const createDto: CreatePaymentDto = {
        orderId: 'order-uuid-789',
        amount: '250.75',
        paymentMethodId: 'pm-cash',
        status: PaymentStatus.PAID,
        note: 'New payment',
      };
      mockPaymentsService.createPayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.create(storeId, createDto);

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findWithFilters with correct params', async () => {
      const query = {
        status: 'paid',
        page: 1,
        limit: 10,
        sort_by: 'createdAt',
        sort_order: 'DESC' as const,
      };
      const expectedFilters = {
        ...query,
        start_date: undefined,
        end_date: undefined,
      };
      const paginatedResult = {
        data: [mockPaymentResponse],
        pagination: {} as any,
      };
      mockPaymentsService.findWithFilters.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(storeId, query);

      expect(result).toEqual(paginatedResult);
      expect(mockPaymentsService.findWithFilters).toHaveBeenCalledWith(
        storeId,
        expectedFilters,
      );
    });
  });

  describe('getStats', () => {
    it('should call service.getPaymentStats', async () => {
      const stats = { totalAmount: 5000 };
      mockPaymentsService.getPaymentStats.mockResolvedValue(stats as any);

      const result = await controller.getStats(storeId, {});

      expect(result).toEqual(stats);
      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalledWith(
        storeId,
        { start_date: undefined, end_date: undefined },
      );
    });
  });

  describe('findById', () => {
    it('should call service.findOne and return a payment', async () => {
      mockPaymentsService.findOne.mockResolvedValue(mockPaymentResponse);

      const result = await controller.findById(storeId, paymentId);

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(
        storeId,
        paymentId,
      );
    });
  });

  describe('update', () => {
    it('should call service.updatePayment with correct params', async () => {
      const updateDto: UpdatePaymentDto = { note: 'Updated note' };
      mockPaymentsService.updatePayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.update(storeId, paymentId, updateDto);

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.updatePayment).toHaveBeenCalledWith(
        storeId,
        paymentId,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.removePayment', async () => {
      const successResponse = { message: 'Deleted' };
      mockPaymentsService.removePayment.mockResolvedValue(
        successResponse as any,
      );

      const result = await controller.remove(storeId, paymentId);

      expect(result).toEqual(successResponse);
      expect(mockPaymentsService.removePayment).toHaveBeenCalledWith(
        storeId,
        paymentId,
      );
    });
  });

  describe('restore', () => {
    it('should call service.restorePayment', async () => {
      mockPaymentsService.restorePayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.restore(storeId, paymentId);

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.restorePayment).toHaveBeenCalledWith(
        storeId,
        paymentId,
      );
    });
  });
});
