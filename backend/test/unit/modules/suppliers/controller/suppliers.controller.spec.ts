import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from '@modules/suppliers/controller/suppliers.controller';
import { SuppliersService } from '@modules/suppliers/service/suppliers.service';
import { CreateSupplierDto } from '@modules/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@modules/suppliers/dto/update-supplier.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';
import { PermissionGuard } from '@core/rbac/permission/permission.guard';
import { AuditInterceptor } from '@common/auth/audit.interceptor';

// Mock decorators
jest.mock('@core/rbac/permission/permissions.decorator', () => ({
  RequirePermissions: () => () => {},
}));

jest.mock('@common/decorator/rate-limit.decorator', () => ({
  RateLimitAPI: () => () => {},
}));

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: jest.Mocked<SuppliersService>;
  let module: TestingModule;

  // Mock data
  const mockSupplierEntity = {
    id: 'supplier-123',
    name: 'ABC Company',
    phone: '0123456789',
    email: 'contact@abc.com',
    address: '123 Main St',
    tax_code: 'TAX123456',
    contact_person: 'John Doe',
    note: 'Reliable supplier',
    is_deleted: false,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    deleted_at: undefined,
    created_by_user_id: 'user-123',
    updated_by_user_id: 'user-123',
  };

  const mockCreateDto: CreateSupplierDto = {
    name: 'ABC Company',
    phone: '0123456789',
    email: 'contact@abc.com',
    address: '123 Main St',
    taxCode: 'TAX123456',
    contactPerson: 'John Doe',
    note: 'Reliable supplier',
  };

  const mockUpdateDto: UpdateSupplierDto = {
    name: 'Updated ABC Company',
    phone: '0987654321',
    email: 'updated@abc.com',
  };

  const storeId = 'store-123';
  const supplierId = 'supplier-123';

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    };

    // Create mock guard
    const mockGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })

      .compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<jest.Mocked<SuppliersService>>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a supplier successfully', async () => {
      service.create.mockResolvedValue(mockSupplierEntity);

      const result = await controller.create(storeId, mockCreateDto);

      expect(result).toEqual(mockSupplierEntity);
      expect(service.create).toHaveBeenCalledWith(storeId, mockCreateDto);
    });

    it('should handle creation errors', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid supplier data'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle duplicate supplier name', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Supplier name already exists'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const mockSuppliers = [mockSupplierEntity];
      service.findAll.mockResolvedValue(mockSuppliers);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(mockSuppliers);
      expect(service.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty results', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return supplier by ID', async () => {
      service.findOne.mockResolvedValue(mockSupplierEntity);

      const result = await controller.findById(storeId, supplierId);

      expect(result).toEqual(mockSupplierEntity);
      expect(service.findOne).toHaveBeenCalledWith(storeId, supplierId);
    });

    it('should handle supplier not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Supplier with ID "supplier-123" not found'),
      );

      await expect(controller.findById(storeId, supplierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update supplier successfully', async () => {
      const updatedSupplier = { ...mockSupplierEntity, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedSupplier);

      const result = await controller.update(
        storeId,
        supplierId,
        mockUpdateDto,
      );

      expect(result).toEqual(updatedSupplier);
      expect(service.update).toHaveBeenCalledWith(
        storeId,
        supplierId,
        mockUpdateDto,
      );
    });

    it('should handle update validation errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Invalid update data'),
      );

      await expect(
        controller.update(storeId, supplierId, mockUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle supplier not found during update', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Supplier with ID "supplier-123" not found'),
      );

      await expect(
        controller.update(storeId, supplierId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove supplier successfully', async () => {
      const removeResponse = {
        message: '✅ Supplier với ID "supplier-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);

      const result = await controller.remove(storeId, supplierId);

      expect(result).toEqual(removeResponse);
      expect(service.remove).toHaveBeenCalledWith(storeId, supplierId);
    });

    it('should handle remove errors', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Supplier with ID "supplier-123" not found'),
      );

      await expect(controller.remove(storeId, supplierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore supplier successfully', async () => {
      const restoreResponse = {
        message: 'Khôi phục supplier thành công',
        data: mockSupplierEntity,
      };
      service.restore.mockResolvedValue(restoreResponse);

      const result = await controller.restore(storeId, supplierId);

      expect(result).toEqual(restoreResponse);
      expect(service.restore).toHaveBeenCalledWith(storeId, supplierId);
    });

    it('should handle restore errors', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException('Supplier not found or not deleted'),
      );

      await expect(controller.restore(storeId, supplierId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('business logic validation', () => {
    it('should handle empty supplier name', async () => {
      const invalidDto = {
        ...mockCreateDto,
        name: '',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Supplier name cannot be empty'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid email format', async () => {
      const invalidDto = {
        ...mockCreateDto,
        email: 'invalid-email',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Invalid email format'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid phone format', async () => {
      const invalidDto = {
        ...mockCreateDto,
        phone: '123',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Invalid phone number format'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle very long supplier name', async () => {
      const longNameDto = {
        ...mockCreateDto,
        name: 'A'.repeat(256), // Very long name
      };

      service.create.mockRejectedValue(
        new BadRequestException('Supplier name is too long'),
      );

      await expect(controller.create(storeId, longNameDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle supplier with special characters', async () => {
      const specialDto = {
        ...mockCreateDto,
        name: 'Công ty TNHH ABC - Chi nhánh Hà Nội',
        contactPerson: 'Nguyễn Văn A',
      };

      const specialEntity = {
        ...mockSupplierEntity,
        name: 'Công ty TNHH ABC - Chi nhánh Hà Nội',
        contact_person: 'Nguyễn Văn A',
      };
      service.create.mockResolvedValue(specialEntity);

      const result = await controller.create(storeId, specialDto);

      expect(result.name).toBe('Công ty TNHH ABC - Chi nhánh Hà Nội');
      expect(result.contact_person).toBe('Nguyễn Văn A');
      expect(service.create).toHaveBeenCalledWith(storeId, specialDto);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed store ID', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid store ID format'),
      );

      await expect(
        controller.create('invalid-store-id', mockCreateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle malformed supplier ID', async () => {
      service.findOne.mockRejectedValue(
        new BadRequestException('Invalid supplier ID format'),
      );

      await expect(controller.findById(storeId, 'invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service unavailable', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Service temporarily unavailable'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle concurrent updates', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Supplier was modified by another user'),
      );

      await expect(
        controller.update(storeId, supplierId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle undefined optional fields', async () => {
      const undefinedFieldsDto = {
        name: 'Test Supplier',
        phone: undefined,
        email: undefined,
        address: undefined,
        taxCode: undefined,
        contactPerson: undefined,
        note: undefined,
      };

      const supplierWithUndefinedFields = {
        ...mockSupplierEntity,
        phone: undefined,
        email: undefined,
        address: undefined,
        tax_code: undefined,
        contact_person: undefined,
        note: undefined,
      };
      service.create.mockResolvedValue(supplierWithUndefinedFields);

      const result = await controller.create(storeId, undefinedFieldsDto);

      expect(result.phone).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.address).toBeUndefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete supplier lifecycle', async () => {
      // Create
      service.create.mockResolvedValue(mockSupplierEntity);
      const created = await controller.create(storeId, mockCreateDto);
      expect(created).toEqual(mockSupplierEntity);

      // Read
      service.findOne.mockResolvedValue(mockSupplierEntity);
      const found = await controller.findById(storeId, supplierId);
      expect(found).toEqual(mockSupplierEntity);

      // Update
      const updatedSupplier = { ...mockSupplierEntity, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedSupplier);
      const updated = await controller.update(
        storeId,
        supplierId,
        mockUpdateDto,
      );
      expect(updated).toEqual(updatedSupplier);

      // Delete
      const removeResponse = {
        message: '✅ Supplier với ID "supplier-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);
      const removed = await controller.remove(storeId, supplierId);
      expect(removed).toEqual(removeResponse);

      // Restore
      const restoreResponse = {
        message: 'Khôi phục supplier thành công',
        data: mockSupplierEntity,
      };
      service.restore.mockResolvedValue(restoreResponse);
      const restored = await controller.restore(storeId, supplierId);
      expect(restored).toEqual(restoreResponse);
    });

    it('should handle multiple suppliers', async () => {
      const multipleSuppliers = [
        mockSupplierEntity,
        { ...mockSupplierEntity, id: 'supplier-2', name: 'XYZ Company' },
        { ...mockSupplierEntity, id: 'supplier-3', name: 'DEF Company' },
      ];

      service.findAll.mockResolvedValue(multipleSuppliers);

      const result = await controller.findAll(storeId);

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleSuppliers);
    });

    it('should handle store-specific suppliers', async () => {
      const store1Suppliers = [mockSupplierEntity];
      const store2Suppliers = [
        { ...mockSupplierEntity, id: 'supplier-2', name: 'Store 2 Supplier' },
      ];

      // Test store 1
      service.findAll.mockResolvedValue(store1Suppliers);
      const store1Result = await controller.findAll('store-1');
      expect(store1Result).toEqual(store1Suppliers);

      // Test store 2
      service.findAll.mockResolvedValue(store2Suppliers);
      const store2Result = await controller.findAll('store-2');
      expect(store2Result).toEqual(store2Suppliers);

      expect(service.findAll).toHaveBeenCalledTimes(2);
      expect(service.findAll).toHaveBeenCalledWith('store-1');
      expect(service.findAll).toHaveBeenCalledWith('store-2');
    });
  });
});
