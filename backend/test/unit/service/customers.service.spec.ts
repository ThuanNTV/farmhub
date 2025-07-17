import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from '../../../src/modules/customers/service/customers.service';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { Customer } from '../../../src/entities/tenant/customer.entity';
import { CustomerType } from '../../../src/modules/customers/dto/create-customer.dto';
import { CreateCustomerDto } from '../../../src/modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/modules/customers/dto/update-customer.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: jest.Mocked<any>;
  let mockUserRepository: jest.Mocked<any>;

  const mockCustomer: Customer = {
    customer_id: 'CUST001',
    name: 'Test Customer',
    phone: '0123456789',
    email: 'test@example.com',
    address: 'Test Address',
    tax_code: 'TAX123',
    customer_type: CustomerType.RETAIL,
    gender: 'male',
    birthday: new Date('1990-01-01'),
    ref_code: undefined,
    note: 'Test note',
    credit_limit: 1000.0,
    total_debt: 0.0,
    debt_due_date: undefined,
    last_purchase_date: undefined,
    status: 'active',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by_user_id: '123e4567-e89b-12d3-a456-426614174000',
    updated_by_user_id: '123e4567-e89b-12d3-a456-426614174000',
    orders: [],
  };

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    user_name: 'testuser',
    email: 'test@example.com',
    is_deleted: false,
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
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);

    // Setup default mocks
    const mockDataSource = {
      getRepository: jest.fn().mockImplementation((entityName: string) => {
        if (entityName === 'User') {
          return mockUserRepository;
        }
        return mockRepository;
      }),
      isInitialized: true,
    } as any;
    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    const createCustomerDto: CreateCustomerDto = {
      customerId: 'CUST001',
      name: 'Test Customer',
      phone: '0123456789',
      email: 'test@example.com',
      address: 'Test Address',
      taxCode: 'TAX123',
      customerType: CustomerType.RETAIL,
      gender: 'male',
      birthday: '1990-01-01',
      refCode: undefined,
      note: 'Test note',
      creditLimit: 1000.0,
      totalDebt: 0.0,
      debtDueDate: undefined,
      lastPurchaseDate: undefined,
      status: 'active',
      isActive: true,
      isDeleted: false,
      createdByUserId: '123e4567-e89b-12d3-a456-426614174000',
      updatedByUserId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should create a customer successfully', async () => {
      const storeId = 'store-123';

      // Mock findById to return null (customer doesn't exist)
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      // Mock repository methods
      mockRepository.create.mockReturnValue(mockCustomer);
      mockRepository.save.mockResolvedValue(mockCustomer);
      mockRepository.findOne.mockResolvedValue(null); // No existing phone/email
      mockUserRepository.findOne.mockResolvedValue(mockUser); // User exists

      const result = await service.createCustomer(storeId, createCustomerDto);

      expect(result).toEqual({
        message: 'Thêm mới thành công',
        data: mockCustomer,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createCustomerDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw error if customer with same ID already exists', async () => {
      const storeId = 'store-123';

      jest.spyOn(service as any, 'findById').mockResolvedValue(mockCustomer);

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if phone already exists', async () => {
      const storeId = 'store-123';

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockCustomer); // Phone exists

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if email already exists', async () => {
      const storeId = 'store-123';

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockRepository.findOne
        .mockResolvedValueOnce(null) // Phone doesn't exist
        .mockResolvedValueOnce(mockCustomer); // Email exists

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if refCode customer does not exist', async () => {
      const storeId = 'store-123';
      const dtoWithRefCode = { ...createCustomerDto, refCode: 'NONEXISTENT' };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null); // No existing phone/email/refCode

      await expect(
        service.createCustomer(storeId, dtoWithRefCode),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if createdByUserId user does not exist', async () => {
      const storeId = 'store-123';

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null); // No existing phone/email
      mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all active customers', async () => {
      const storeId = 'store-123';
      const customers = [mockCustomer];

      mockRepository.find.mockResolvedValue(customers);

      const result = await service.findAll(storeId);

      expect(result).toEqual(customers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false, is_active: true },
      });
    });

    it('should return empty array when no customers exist', async () => {
      const storeId = 'store-123';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return customer by ID', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';

      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne(storeId, customerId);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        customer_id: customerId,
        is_deleted: false,
        is_active: true,
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      const storeId = 'store-123';
      const customerId = 'NONEXISTENT';

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(storeId, customerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update customer successfully', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'Updated Customer Name',
        phone: '0987654321',
      };

      const updatedCustomer = {
        ...mockCustomer,
        name: 'Updated Customer Name',
        phone: '0987654321',
      };

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockResolvedValue(mockCustomer);
      mockRepository.findOne.mockResolvedValue(null); // No existing phone/email
      mockRepository.merge.mockReturnValue(updatedCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(
        storeId,
        customerId,
        updateCustomerDto,
      );

      expect(result.data).toEqual(updatedCustomer);
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        updateCustomerDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(updatedCustomer);
    });

    it('should throw error if phone already exists for different customer', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';
      const updateCustomerDto: UpdateCustomerDto = {
        phone: '0987654321',
      };

      const existingCustomer = { ...mockCustomer, customer_id: 'DIFFERENT_ID' };

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockResolvedValue(mockCustomer);
      mockRepository.findOne.mockResolvedValue(existingCustomer); // Phone exists for different customer

      await expect(
        service.update(storeId, customerId, updateCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should soft delete customer successfully', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockResolvedValue(mockCustomer);
      mockRepository.save.mockResolvedValue({
        ...mockCustomer,
        is_deleted: true,
      });

      const result = await service.remove(storeId, customerId);

      expect(result).toEqual({
        message: `✅ Khách hàng với ID "${customerId}" đã được xóa`,
        data: null,
      });
      expect(mockCustomer.is_deleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      const storeId = 'store-123';
      const customerId = 'NONEXISTENT';

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockRejectedValue(
          new NotFoundException(
            `❌ Không tìm thấy khách hàng với ID "${customerId}"`,
          ),
        );

      await expect(service.remove(storeId, customerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should search customers by keyword', async () => {
      const storeId = 'store-123';
      const keyword = 'test';
      const customers = [mockCustomer];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(customers),
      };
      mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.search(storeId, keyword);

      expect(result).toEqual(customers);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'customer.storeId = :storeId',
        { storeId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.isDeleted = :isDeleted',
        { isDeleted: false },
      );
    });
  });

  describe('filter', () => {
    it('should filter customers by criteria', async () => {
      const storeId = 'store-123';
      const filter = { type: 'retail', status: 'active' };
      const customers = [mockCustomer];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(customers),
      };
      mockRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.filter(storeId, filter);

      expect(result).toEqual(customers);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'customer.isDeleted = :isDeleted',
        { isDeleted: false },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.isActive = :isActive',
        { isActive: true },
      );
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      const storeId = 'store-123';
      mockRepository.findOneBy.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne(storeId, 'test-id')).rejects.toThrow();
    });

    it('should handle repository save errors', async () => {
      const storeId = 'store-123';
      mockRepository.findOneBy.mockResolvedValue(mockCustomer);
      mockRepository.save.mockRejectedValue(new Error('Save operation failed'));

      await expect(service.remove(storeId, 'test-id')).rejects.toThrow();
    });
  });

  describe('validation scenarios', () => {
    it('should handle invalid phone format', async () => {
      const storeId = 'store-123';
      const createCustomerDto: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: 'invalid-phone',
        email: 'test@example.com',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid email format', async () => {
      const storeId = 'store-123';
      const createCustomerDto: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '0123456789',
        email: 'invalid-email',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid birthday format', async () => {
      const storeId = 'store-123';
      const createCustomerDto: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '0123456789',
        email: 'test@example.com',
        birthday: 'invalid-date',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, createCustomerDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('customer management scenarios', () => {
    it('should handle customer type changes', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';
      const updateDto: UpdateCustomerDto = {
        customerType: CustomerType.VIP,
      };

      const updatedCustomer = {
        ...mockCustomer,
        customer_type: CustomerType.VIP,
      };

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockResolvedValue(mockCustomer);
      mockRepository.merge.mockReturnValue(updatedCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(storeId, customerId, updateDto);

      expect(result.data.customer_type).toBe(CustomerType.VIP);
    });

    it('should handle credit limit updates', async () => {
      const storeId = 'store-123';
      const customerId = 'CUST001';
      const updateDto: UpdateCustomerDto = {
        creditLimit: 5000.0,
        totalDebt: 1000.0,
      };

      const updatedCustomer = {
        ...mockCustomer,
        credit_limit: 5000.0,
        total_debt: 1000.0,
      };

      jest
        .spyOn(service as any, 'findByIdOrFail')
        .mockResolvedValue(mockCustomer);
      mockRepository.merge.mockReturnValue(updatedCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(storeId, customerId, updateDto);

      expect(result.data.credit_limit).toBe(5000.0);
      expect(result.data.total_debt).toBe(1000.0);
    });
  });
});
