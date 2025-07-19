import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PaymentsController } from '@modules/payments/controller/payments.controller';
import { PaymentsService } from '@modules/payments/service/payments.service';
import { CreatePaymentDto } from '@modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from '@modules/payments/dto/update-payment.dto';
import { PaymentResponseDto } from '@modules/payments/dto/payment-response.dto';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentStatus } from 'src/entities/tenant/payment.entity';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: jest.Mocked<PaymentsService>;

  const mockPaymentResponse: PaymentResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
    amount: '200.00',
    paidAt: new Date('2024-01-15T10:30:00Z'),
    status: PaymentStatus.PAID,
    note: 'Test payment',
    paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
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
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
        { provide: AuditInterceptor, useValue: mockAuditInterceptor },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockEnhancedAuthGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue(mockAuditInterceptor)
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPaymentDto: CreatePaymentDto = {
      orderId: '123e4567-e89b-12d3-a456-426614174001',
      paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
      amount: '200.00',
      status: PaymentStatus.PAID,
      note: 'Test payment',
      paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
    };

    it('should create a payment successfully', async () => {
      mockPaymentsService.createPayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.create('store-123', createPaymentDto);

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(
        'store-123',
        createPaymentDto,
      );
    });

    it('should handle validation errors', async () => {
      mockPaymentsService.createPayment.mockRejectedValue(
        new BadRequestException('Payment amount must be greater than zero'),
      );

      await expect(
        controller.create('store-123', createPaymentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      mockPaymentsService.createPayment.mockRejectedValue(
        new InternalServerErrorException('Payment creation failed'),
      );

      await expect(
        controller.create('store-123', createPaymentDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const mockFilters = {
      status: 'paid',
      payment_method_id: 'method-123',
      page: 1,
      limit: 10,
    };

    const mockResponse = {
      data: [mockPaymentResponse],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    it('should return filtered payments with pagination', async () => {
      mockPaymentsService.findWithFilters.mockResolvedValue(mockResponse);

      const result = await controller.findAll('store-123', mockFilters);

      expect(result).toEqual(mockResponse);
      expect(mockPaymentsService.findWithFilters).toHaveBeenCalledWith(
        'store-123',
        mockFilters,
      );
    });

    it('should handle date filters correctly', async () => {
      const filtersWithDates = {
        ...mockFilters,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const expectedFilters = {
        ...mockFilters,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
      };

      mockPaymentsService.findWithFilters.mockResolvedValue(mockResponse);

      await controller.findAll('store-123', filtersWithDates);

      expect(mockPaymentsService.findWithFilters).toHaveBeenCalledWith(
        'store-123',
        expectedFilters,
      );
    });

    it('should handle empty results', async () => {
      const emptyResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockPaymentsService.findWithFilters.mockResolvedValue(emptyResponse);

      const result = await controller.findAll('store-123', {});

      expect(result).toEqual(emptyResponse);
    });
  });

  describe('getStats', () => {
    const mockStatsFilters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      payment_method_id: 'method-123',
    };

    const mockStats = {
      total_payments: 50,
      total_amount: 10000,
      average_amount: 200,
      min_amount: 50,
      max_amount: 500,
    };

    it('should return payment statistics', async () => {
      const expectedFilters = {
        ...mockStatsFilters,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
      };

      mockPaymentsService.getPaymentStats.mockResolvedValue(mockStats);

      const result = await controller.getStats('store-123', mockStatsFilters);

      expect(result).toEqual(mockStats);
      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalledWith(
        'store-123',
        expectedFilters,
      );
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        total_payments: 0,
        total_amount: 0,
        average_amount: 0,
        min_amount: 0,
        max_amount: 0,
      };

      mockPaymentsService.getPaymentStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats('store-123', {});

      expect(result).toEqual(emptyStats);
    });
  });

  describe('findById', () => {
    it('should return payment by ID', async () => {
      mockPaymentsService.findOne.mockResolvedValue(mockPaymentResponse);

      const result = await controller.findById('store-123', 'payment-123');

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(
        'store-123',
        'payment-123',
      );
    });

    it('should handle payment not found', async () => {
      mockPaymentsService.findOne.mockRejectedValue(
        new NotFoundException('Payment with ID "payment-123" not found'),
      );

      await expect(
        controller.findById('store-123', 'payment-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updatePaymentDto: UpdatePaymentDto = {
      amount: '250.00',
      status: PaymentStatus.PAID,
      note: 'Updated payment',
    };

    it('should update payment successfully', async () => {
      const updatedPayment = { ...mockPaymentResponse, ...updatePaymentDto };
      mockPaymentsService.updatePayment.mockResolvedValue(updatedPayment);

      const result = await controller.update(
        'store-123',
        'payment-123',
        updatePaymentDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(mockPaymentsService.updatePayment).toHaveBeenCalledWith(
        'store-123',
        'payment-123',
        updatePaymentDto,
      );
    });

    it('should handle update validation errors', async () => {
      mockPaymentsService.updatePayment.mockRejectedValue(
        new BadRequestException('Payment amount must be greater than zero'),
      );

      await expect(
        controller.update('store-123', 'payment-123', updatePaymentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle payment not found during update', async () => {
      mockPaymentsService.updatePayment.mockRejectedValue(
        new NotFoundException('Payment with ID "payment-123" not found'),
      );

      await expect(
        controller.update('store-123', 'payment-123', updatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete payment successfully', async () => {
      mockPaymentsService.removePayment.mockResolvedValue(undefined);

      const result = await controller.remove('store-123', 'payment-123');

      expect(result).toBeUndefined();
      expect(mockPaymentsService.removePayment).toHaveBeenCalledWith(
        'store-123',
        'payment-123',
      );
    });

    it('should handle delete errors', async () => {
      mockPaymentsService.removePayment.mockRejectedValue(
        new InternalServerErrorException('Cannot delete payment'),
      );

      await expect(
        controller.remove('store-123', 'payment-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('restore', () => {
    it('should restore payment successfully', async () => {
      mockPaymentsService.restorePayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.restore('store-123', 'payment-123');

      expect(result).toEqual(mockPaymentResponse);
      expect(mockPaymentsService.restorePayment).toHaveBeenCalledWith(
        'store-123',
        'payment-123',
      );
    });

    it('should handle restore errors', async () => {
      mockPaymentsService.restorePayment.mockRejectedValue(
        new InternalServerErrorException('Payment not found or not deleted'),
      );

      await expect(
        controller.restore('store-123', 'payment-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
