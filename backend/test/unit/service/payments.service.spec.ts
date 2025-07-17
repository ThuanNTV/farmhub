import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../../../src/modules/payments/service/payments.service';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { Payment } from '../../../src/entities/tenant/payment.entity';
import { CreatePaymentDto } from '../../../src/dto/dtoPayment/create-payment.dto';
import { UpdatePaymentDto } from '../../../src/dto/dtoPayment/update-payment.dto';
import { NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: jest.Mocked<any>;

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

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      })),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    // Setup default mocks
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };
    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource,
    );
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
      const storeId = 'store-123';

      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.create(storeId, createPaymentDto);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockPayment);
    });

    it('should handle creation errors', async () => {
      const storeId = 'store-123';

      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(storeId, createPaymentDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findById', () => {
    it('should return payment by ID', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockPayment);

      const result = await service.findById(storeId, paymentId);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: paymentId });
    });

    it('should return null for non-existent payment', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findById(storeId, paymentId);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return payment by ID', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockPayment);

      const result = await service.findOne(storeId, paymentId);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: paymentId });
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(storeId, paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all payments with relations', async () => {
      const storeId = 'store-123';
      const payments = [mockPayment];

      mockRepository.find.mockResolvedValue(payments);

      const result = await service.findAll(storeId);

      expect(result).toEqual(payments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['order', 'payment_method', 'paid_by_user'],
      });
    });

    it('should handle empty results', async () => {
      const storeId = 'store-123';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updatePaymentDto: UpdatePaymentDto = {
      amount: 250.0,
      status: 'pending',
      notes: 'Updated payment',
    };

    it('should update payment successfully', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockPayment);
      mockRepository.merge.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.update(storeId, paymentId, updatePaymentDto);

      expect(result).toEqual(mockPayment);
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockPayment,
        updatePaymentDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockPayment);
    });

    it('should throw error if payment not found', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(storeId, paymentId, updatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete payment successfully', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.remove(storeId, paymentId);

      expect(result).toEqual({
        message: `✅ Payment với ID "${paymentId}" đã được xóa mềm`,
        data: null,
      });
      expect(mockPayment.is_deleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPayment);
    });

    it('should throw error if payment not found', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(storeId, paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore payment successfully', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedPayment = { ...mockPayment, is_deleted: true };

      mockRepository.findOne.mockResolvedValue(deletedPayment);
      mockRepository.save.mockResolvedValue(deletedPayment);

      const result = await service.restore(storeId, paymentId);

      expect(result).toEqual({
        message: 'Khôi phục payment thành công',
        data: deletedPayment,
      });
      expect(deletedPayment.is_deleted).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith(deletedPayment);
    });

    it('should throw error if payment not found or not deleted', async () => {
      const storeId = 'store-123';
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(storeId, paymentId)).rejects.toThrow(
        'Payment không tồn tại hoặc chưa bị xóa mềm',
      );
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered payments with pagination', async () => {
      const storeId = 'store-123';
      const filters = {
        status: 'completed',
        min_amount: 100,
        max_amount: 500,
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC' as const,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPayment], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findWithFilters(storeId, filters);

      expect(result).toEqual({
        data: [mockPayment],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment.is_deleted = :is_deleted',
        { is_deleted: false },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.status = :status',
        { status: 'completed' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.amount >= :minAmount',
        { minAmount: 100 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.amount <= :maxAmount',
        { maxAmount: 500 },
      );
    });

    it('should handle empty filter results', async () => {
      const storeId = 'store-123';
      const filters = {
        status: 'non-existent',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findWithFilters(storeId, filters);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should apply all filters correctly', async () => {
      const storeId = 'store-123';
      const filters = {
        status: 'completed',
        payment_method_id: '123e4567-e89b-12d3-a456-426614174002',
        paid_by_user_id: '123e4567-e89b-12d3-a456-426614174003',
        order_id: '123e4567-e89b-12d3-a456-426614174001',
        min_amount: 100,
        max_amount: 500,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPayment], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findWithFilters(storeId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.status = :status',
        { status: 'completed' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.paymentMethodId = :paymentMethodId',
        { paymentMethodId: '123e4567-e89b-12d3-a456-426614174002' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.paidByUserId = :paidByUserId',
        { paidByUserId: '123e4567-e89b-12d3-a456-426614174003' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.orderId = :orderId',
        { orderId: '123e4567-e89b-12d3-a456-426614174001' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.amount >= :minAmount',
        { minAmount: 100 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.amount <= :maxAmount',
        { maxAmount: 500 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.createdAt >= :startDate',
        { startDate: new Date('2024-01-01') },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.createdAt <= :endDate',
        { endDate: new Date('2024-12-31') },
      );
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const storeId = 'store-123';
      const filters = {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        payment_method_id: '123e4567-e89b-12d3-a456-426614174002',
      };

      const mockStats = [
        {
          total_amount: 10000,
          total_count: 50,
          avg_amount: 200,
          payment_method_name: 'Credit Card',
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPaymentStats(storeId, filters);

      expect(result).toEqual(mockStats);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment.is_deleted = :is_deleted',
        { is_deleted: false },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.createdAt >= :startDate',
        { startDate: new Date('2024-01-01') },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'payment.createdAt <= :endDate',
        { endDate: new Date('2024-12-31') },
      );
    });

    it('should handle empty statistics', async () => {
      const storeId = 'store-123';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPaymentStats(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('pagination logic', () => {
    it('should calculate pagination correctly', async () => {
      const storeId = 'store-123';
      const filters = {
        page: 2,
        limit: 5,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPayment], 15]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findWithFilters(storeId, filters);

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  describe('sorting logic', () => {
    it('should apply default sorting when not specified', async () => {
      const storeId = 'store-123';
      const filters = {};

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPayment], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findWithFilters(storeId, filters);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'payment.created_at',
        'DESC',
      );
    });

    it('should apply custom sorting', async () => {
      const storeId = 'store-123';
      const filters = {
        sort_by: 'amount',
        sort_order: 'ASC' as const,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPayment], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findWithFilters(storeId, filters);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'payment.amount',
        'ASC',
      );
    });
  });
});
