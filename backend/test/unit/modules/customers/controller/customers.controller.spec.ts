import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from 'src/modules/customers/controller/customers.controller';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import { CreateCustomerDto } from 'src/modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from 'src/modules/customers/dto/update-customer.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from 'src/entities/tenant/customer.entity';

describe('CustomersController', () => {
  let controller: CustomersController;
  let mockCustomersService: jest.Mocked<CustomersService>;

  const mockCustomer: Customer = {
    customer_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Customer',
    phone: '0123456789',
    email: 'test@example.com',
    address: 'Test Address',
    birthday: new Date('1990-01-01'),
    gender: 'male',
    ref_code: undefined,
    created_by_user_id: '123e4567-e89b-12d3-a456-426614174001',
    updated_by_user_id: '123e4567-e89b-12d3-a456-426614174001',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    customer_type: '',
    orders: [],
  };

  const mockRequest: { user: { userId: string; storeId: string } } = {
    user: {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      storeId: 'store-123',
    },
  };

  beforeEach(async () => {
    mockCustomersService = {
      createCustomer: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      search: jest.fn(),
      filter: jest.fn(),
    } as any;

    // Simple approach: Direct controller instantiation
    controller = new CustomersController(mockCustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCustomerDto: CreateCustomerDto = {
      customerId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Customer',
      phone: '0123456789',
      email: 'test@example.com',
      address: 'Test Address',
    };

    it('should create a customer successfully', async () => {
      const expectedResponse = {
        message: 'Thêm mới thành công',
        data: mockCustomer,
      };

      mockCustomersService.createCustomer.mockResolvedValue(expectedResponse);

      const result = await controller.create(
        mockRequest.user.storeId,
        createCustomerDto,
        mockRequest as any,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.createCustomer).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        createCustomerDto,
      );
    });

    it('should handle service errors', async () => {
      mockCustomersService.createCustomer.mockRejectedValue(
        new InternalServerErrorException('Customer already exists'),
      );

      await expect(
        controller.create(
          mockRequest.user.storeId,
          createCustomerDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an error if email already exists', async () => {
      mockCustomersService.createCustomer.mockRejectedValue(
        new InternalServerErrorException('Email đã tồn tại!'),
      );

      await expect(
        controller.create(
          mockRequest.user.storeId,
          createCustomerDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockCustomersService.createCustomer).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        createCustomerDto,
      );
    });

    it('should throw an error if phone already exists', async () => {
      mockCustomersService.createCustomer.mockRejectedValue(
        new InternalServerErrorException('Số điện thoại đã tồn tại!'),
      );

      await expect(
        controller.create(
          mockRequest.user.storeId,
          createCustomerDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockCustomersService.createCustomer).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        createCustomerDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = [mockCustomer];
      mockCustomersService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll(mockRequest.user.storeId);

      expect(result).toEqual(customers);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith(
        mockRequest.user.storeId,
      );
    });

    it('should handle empty results', async () => {
      mockCustomersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest.user.storeId);

      expect(result).toEqual([]);
    });

    it('should call findAll with correct parameters', async () => {
      mockCustomersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest.user.storeId);

      expect(result).toEqual([]);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith(
        mockRequest.user.storeId,
      );
    });
  });

  describe('findOne', () => {
    it('should return customer by ID', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne(
        mockRequest.user.storeId,
        customerId,
      );

      expect(result).toEqual(mockCustomer);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
      );
    });

    it('should handle customer not found', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );

      await expect(
        controller.findOne(mockRequest.user.storeId, customerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call findOne with correct parameters', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne(
        mockRequest.user.storeId,
        customerId,
      );

      expect(result).toEqual(mockCustomer);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
      );
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      name: 'Updated Customer',
    };

    it('should update customer successfully', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Cập nhật thành công',
        data: mockCustomer,
      };
      mockCustomersService.update.mockResolvedValue({
        message: 'Cập nhật thành công',
        data: mockCustomer,
      });
      const result = await controller.update(
        mockRequest.user.storeId,
        customerId,
        updateCustomerDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.update).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
        updateCustomerDto,
      );
    });

    it('should handle birthday string conversion', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDtoWithBirthday: UpdateCustomerDto = {
        name: 'Updated Customer',
        birthday: '1990-01-01' as any, // string birthday
      };
      const expectedResponse = {
        message: 'Cập nhật thành công',
        data: mockCustomer,
      };

      mockCustomersService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        mockRequest.user.storeId,
        customerId,
        updateDtoWithBirthday,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.update).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
        expect.objectContaining({
          name: 'Updated Customer',
          birthday: '1990-01-01', // Should be converted to yyyy-mm-dd format
        }),
      );
    });

    it('should handle invalid birthday string', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDtoWithInvalidBirthday: UpdateCustomerDto = {
        name: 'Updated Customer',
        birthday: 'invalid-date' as any,
      };
      const expectedResponse = {
        message: 'Cập nhật thành công',
        data: mockCustomer,
      };

      mockCustomersService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        mockRequest.user.storeId,
        customerId,
        updateDtoWithInvalidBirthday,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.update).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
        expect.objectContaining({
          name: 'Updated Customer',
          birthday: 'invalid-date', // Should remain unchanged for invalid dates
        }),
      );
    });

    it('should handle update errors', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.update.mockRejectedValue(
        new InternalServerErrorException('Phone already exists'),
      );

      await expect(
        controller.update(
          mockRequest.user.storeId,
          customerId,
          updateCustomerDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove customer successfully', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Xóa thành công',
        data: null,
      };
      mockCustomersService.remove.mockResolvedValue(expectedResponse);
      const result = await controller.remove(
        mockRequest.user.storeId,
        customerId,
      );
      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.remove).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
      );
    });

    it('should handle remove errors', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.remove.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );
      await expect(
        controller.remove(mockRequest.user.storeId, customerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore customer successfully', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Khôi phục thành công',
        data: mockCustomer,
      };
      mockCustomersService.restore.mockResolvedValue(expectedResponse);
      const result = await controller.restore(
        mockRequest.user.storeId,
        customerId,
      );
      expect(result).toEqual(expectedResponse);
      expect(mockCustomersService.restore).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        customerId,
      );
    });

    it('should handle restore errors', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      mockCustomersService.restore.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );
      await expect(
        controller.restore(mockRequest.user.storeId, customerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search customers by keyword', async () => {
      const keyword = 'test';
      const customers = [mockCustomer];
      mockCustomersService.search.mockResolvedValue(customers);
      const result = await controller.search(mockRequest.user.storeId, keyword);
      expect(result).toEqual(customers);
      expect(mockCustomersService.search).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        keyword,
      );
    });

    it('should handle empty search results', async () => {
      const keyword = 'nonexistent';
      mockCustomersService.search.mockResolvedValue([]);
      const result = await controller.search(mockRequest.user.storeId, keyword);
      expect(result).toEqual([]);
    });
  });

  describe('filter', () => {
    it('should filter customers by criteria', async () => {
      const filter = { search: 'male' };
      const customers = [mockCustomer];
      mockCustomersService.filter.mockResolvedValue(customers);
      const result = await controller.filter(mockRequest.user.storeId, filter);
      expect(result).toEqual(customers);
      expect(mockCustomersService.filter).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        filter,
      );
    });

    it('should handle empty filter results', async () => {
      const filter = { search: 'female' };
      mockCustomersService.filter.mockResolvedValue([]);
      const result = await controller.filter(mockRequest.user.storeId, filter);
      expect(result).toEqual([]);
    });
  });

  describe('storeId validation', () => {
    it('should throw BadRequestException for empty storeId', () => {
      expect(() => controller.findAll('')).toThrow(
        'Thiếu hoặc sai định dạng storeId',
      );
    });

    it('should throw BadRequestException for whitespace storeId', () => {
      expect(() => controller.findAll('   ')).toThrow(
        'Thiếu hoặc sai định dạng storeId',
      );
    });

    it('should throw BadRequestException for null storeId', () => {
      expect(() => controller.findAll(null as any)).toThrow(
        'Thiếu hoặc sai định dạng storeId',
      );
    });

    it('should throw BadRequestException for undefined storeId', () => {
      expect(() => controller.findAll(undefined as any)).toThrow(
        'Thiếu hoặc sai định dạng storeId',
      );
    });

    it('should throw BadRequestException for non-string storeId', () => {
      expect(() => controller.findAll(123 as any)).toThrow(
        'Thiếu hoặc sai định dạng storeId',
      );
    });
  });

  describe('parameter validation', () => {
    it('should handle invalid customer ID format', async () => {
      const invalidId = 'invalid-id';
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );

      await expect(
        controller.findOne(mockRequest.user.storeId, invalidId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle empty customer ID', async () => {
      const emptyId = '';
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );

      await expect(
        controller.findOne(mockRequest.user.storeId, emptyId),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('DTO validation', () => {
    it('should handle invalid create customer DTO', async () => {
      const invalidDto = {
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        // missing required fields
      } as CreateCustomerDto;

      mockCustomersService.createCustomer.mockRejectedValue(
        new InternalServerErrorException('Validation failed'),
      );

      await expect(
        controller.create(
          mockRequest.user.storeId,
          invalidDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
    it('should handle invalid update customer DTO', async () => {
      const invalidDto = {
        email: 'invalid-email-format',
      } as UpdateCustomerDto;

      mockCustomersService.update.mockRejectedValue(
        new InternalServerErrorException('Invalid email format'),
      );

      await expect(
        controller.update(
          mockRequest.user.storeId,
          '123e4567-e89b-12d3-a456-426614174000',
          invalidDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('edge cases', () => {
    it('should handle search with special characters', async () => {
      const specialKeyword = '@#$%^&*()';
      mockCustomersService.search.mockResolvedValue([]);

      const result = await controller.search(
        mockRequest.user.storeId,
        specialKeyword,
      );

      expect(result).toEqual([]);
      expect(mockCustomersService.search).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        specialKeyword,
      );
    });

    it('should handle filter with empty object', async () => {
      const emptyFilter = {};
      mockCustomersService.filter.mockResolvedValue([mockCustomer]);

      const result = await controller.filter(
        mockRequest.user.storeId,
        emptyFilter,
      );

      expect(result).toEqual([mockCustomer]);
      expect(mockCustomersService.filter).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        emptyFilter,
      );
    });

    it('should handle filter with complex criteria', async () => {
      const complexFilter = {
        search: 'test',
        gender: 'male',
        isActive: true,
        dateRange: {
          from: '2023-01-01',
          to: '2023-12-31',
        },
      };
      mockCustomersService.filter.mockResolvedValue([mockCustomer]);

      const result = await controller.filter(
        mockRequest.user.storeId,
        complexFilter,
      );

      expect(result).toEqual([mockCustomer]);
      expect(mockCustomersService.filter).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        complexFilter,
      );
    });

    it('should handle very long customer names in search', async () => {
      const longName = 'a'.repeat(1000);
      mockCustomersService.search.mockResolvedValue([]);

      const result = await controller.search(
        mockRequest.user.storeId,
        longName,
      );

      expect(result).toEqual([]);
      expect(mockCustomersService.search).toHaveBeenCalledWith(
        mockRequest.user.storeId,
        longName,
      );
    });
  });
});
