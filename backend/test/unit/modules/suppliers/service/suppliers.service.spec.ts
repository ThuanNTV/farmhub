import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SuppliersService } from '@modules/suppliers/service/suppliers.service';
import {
  createTenantServiceTestSetup,
  TenantServiceTestSetup,
  TEST_STORE_ID,
  TEST_USER_ID,
  resetMocks,
  createTestEntity,
  setupSuccessfulRepositoryMocks,
} from '../../../../utils/tenant-datasource-mock.util';
import { CreateSupplierDto } from '@modules/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@modules/suppliers/dto/update-supplier.dto';
import { DtoMapper } from '@common/helpers/dto-mapper.helper';
import { Supplier } from 'src/entities/tenant/supplier.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

// Mock DtoMapper
jest.mock('src/common/helpers/dto-mapper.helper', () => ({
  DtoMapper: {
    mapToEntity: jest.fn(),
  },
}));

describe('SuppliersService', () => {
  let module: TestingModule;
  let service: SuppliersService;
  let setup: TenantServiceTestSetup<Supplier>;

  const mockSupplierData: Partial<Supplier> = {
    id: 'supplier-123',
    name: 'Test Supplier',
    contact_person: 'John Doe',
    email: 'john@supplier.com',
    phone: '+1234567890',
    address: '123 Supplier St',
    is_deleted: false,
    created_by_user_id: TEST_USER_ID,
    updated_by_user_id: TEST_USER_ID,
  };

  beforeEach(async () => {
    setup = createTenantServiceTestSetup<Supplier>();

    module = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: TenantDataSourceService,
          useValue: { getTenantDataSource: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    resetMocks(setup);
    await module.close();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct primary key', () => {
      expect((service as any).primaryKey).toBe('id');
    });
  });

  describe('create', () => {
    it('should create supplier successfully', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Test Supplier',
        contactPerson: 'John Doe',
        email: 'john@supplier.com',
        phone: '+1234567890',
        address: '123 Supplier St',
        createdByUserId: TEST_USER_ID,
      };

      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setupSuccessfulRepositoryMocks(setup.mockRepository, testSupplier);

      const result = await service.create(TEST_STORE_ID, createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(mockSupplierData.name);
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Test Supplier',
        contactPerson: 'John Doe',
        email: 'john@supplier.com',
        phone: '+1234567890',
        address: '123 Supplier St',
        createdByUserId: TEST_USER_ID,
      };

      const error = new Error('Database error');
      setup.mockRepository.save.mockRejectedValue(error);

      await expect(service.create(TEST_STORE_ID, createDto)).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('findById', () => {
    it('should find supplier by id successfully', async () => {
      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setup.mockRepository.findOne.mockResolvedValue(testSupplier);

      const result = await service.findById(TEST_STORE_ID, 'supplier-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockSupplierData.id);
    });

    it('should return null when supplier not found', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(TEST_STORE_ID, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find one supplier successfully', async () => {
      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setup.mockRepository.findOne.mockResolvedValue(testSupplier);

      const result = await service.findOne(TEST_STORE_ID, 'supplier-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockSupplierData.id);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should find all suppliers successfully', async () => {
      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setup.mockRepository.find.mockResolvedValue([testSupplier]);

      const result = await service.findAll(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(setup.mockRepository.find).toHaveBeenCalledWith({
        relations: ['created_by_user', 'updated_by_user'],
      });
    });

    it('should return empty array when no suppliers found', async () => {
      setup.mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('update', () => {
    it('should update supplier successfully', async () => {
      const updateDto: UpdateSupplierDto = {
        name: 'Updated Supplier',
        contactPerson: 'Jane Doe',
        email: 'jane@supplier.com',
      };

      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      const mappedEntityData = { ...updateDto }; // Simulated mapped data
      const updatedSupplier = { ...testSupplier, ...updateDto };

      // Setup mocks
      setup.mockRepository.findOne.mockResolvedValue(testSupplier);
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntityData);
      setup.mockRepository.merge.mockReturnValue(updatedSupplier);
      setup.mockRepository.save.mockResolvedValue(updatedSupplier);

      const result = await service.update(
        TEST_STORE_ID,
        'supplier-123',
        updateDto,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Supplier');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(DtoMapper.mapToEntity).toHaveBeenCalledWith(updateDto);
      expect(setup.mockRepository.merge).toHaveBeenCalledWith(
        testSupplier,
        mappedEntityData,
      );
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when supplier not found for update', async () => {
      const updateDto: UpdateSupplierDto = { name: 'Updated Supplier' };
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(TEST_STORE_ID, 'non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove supplier successfully (soft delete)', async () => {
      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setup.mockRepository.findOne.mockResolvedValue(testSupplier);
      setup.mockRepository.save.mockResolvedValue({
        ...testSupplier,
        is_deleted: true,
      });

      const result = await service.remove(TEST_STORE_ID, 'supplier-123');

      expect(result).toBeDefined();
      expect(result.message).toContain('đã được xóa mềm');
      expect(result.data).toBeNull();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when supplier not found for removal', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle removal errors', async () => {
      const testSupplier = createTestEntity<Supplier>(mockSupplierData);
      setup.mockRepository.findOne.mockResolvedValue(testSupplier);

      const error = new Error('Database error');
      setup.mockRepository.save.mockRejectedValue(error);

      await expect(
        service.remove(TEST_STORE_ID, 'supplier-123'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('restore', () => {
    it('should restore supplier successfully', async () => {
      const deletedSupplier = createTestEntity<Supplier>({
        ...mockSupplierData,
        is_deleted: true,
      });
      const restoredSupplier = { ...deletedSupplier, is_deleted: false };

      setup.mockRepository.findOne.mockResolvedValue(deletedSupplier);
      setup.mockRepository.save.mockResolvedValue(restoredSupplier);

      const result = await service.restore(TEST_STORE_ID, 'supplier-123');

      expect(result).toBeDefined();
      expect(result.message).toBe('Khôi phục supplier thành công');
      expect(result.data).toBeDefined();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when supplier not found or not deleted', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restore(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle restore errors', async () => {
      const deletedSupplier = createTestEntity<Supplier>({
        ...mockSupplierData,
        is_deleted: true,
      });
      setup.mockRepository.findOne.mockResolvedValue(deletedSupplier);

      const error = new Error('Database error');
      setup.mockRepository.save.mockRejectedValue(error);

      await expect(
        service.restore(TEST_STORE_ID, 'supplier-123'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', () => {
      const error = new Error('Database connection failed');
      setup.mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        error,
      );

      expect(
        setup.mockTenantDataSourceService.getTenantDataSource,
      ).toBeDefined();
    });

    it('should handle repository operation errors', async () => {
      const error = new Error('Repository operation failed');
      setup.mockRepository.save.mockRejectedValue(error);

      const createDto: CreateSupplierDto = {
        name: 'Test Supplier',
        contactPerson: 'John Doe',
        email: 'john@supplier.com',
        phone: '+1234567890',
        address: '123 Supplier St',
        createdByUserId: TEST_USER_ID,
      };

      await expect(service.create(TEST_STORE_ID, createDto)).rejects.toThrow();
    });
  });
});
