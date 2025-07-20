import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import {
  CreateCustomerDto,
  CustomerType,
} from 'src/modules/customers/dto/create-customer.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Customer } from 'src/entities/tenant/customer.entity';

describe('CustomersService - Validation Tests Final', () => {
  let service: CustomersService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockCustomerRepository: jest.Mocked<any>;
  let mockUserRepository: jest.Mocked<any>;

  const storeId = 'store-123';
  const validCreateDto: CreateCustomerDto = {
    customerId: 'CUST001',
    name: 'Test Customer',
    phone: '0123456789',
    email: 'test@example.com',
    address: 'Test Address',
    taxCode: 'TAX123',
    customerType: CustomerType.RETAIL,
    gender: 'male',
    birthday: '1990-01-01',
    refCode: 'REF001',
    note: 'Test note',
    creditLimit: 1000.0,
    totalDebt: 0.0,
    status: 'active',
    isActive: true,
    isDeleted: false,
    createdByUserId: 'user-001',
    updatedByUserId: 'user-002',
  };

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
    ref_code: 'REF001',
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
    created_by_user_id: 'user-001',
    updated_by_user_id: 'user-002',
    orders: [],
  };

  const mockRefCustomer = {
    customer_id: 'REF001',
    name: 'Ref Customer',
    is_deleted: false,
  };

  const mockUser = {
    userId: 'user-001',
    user_name: 'testuser',
    email: 'test@example.com',
    is_deleted: false,
  };

  beforeEach(async () => {
    mockCustomerRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
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
        return mockCustomerRepository;
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

  describe('RefCode Validation', () => {
    it('should successfully create customer with valid refCode', async () => {
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(mockRefCustomer); // Valid refCode
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, validCreateDto);

      expect(result.message).toBe('Thêm mới thành công');
      expect(result.data).toEqual(mockCustomer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { customer_id: 'REF001', is_deleted: false },
      });
    });

    it('should throw error when refCode does not exist', async () => {
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(null); // RefCode doesn't exist

      await expect(
        service.createCustomer(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException('❌ refCode "REF001" không tồn tại!'),
      );

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { customer_id: 'REF001', is_deleted: false },
      });
    });

    it('should successfully create customer without refCode', async () => {
      const dtoWithoutRefCode = { ...validCreateDto };
      delete dtoWithoutRefCode.refCode;

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null); // No existing email
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithoutRefCode);

      expect(result.message).toBe('Thêm mới thành công');
      // Should not call refCode validation
      expect(mockCustomerRepository.findOne).toHaveBeenCalledTimes(2); // Only phone and email checks
    });
  });

  describe('UserId Validation', () => {
    it('should successfully create customer with valid createdByUserId', async () => {
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(mockRefCustomer); // Valid refCode
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // Valid createdByUserId
        .mockResolvedValueOnce(mockUser); // Valid updatedByUserId
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, validCreateDto);

      expect(result.message).toBe('Thêm mới thành công');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-001', is_deleted: false },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-002', is_deleted: false },
      });
    });

    it('should throw error when createdByUserId does not exist', async () => {
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(mockRefCustomer); // Valid refCode
      mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist

      await expect(
        service.createCustomer(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ createdByUserId "user-001" không tồn tại!',
        ),
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-001', is_deleted: false },
      });
    });

    it('should successfully create customer without userIds', async () => {
      const dtoWithoutUserIds = { ...validCreateDto };
      delete dtoWithoutUserIds.createdByUserId;
      delete dtoWithoutUserIds.updatedByUserId;

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(mockRefCustomer); // Valid refCode
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithoutUserIds);

      expect(result.message).toBe('Thêm mới thành công');
      // Should not call user validation
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('Phone Format Validation', () => {
    it('should throw error for invalid phone - contains letters', async () => {
      const dtoWithInvalidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: 'abc123',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should throw error for invalid phone - too short', async () => {
      const dtoWithInvalidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '123456789', // 9 digits
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should throw error for invalid phone - too long', async () => {
      const dtoWithInvalidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '123456789012345678901', // 21 digits
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should successfully create customer with valid phone', async () => {
      const dtoWithValidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '0123456789', // 10 digits - valid
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithValidPhone);

      expect(result.message).toBe('Thêm mới thành công');
    });
  });

  describe('Email Format Validation', () => {
    it('should throw error for invalid email - no @ symbol', async () => {
      const dtoWithInvalidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'invalid-email',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidEmail),
      ).rejects.toThrow(
        new InternalServerErrorException('Email không hợp lệ!'),
      );
    });

    it('should throw error for invalid email - no domain', async () => {
      const dtoWithInvalidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'test@',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidEmail),
      ).rejects.toThrow(
        new InternalServerErrorException('Email không hợp lệ!'),
      );
    });

    it('should successfully create customer with valid email', async () => {
      const dtoWithValidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'test@example.com',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithValidEmail);

      expect(result.message).toBe('Thêm mới thành công');
    });
  });

  describe('Birthday Format Validation', () => {
    it('should throw error for invalid birthday - invalid text', async () => {
      const dtoWithInvalidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: 'invalid-date',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidBirthday),
      ).rejects.toThrow(
        new InternalServerErrorException('Ngày sinh không hợp lệ!'),
      );
    });

    it('should throw error for invalid birthday - invalid month', async () => {
      const dtoWithInvalidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: '1990-13-01', // Month 13 doesn't exist
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidBirthday),
      ).rejects.toThrow(
        new InternalServerErrorException('Ngày sinh không hợp lệ!'),
      );
    });

    it('should successfully create customer with valid birthday', async () => {
      const dtoWithValidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: '1990-01-01',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(
        storeId,
        dtoWithValidBirthday,
      );

      expect(result.message).toBe('Thêm mới thành công');
    });
  });

  describe('Combined Validation Scenarios', () => {
    it('should handle multiple validation errors in sequence', async () => {
      // Test that validation stops at first error
      const dtoWithMultipleErrors = {
        ...validCreateDto,
        phone: 'invalid-phone',
        email: 'invalid-email',
        birthday: 'invalid-date',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne
        .mockResolvedValueOnce(null) // No existing phone
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce(mockRefCustomer); // Valid refCode
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Should fail on phone validation first
      await expect(
        service.createCustomer(storeId, dtoWithMultipleErrors),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should successfully create customer with minimal valid data', async () => {
      const minimalDto = {
        customerId: 'CUST002',
        name: 'Minimal Customer',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, minimalDto);

      expect(result.message).toBe('Thêm mới thành công');
      // Should not call any validation for optional fields
      expect(mockCustomerRepository.findOne).not.toHaveBeenCalled();
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('should handle database errors during validation', async () => {
      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.createCustomer(storeId, validCreateDto),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('should handle empty string phone as valid (no phone)', async () => {
      const dtoWithEmptyPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '', // Empty string is treated as no phone
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithEmptyPhone);

      expect(result.message).toBe('Thêm mới thành công');
    });

    it('should handle empty string email as valid (no email)', async () => {
      const dtoWithEmptyEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: '', // Empty string is treated as no email
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(storeId, dtoWithEmptyEmail);

      expect(result.message).toBe('Thêm mới thành công');
    });

    it('should handle empty string birthday as valid (no birthday)', async () => {
      const dtoWithEmptyBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: '', // Empty string is treated as no birthday
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(
        storeId,
        dtoWithEmptyBirthday,
      );

      expect(result.message).toBe('Thêm mới thành công');
    });

    it('should handle phone with special characters', async () => {
      const dtoWithSpecialPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '012-345-6789',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithSpecialPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should handle email with spaces', async () => {
      const dtoWithSpaceEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'test @example.com',
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithSpaceEmail),
      ).rejects.toThrow(
        new InternalServerErrorException('Email không hợp lệ!'),
      );
    });
  });
});
