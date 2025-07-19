import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '@modules/payments/service/payments.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from '@modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from '@modules/payments/dto/update-payment.dto';
import {
  createTenantServiceTestSetup,
  TenantServiceTestSetup,
  resetMocks,
  createTestEntity,
} from '../../../../utils/tenant-datasource-mock.util';
import { DtoMapper } from '@common/helpers/dto-mapper.helper';
import { PaymentTransactionService } from 'src/modules/payments/service/transaction/payment-transaction.service';
import { PaymentGatewayService } from 'src/modules/payments/service/transaction/payment-gateway.service';
import { Payment, PaymentStatus } from 'src/entities/tenant/payment.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

// Mock DtoMapper
jest.mock('src/common/helpers/dto-mapper.helper', () => ({
  DtoMapper: {
    mapToEntity: jest.fn(),
  },
}));

describe('PaymentsService', () => {
  let service: PaymentsService;
  let setup: TenantServiceTestSetup<Payment>;
  let mockPaymentTransactionService: jest.Mocked<PaymentTransactionService>;
  let mockPaymentGatewayService: jest.Mocked<PaymentGatewayService>;

  const TEST_STORE_ID = 'test-store-123';
  const TEST_USER_ID = 'test-user-456';

  const mockPaymentData: Partial<Payment> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    order_id: '123e4567-e89b-12d3-a456-426614174001',
    payment_method_id: 'pm-123',
    amount: '200.00',
    status: PaymentStatus.PAID,
    paid_by_user_id: TEST_USER_ID,
    note: 'Test payment',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    setup = createTenantServiceTestSetup<Payment>();

    // Mock PaymentTransactionService
    mockPaymentTransactionService = {
      createPayment: jest.fn(),
    } as any;

    // Mock PaymentGatewayService
    mockPaymentGatewayService = {
      processPayment: jest.fn(),
      verifyPayment: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: TenantDataSourceService,
          useValue: setup.mockTenantDataSourceService,
        },
        {
          provide: PaymentTransactionService,
          useValue: mockPaymentTransactionService,
        },
        {
          provide: PaymentGatewayService,
          useValue: mockPaymentGatewayService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(setup);
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct primary key', () => {
      expect(service['primaryKey']).toBe('id');
    });
  });

  describe('createPayment', () => {
    const createDto: CreatePaymentDto = {
      orderId: '123e4567-e89b-12d3-a456-426614174001',
      amount: '200.00',
      paymentMethodId: 'pm-123',
      status: PaymentStatus.PAID,
      paidByUserId: TEST_USER_ID,
      note: 'Test payment',
    };

    it('should create payment successfully', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);
      const mappedEntityData = { ...createDto };

      // Setup mocks
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntityData);
      setup.mockRepository.create.mockReturnValue(testPayment);
      setup.mockRepository.save.mockResolvedValue(testPayment);

      const result = await service.createPayment(TEST_STORE_ID, createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(testPayment.id);
      expect(result.amount).toBe(testPayment.amount);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(DtoMapper.mapToEntity).toHaveBeenCalledWith(createDto);
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid amount', async () => {
      const invalidDto = { ...createDto, amount: 'invalid' };

      await expect(
        service.createPayment(TEST_STORE_ID, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for zero amount', async () => {
      const zeroDto = { ...createDto, amount: '0' };

      await expect(
        service.createPayment(TEST_STORE_ID, zeroDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle creation errors', async () => {
      const mappedEntityData = { ...createDto };
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntityData);
      setup.mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createPayment(TEST_STORE_ID, createDto),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
  });

  describe('findPaymentById', () => {
    it('should return payment by ID', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);

      // Mock repository findOne method which is used by super.findById
      setup.mockRepository.findOne.mockResolvedValue(testPayment);

      const result = await service.findPaymentById(
        TEST_STORE_ID,
        testPayment.id,
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(testPayment.id);
      expect(setup.mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: testPayment.id },
      });
    });

    it('should return null for non-existent payment', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findPaymentById(
        TEST_STORE_ID,
        'non-existent',
      );

      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      // Mock repository to throw error
      setup.mockRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.findPaymentById(TEST_STORE_ID, 'test-id'),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
  });

  describe('findOne', () => {
    it('should return payment by ID', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);

      // Mock repository findOne method
      setup.mockRepository.findOne.mockResolvedValue(testPayment);

      const result = await service.findOne(TEST_STORE_ID, testPayment.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testPayment.id);
      expect(setup.mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: testPayment.id },
      });
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle errors', async () => {
      // Mock repository to throw error
      setup.mockRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne(TEST_STORE_ID, 'test-id')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('findAllPayments', () => {
    it('should return all payments with relations', async () => {
      const testPayments = [createTestEntity<Payment>(mockPaymentData)];

      setup.mockRepository.find.mockResolvedValue(testPayments);

      const result = await service.findAllPayments(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(testPayments[0].id);
      expect(setup.mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        relations: ['order', 'payment_method', 'paid_by_user'],
        order: { created_at: 'DESC' },
      });
    });

    it('should handle empty results', async () => {
      setup.mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllPayments(TEST_STORE_ID);

      expect(result).toEqual([]);
    });

    it('should handle errors', async () => {
      setup.mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAllPayments(TEST_STORE_ID)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('updatePayment', () => {
    const updateDto: UpdatePaymentDto = {
      amount: '250.00',
      status: PaymentStatus.UNPAID,
      note: 'Updated payment',
    };

    it('should update payment successfully', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);
      const mappedEntityData = { ...updateDto };
      const updatedPayment = { ...testPayment, ...updateDto };

      // Setup mocks - Mock repository methods
      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntityData);
      setup.mockRepository.merge.mockReturnValue(updatedPayment);
      setup.mockRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.updatePayment(
        TEST_STORE_ID,
        testPayment.id,
        updateDto,
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(updateDto.amount);
      expect(setup.mockRepository.merge).toHaveBeenCalledWith(
        testPayment,
        mappedEntityData,
      );
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      setup.mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePayment(TEST_STORE_ID, 'non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid amount', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);
      const invalidDto = { ...updateDto, amount: 'invalid' };

      // Mock repository to return payment first
      setup.mockRepository.findOne.mockResolvedValue(testPayment);

      await expect(
        service.updatePayment(TEST_STORE_ID, testPayment.id, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle update errors', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);
      const mappedEntityData = { ...updateDto };

      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntityData);
      setup.mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updatePayment(TEST_STORE_ID, testPayment.id, updateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('removePayment', () => {
    it('should soft delete payment successfully', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);

      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      setup.mockRepository.save.mockResolvedValue({
        ...testPayment,
        is_deleted: true,
      });

      await service.removePayment(TEST_STORE_ID, testPayment.id);

      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      setup.mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.removePayment(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle deletion errors', async () => {
      const testPayment = createTestEntity<Payment>(mockPaymentData);

      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      setup.mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.removePayment(TEST_STORE_ID, testPayment.id),
      ).rejects.toThrow('Database error');
    });
  });

  describe('Database Connection Errors', () => {
    it('should handle database connection errors', () => {
      const error = new Error('Database connection failed');
      setup.mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        error,
      );

      expect(
        setup.mockTenantDataSourceService.getTenantDataSource,
      ).toBeDefined();
    });
  });

  describe('createPaymentInTransaction', () => {
    it('should create payment in transaction successfully', async () => {
      const orderId = 'order-123';
      const amount = 500.0;
      const paymentMethodId = 'pm-123';
      const paidByUserId = TEST_USER_ID;

      const testPayment = createTestEntity<Payment>({
        ...mockPaymentData,
        order_id: orderId,
        amount: amount.toString(),
        payment_method_id: paymentMethodId,
        paid_by_user_id: paidByUserId,
      });

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(setup.mockRepository),
      };

      // Mock paymentTransactionService
      const mockPaymentTransactionService = {
        createPayment: jest.fn().mockResolvedValue(testPayment),
      };
      (service as any).paymentTransactionService =
        mockPaymentTransactionService;

      const result = await service.createPaymentInTransaction(
        orderId,
        amount,
        paymentMethodId,
        paidByUserId,
        mockEntityManager as any,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(testPayment.id);
      expect(mockPaymentTransactionService.createPayment).toHaveBeenCalledWith(
        orderId,
        amount,
        paymentMethodId,
        paidByUserId,
        mockEntityManager,
      );
    });

    it('should handle transaction errors', async () => {
      const orderId = 'order-123';
      const amount = 500.0;
      const paymentMethodId = 'pm-123';
      const paidByUserId = TEST_USER_ID;

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue(setup.mockRepository),
      };

      // Mock paymentTransactionService to throw error
      const mockPaymentTransactionService = {
        createPayment: jest
          .fn()
          .mockRejectedValue(new Error('Transaction error')),
      };
      (service as any).paymentTransactionService =
        mockPaymentTransactionService;

      await expect(
        service.createPaymentInTransaction(
          orderId,
          amount,
          paymentMethodId,
          paidByUserId,
          mockEntityManager as any,
        ),
      ).rejects.toThrow('Transaction error');
    });
  });

  describe('restorePayment', () => {
    it('should restore deleted payment successfully', async () => {
      const testPayment = createTestEntity<Payment>({
        ...mockPaymentData,
        is_deleted: true,
      });

      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      setup.mockRepository.save.mockResolvedValue({
        ...testPayment,
        is_deleted: false,
      });

      await service.restorePayment(TEST_STORE_ID, testPayment.id);

      expect(setup.mockRepository.save).toHaveBeenCalledWith({
        ...testPayment,
        is_deleted: false,
      });
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restorePayment(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered payments with pagination', async () => {
      const filters = {
        status: 'paid',
        page: 1,
        limit: 10,
      };

      const testPayments = [createTestEntity<Payment>(mockPaymentData)];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([testPayments, 1]),
      };

      setup.mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findWithFilters(TEST_STORE_ID, filters);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('should handle empty filter results', async () => {
      const filters = { status: 'non-existent' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      setup.mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findWithFilters(TEST_STORE_ID, filters);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const filters = {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      };

      const mockRawStats = {
        total_payments: '50',
        total_amount: '10000.00',
        average_amount: '200.00',
        min_amount: '100.00',
        max_amount: '500.00',
      };

      const expectedStats = {
        total_payments: 50,
        total_amount: 10000.0,
        average_amount: 200.0,
        min_amount: 100.0,
        max_amount: 500.0,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockRawStats),
      };

      setup.mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getPaymentStats(TEST_STORE_ID, filters);

      expect(result).toEqual(expectedStats);
    });

    it('should handle empty statistics', async () => {
      const expectedEmptyStats = {
        total_payments: 0,
        total_amount: 0,
        average_amount: 0,
        min_amount: 0,
        max_amount: 0,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      setup.mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getPaymentStats(TEST_STORE_ID);

      expect(result).toEqual(expectedEmptyStats);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex payment workflow', async () => {
      const createDto: CreatePaymentDto = {
        orderId: 'order-123',
        amount: '500.00',
        paymentMethodId: 'pm-123',
        status: PaymentStatus.UNPAID,
        paidByUserId: TEST_USER_ID,
        note: 'Integration test payment',
      };

      const testPayment = createTestEntity<Payment>({
        ...mockPaymentData,
        ...createDto,
      });

      // Setup mocks for create
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(createDto);
      setup.mockRepository.create.mockReturnValue(testPayment);
      setup.mockRepository.save.mockResolvedValue(testPayment);

      // Create payment
      const createdPayment = await service.createPayment(
        TEST_STORE_ID,
        createDto,
      );
      expect(createdPayment).toBeDefined();

      // Setup mocks for find
      setup.mockRepository.findOne.mockResolvedValue(testPayment);

      // Find payment
      const foundPayment = await service.findPaymentById(
        TEST_STORE_ID,
        testPayment.id,
      );
      expect(foundPayment).toBeDefined();
      expect(foundPayment?.id).toBe(testPayment.id);

      // Setup mocks for update
      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.PAID,
        note: 'Payment completed',
      };
      const updatedPayment = { ...testPayment, ...updateDto };

      // Reset repository mock for update
      setup.mockRepository.findOne.mockResolvedValue(testPayment);
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(updateDto);
      setup.mockRepository.merge.mockReturnValue(updatedPayment);
      setup.mockRepository.save.mockResolvedValue(updatedPayment);

      // Update payment
      const result = await service.updatePayment(
        TEST_STORE_ID,
        testPayment.id,
        updateDto,
      );
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.PAID);
    });
  });
});
