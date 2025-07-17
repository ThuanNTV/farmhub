import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../../../src/modules/payments/controller/payments.controller';
import { PaymentsService } from '../../../src/modules/payments/service/payments.service';
import { Payment } from '../../../src/entities/tenant/payment.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from 'src/modules/payments/dto/create-payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: jest.Mocked<PaymentsService>;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    order_id: '123e4567-e89b-12d3-a456-426614174001',
    payment_method_id: '123e4567-e89b-12d3-a456-426614174002',
    amount: 200.0,
    currency: 'VND',
    status: 'completed',
    transaction_id: 'TXN123456',
    paid_by_user_id: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Test payment',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    order: null,
    payment_method: null,
    paid_by_user: null,
  };

  const mockRequest = {
    user: {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      storeId: 'store-123',
    },
  };

  beforeEach(async () => {
    mockPaymentsService = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      findWithFilters: jest.fn(),
      getPaymentStats: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPaymentDto: CreatePaymentDto = {
      orderId: '123e4567-e89b-12d3-a456-426614174001',
      paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
      amount: 200.0,
      currency: 'VND',
      status: 'completed',
      transactionId: 'TXN123456',
      paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
      notes: 'Test payment',
    };

    it('should create a payment successfully', async () => {
      mockPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(
        createPaymentDto,
        mockRequest as any,
      );

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        createPaymentDto,
      );
    });

    it('should handle service errors', async () => {
      mockPaymentsService.create.mockRejectedValue(
        new InternalServerErrorException('Payment creation failed'),
      );

      await expect(
        controller.create(createPaymentDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      const payments = [mockPayment];
      mockPaymentsService.findAll.mockResolvedValue(payments);

      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual(payments);
      expect(mockPaymentsService.findAll).toHaveBeenCalledWith(
        mockRequest.user.storeId,
      );
    });

    it('should handle empty results', async () => {
      mockPaymentsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return payment by ID', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.findOne.mockResolvedValue(mockPayment);

      const result = await controller.findOne(paymentId, mockRequest as any);

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.findOne).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        paymentId,
      );
    });

    it('should handle payment not found', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.findOne.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.findOne(paymentId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updatePaymentDto: UpdatePaymentDto = {
      amount: 250.0,
      status: 'pending',
      notes: 'Updated payment',
    };

    it('should update payment successfully', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.update.mockResolvedValue(mockPayment);

      const result = await controller.update(
        paymentId,
        updatePaymentDto,
        mockRequest as any,
      );

      expect(result).toEqual(mockPayment);
      expect(mockPaymentsService.update).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        paymentId,
        updatePaymentDto,
      );
    });

    it('should handle update errors', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.update.mockRejectedValue(
        new InternalServerErrorException('Update failed'),
      );

      await expect(
        controller.update(paymentId, updatePaymentDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove payment successfully', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Payment deleted successfully',
        data: null,
      };

      mockPaymentsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(paymentId, mockRequest as any);

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentsService.remove).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        paymentId,
      );
    });

    it('should handle remove errors', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.remove.mockRejectedValue(
        new InternalServerErrorException('Cannot delete payment'),
      );

      await expect(
        controller.remove(paymentId, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('restore', () => {
    it('should restore payment successfully', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Payment restored successfully',
        data: mockPayment,
      };

      mockPaymentsService.restore.mockResolvedValue(expectedResponse);

      const result = await controller.restore(paymentId, mockRequest as any);

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentsService.restore).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        paymentId,
      );
    });

    it('should handle restore errors', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.restore.mockRejectedValue(
        new InternalServerErrorException('Payment not found or not deleted'),
      );

      await expect(
        controller.restore(paymentId, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered payments with pagination', async () => {
      const filters = {
        status: 'completed',
        min_amount: 100,
        max_amount: 500,
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        data: [mockPayment],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockPaymentsService.findWithFilters.mockResolvedValue(expectedResponse);

      const result = await controller.findWithFilters(
        filters,
        mockRequest as any,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentsService.findWithFilters).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        filters,
      );
    });

    it('should handle empty filter results', async () => {
      const filters = {
        status: 'non-existent',
      };

      const expectedResponse = {
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

      mockPaymentsService.findWithFilters.mockResolvedValue(expectedResponse);

      const result = await controller.findWithFilters(
        filters,
        mockRequest as any,
      );

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const filters = {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        payment_method_id: '123e4567-e89b-12d3-a456-426614174002',
      };

      const expectedStats = [
        {
          total_amount: 10000,
          total_count: 50,
          avg_amount: 200,
          payment_method_name: 'Credit Card',
        },
      ];

      mockPaymentsService.getPaymentStats.mockResolvedValue(expectedStats);

      const result = await controller.getPaymentStats(
        filters,
        mockRequest as any,
      );

      expect(result).toEqual(expectedStats);
      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        filters,
      );
    });

    it('should handle empty statistics', async () => {
      const filters = {};

      mockPaymentsService.getPaymentStats.mockResolvedValue([]);

      const result = await controller.getPaymentStats(
        filters,
        mockRequest as any,
      );

      expect(result).toEqual([]);
    });
  });

  describe('request validation', () => {
    it('should handle missing user in request', async () => {
      const invalidRequest = {} as any;

      await expect(controller.findAll(invalidRequest)).rejects.toThrow();
    });

    it('should handle missing storeId in user', async () => {
      const invalidRequest = {
        user: { userId: '123' },
      } as any;

      await expect(controller.findAll(invalidRequest)).rejects.toThrow();
    });
  });

  describe('parameter validation', () => {
    it('should handle invalid payment ID format', async () => {
      const invalidId = 'invalid-id';
      mockPaymentsService.findOne.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.findOne(invalidId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle empty payment ID', async () => {
      const emptyId = '';
      mockPaymentsService.findOne.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.findOne(emptyId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DTO validation', () => {
    it('should handle invalid create payment DTO', async () => {
      const invalidDto = {
        orderId: '123e4567-e89b-12d3-a456-426614174001',
        // missing required fields
      } as CreatePaymentDto;

      mockPaymentsService.create.mockRejectedValue(
        new InternalServerErrorException('Validation failed'),
      );

      await expect(
        controller.create(invalidDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid update payment DTO', async () => {
      const invalidDto = {
        amount: -100, // Invalid amount
      } as UpdatePaymentDto;

      mockPaymentsService.update.mockRejectedValue(
        new InternalServerErrorException('Invalid amount'),
      );

      await expect(
        controller.update(
          '123e4567-e89b-12d3-a456-426614174000',
          invalidDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('filter validation', () => {
    it('should handle invalid filter parameters', async () => {
      const invalidFilters = {
        min_amount: -100, // Invalid negative amount
        max_amount: 50,
      };

      mockPaymentsService.findWithFilters.mockRejectedValue(
        new InternalServerErrorException('Invalid filter parameters'),
      );

      await expect(
        controller.findWithFilters(invalidFilters, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid date range in filters', async () => {
      const invalidFilters = {
        start_date: new Date('2024-12-31'),
        end_date: new Date('2024-01-01'), // End date before start date
      };

      mockPaymentsService.findWithFilters.mockRejectedValue(
        new InternalServerErrorException('Invalid date range'),
      );

      await expect(
        controller.findWithFilters(invalidFilters, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid pagination parameters', async () => {
      const invalidFilters = {
        page: 0, // Invalid page number
        limit: 1000, // Too large limit
      };

      mockPaymentsService.findWithFilters.mockRejectedValue(
        new InternalServerErrorException('Invalid pagination parameters'),
      );

      await expect(
        controller.findWithFilters(invalidFilters, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('business logic validation', () => {
    it('should handle payment with invalid amount', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: '123e4567-e89b-12d3-a456-426614174001',
        paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
        amount: 0, // Invalid amount
        currency: 'VND',
        status: 'completed',
        transactionId: 'TXN123456',
        paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
      };

      mockPaymentsService.create.mockRejectedValue(
        new InternalServerErrorException(
          'Payment amount must be greater than 0',
        ),
      );

      await expect(
        controller.create(createPaymentDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle payment with invalid status', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: '123e4567-e89b-12d3-a456-426614174001',
        paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
        amount: 200.0,
        currency: 'VND',
        status: 'invalid-status', // Invalid status
        transactionId: 'TXN123456',
        paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
      };

      mockPaymentsService.create.mockRejectedValue(
        new InternalServerErrorException('Invalid payment status'),
      );

      await expect(
        controller.create(createPaymentDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle payment with duplicate transaction ID', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: '123e4567-e89b-12d3-a456-426614174001',
        paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
        amount: 200.0,
        currency: 'VND',
        status: 'completed',
        transactionId: 'TXN123456', // Duplicate transaction ID
        paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
      };

      mockPaymentsService.create.mockRejectedValue(
        new InternalServerErrorException('Transaction ID already exists'),
      );

      await expect(
        controller.create(createPaymentDto, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle payment not found during operations', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.findOne.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        controller.findOne(paymentId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle payment already deleted during restore', async () => {
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockPaymentsService.restore.mockRejectedValue(
        new InternalServerErrorException('Payment is not deleted'),
      );

      await expect(
        controller.restore(paymentId, mockRequest as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('pagination and sorting', () => {
    it('should handle pagination parameters correctly', async () => {
      const filters = {
        page: 2,
        limit: 5,
        sort_by: 'amount',
        sort_order: 'ASC' as const,
      };

      const expectedResponse = {
        data: [mockPayment],
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };

      mockPaymentsService.findWithFilters.mockResolvedValue(expectedResponse);

      const result = await controller.findWithFilters(
        filters,
        mockRequest as any,
      );

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should handle default pagination when not specified', async () => {
      const filters = {};

      const expectedResponse = {
        data: [mockPayment],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockPaymentsService.findWithFilters.mockResolvedValue(expectedResponse);

      const result = await controller.findWithFilters(
        filters,
        mockRequest as any,
      );

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });
});
