import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import {
  CreateCustomerDto,
  CustomerType,
} from 'src/modules/customers/dto/create-customer.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

describe('CustomersService - Debug Validation', () => {
  let service: CustomersService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockCustomerRepository: jest.Mocked<any>;

  const storeId = 'store-123';

  beforeEach(async () => {
    mockCustomerRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
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
      getRepository: jest.fn().mockReturnValue(mockCustomerRepository),
      isInitialized: true,
    } as any;

    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Validation Debug', () => {
    it('should throw error for invalid phone - simple test', async () => {
      const dtoWithInvalidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: 'abc123', // Invalid phone
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should throw error for short phone', async () => {
      const dtoWithShortPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '123456789', // 9 digits - too short
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithShortPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should throw error for long phone', async () => {
      const dtoWithLongPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '123456789012345678901', // 21 digits - too long
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithLongPhone),
      ).rejects.toThrow(
        new InternalServerErrorException('Số điện thoại không hợp lệ!'),
      );
    });

    it('should pass with valid phone', async () => {
      const dtoWithValidPhone: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        phone: '0123456789', // 10 digits - valid
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue({});
      mockCustomerRepository.save.mockResolvedValue({});

      const result = await service.createCustomer(storeId, dtoWithValidPhone);

      expect(result.message).toBe('Thêm mới thành công');
    });
  });

  describe('Email Validation Debug', () => {
    it('should throw error for invalid email - simple test', async () => {
      const dtoWithInvalidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'invalid-email', // No @ symbol
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidEmail),
      ).rejects.toThrow(
        new InternalServerErrorException('Email không hợp lệ!'),
      );
    });

    it('should throw error for email without domain', async () => {
      const dtoWithInvalidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'test@', // No domain
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidEmail),
      ).rejects.toThrow(
        new InternalServerErrorException('Email không hợp lệ!'),
      );
    });

    it('should pass with valid email', async () => {
      const dtoWithValidEmail: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        email: 'test@example.com', // Valid email
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue({});
      mockCustomerRepository.save.mockResolvedValue({});

      const result = await service.createCustomer(storeId, dtoWithValidEmail);

      expect(result.message).toBe('Thêm mới thành công');
    });
  });

  describe('Birthday Validation Debug', () => {
    it('should throw error for invalid birthday - simple test', async () => {
      const dtoWithInvalidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: 'invalid-date', // Invalid date
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidBirthday),
      ).rejects.toThrow(
        new InternalServerErrorException('Ngày sinh không hợp lệ!'),
      );
    });

    it('should throw error for invalid date format', async () => {
      const dtoWithInvalidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: '1990/01/01', // Wrong format
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);

      await expect(
        service.createCustomer(storeId, dtoWithInvalidBirthday),
      ).rejects.toThrow(
        new InternalServerErrorException('Ngày sinh không hợp lệ!'),
      );
    });

    it('should pass with valid birthday', async () => {
      const dtoWithValidBirthday: CreateCustomerDto = {
        customerId: 'CUST001',
        name: 'Test Customer',
        birthday: '1990-01-01', // Valid date
      };

      jest.spyOn(service as any, 'findById').mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue({});
      mockCustomerRepository.save.mockResolvedValue({});

      const result = await service.createCustomer(
        storeId,
        dtoWithValidBirthday,
      );

      expect(result.message).toBe('Thêm mới thành công');
    });
  });
});
