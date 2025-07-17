import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { TenantBaseService } from '../../../src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';

// Mock entity for testing
class TestEntity {
  id!: string;
  name!: string;

  constructor(data?: Partial<TestEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  // Add static entityName property for entity identification
  static get entityName() {
    return 'TestEntity';
  }
}

// Concrete implementation for testing
class TestTenantService extends TenantBaseService<TestEntity> {
  protected primaryKey = 'id';

  constructor(tenantDataSourceService: TenantDataSourceService) {
    super(tenantDataSourceService, TestEntity);
  }

  // Expose protected methods for testing
  async testGetRepo(storeId: string) {
    return this.getRepo(storeId);
  }

  async testFindById(storeId: string, id: string) {
    return this.findById(storeId, id);
  }

  async testFindByIdOrFail(storeId: string, id: string) {
    return this.findByIdOrFail(storeId, id);
  }

  async testFindAll(storeId: string, options?: any) {
    return this.findAll(storeId, options);
  }

  async testCount(storeId: string, where?: any) {
    return this.count(storeId, where);
  }

  async testCreate(storeId: string, entityData: any) {
    return this.create(storeId, entityData);
  }

  async testUpdateById(storeId: string, id: string, updateData: any) {
    return this.updateById(storeId, id, updateData);
  }

  async testDeleteById(storeId: string, id: string) {
    return this.deleteById(storeId, id);
  }

  async testSoftDeleteById(storeId: string, id: string) {
    return this.softDeleteById(storeId, id);
  }

  async testExists(storeId: string, where: any) {
    return this.exists(storeId, where);
  }

  async testExecuteWithRepo(storeId: string, callback: any) {
    return this.executeWithRepo(storeId, callback);
  }

  testValidateStoreId(storeId: string) {
    return this.validateStoreId(storeId);
  }

  testGetEntityName() {
    return this.getEntityName();
  }
}

describe('TenantBaseService', () => {
  let service: TestTenantService;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockRepository: jest.Mocked<Repository<TestEntity>>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      getRepository: jest.fn(),
    } as any;

    // Create mock data source with explicit getRepository mock
    mockDataSource = {
      isInitialized: true,
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    // Create mock tenant data source service
    tenantDataSourceService = {
      getTenantDataSource: jest.fn().mockResolvedValue(mockDataSource),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TestTenantService,
          useFactory: () => new TestTenantService(tenantDataSourceService),
        },
        {
          provide: TenantDataSourceService,
          useValue: tenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<TestTenantService>(TestTenantService);

    // Verify mock setup
    expect(tenantDataSourceService.getTenantDataSource).toBeDefined();
    expect(mockDataSource.getRepository).toBeDefined();
    expect(mockDataSource.isInitialized).toBe(true);
    expect((service as any).tenantDataSourceService).toBe(
      tenantDataSourceService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to default
    tenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource,
    );
    mockDataSource.getRepository.mockReturnValue(mockRepository);
  });

  describe('getRepo', () => {
    it('should return repository for valid storeId', async () => {
      // Ensure mock is properly set up
      expect(tenantDataSourceService.getTenantDataSource).toBeDefined();
      expect(mockDataSource.getRepository).toBeDefined();
      expect(mockDataSource.isInitialized).toBe(true);

      // Mock the getTenantDataSource to return our mock data source
      tenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource,
      );

      // Mock the getRepository to return our mock repository
      mockDataSource.getRepository.mockReturnValue(mockRepository);

      const result = await service.testGetRepo('store-001');

      expect(tenantDataSourceService.getTenantDataSource).toHaveBeenCalledWith(
        'store-001',
      );
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(TestEntity);
      expect(result).toBe(mockRepository);
    });

    it('should throw BadRequestException for empty storeId', async () => {
      await expect(service.testGetRepo('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.testGetRepo('')).rejects.toThrow(
        'Store ID không được để trống',
      );
    });

    it('should throw BadRequestException for null storeId', async () => {
      await expect(service.testGetRepo(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.testGetRepo(null as any)).rejects.toThrow(
        'Store ID không được để trống',
      );
    });

    it('should throw BadRequestException for whitespace storeId', async () => {
      await expect(service.testGetRepo('   ')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.testGetRepo('   ')).rejects.toThrow(
        'Store ID không được để trống',
      );
    });

    it('should throw InternalServerErrorException when dataSource is not initialized', async () => {
      // Create a new mock data source with isInitialized = false
      const uninitializedDataSource = {
        isInitialized: false,
        getRepository: jest.fn().mockReturnValue(mockRepository),
      } as any;

      tenantDataSourceService.getTenantDataSource.mockResolvedValue(
        uninitializedDataSource,
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        'Kết nối CSDL cho store "store-001" chưa được khởi tạo',
      );
    });

    it('should re-throw NotFoundException from tenantDataSourceService', async () => {
      const notFoundError = new NotFoundException('Store not found');
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        notFoundError,
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        '❌ Store "store-001" không tồn tại',
      );
    });

    it('should re-throw BadRequestException from tenantDataSourceService', async () => {
      const badRequestError = new BadRequestException('Invalid store');
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        badRequestError,
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should re-throw InternalServerErrorException from tenantDataSourceService', async () => {
      const internalError = new InternalServerErrorException('Database error');
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        internalError,
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        unexpectedError,
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });

    it('should handle non-Error objects', async () => {
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        'String error',
      );

      await expect(service.testGetRepo('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should find entity by id successfully', async () => {
      const mockEntity = new TestEntity({ id: '1', name: 'Test' });
      mockRepository.findOne.mockResolvedValue(mockEntity);

      const result = await service.testFindById('store-001', '1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(mockEntity);
    });

    it('should return null when entity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.testFindById('store-001', '1');

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.testFindById('store-001', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testFindById('store-001', '1')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      mockRepository.findOne.mockRejectedValue('String error');

      await expect(service.testFindById('store-001', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testFindById('store-001', '1')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('findByIdOrFail', () => {
    it('should return entity when found', async () => {
      const mockEntity = new TestEntity({ id: '1', name: 'Test' });
      mockRepository.findOne.mockResolvedValue(mockEntity);

      const result = await service.testFindByIdOrFail('store-001', '1');

      expect(result).toBe(mockEntity);
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.testFindByIdOrFail('store-001', '1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.testFindByIdOrFail('store-001', '1'),
      ).rejects.toThrow('TestEntity với ID "1" không tồn tại');
    });
  });

  describe('findAll', () => {
    it('should find all entities successfully', async () => {
      const mockEntities = [
        new TestEntity({ id: '1', name: 'Test1' }),
        new TestEntity({ id: '2', name: 'Test2' }),
      ];
      mockRepository.find.mockResolvedValue(mockEntities);

      const result = await service.testFindAll('store-001');

      expect(mockRepository.find).toHaveBeenCalledWith(undefined);
      expect(result).toBe(mockEntities);
    });

    it('should find entities with options', async () => {
      const options = { where: { name: 'Test' } };
      const mockEntities = [new TestEntity({ id: '1', name: 'Test' })];
      mockRepository.find.mockResolvedValue(mockEntities);

      const result = await service.testFindAll('store-001', options);

      expect(mockRepository.find).toHaveBeenCalledWith(options);
      expect(result).toBe(mockEntities);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.testFindAll('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testFindAll('store-001')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('count', () => {
    it('should count entities successfully', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.testCount('store-001');

      expect(mockRepository.count).toHaveBeenCalledWith({ where: undefined });
      expect(result).toBe(5);
    });

    it('should count entities with where condition', async () => {
      const where = { name: 'Test' };
      mockRepository.count.mockResolvedValue(2);

      const result = await service.testCount('store-001', where);

      expect(mockRepository.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(2);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.count.mockRejectedValue(error);

      await expect(service.testCount('store-001')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testCount('store-001')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('create', () => {
    it('should create entity successfully', async () => {
      const entityData = { name: 'New Test' };
      const mockEntity = new TestEntity({ id: '1', name: 'New Test' });
      mockRepository.create.mockReturnValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      const result = await service.testCreate('store-001', entityData);

      expect(mockRepository.create).toHaveBeenCalledWith(entityData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toBe(mockEntity);
    });

    it('should handle repository errors', async () => {
      const entityData = { name: 'New Test' };
      const error = new Error('Database error');
      mockRepository.create.mockReturnValue(new TestEntity());
      mockRepository.save.mockRejectedValue(error);

      await expect(service.testCreate('store-001', entityData)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testCreate('store-001', entityData)).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      const entityData = { name: 'New Test' };
      mockRepository.create.mockReturnValue(new TestEntity());
      mockRepository.save.mockRejectedValue('String error');

      await expect(service.testCreate('store-001', entityData)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testCreate('store-001', entityData)).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('updateById', () => {
    it('should update entity successfully', async () => {
      const updateData = { name: 'Updated Test' };
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };
      mockRepository.update.mockResolvedValue(updateResult);

      const result = await service.testUpdateById('store-001', '1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(result).toBe(updateResult);
    });

    it('should handle repository errors', async () => {
      const updateData = { name: 'Updated Test' };
      const error = new Error('Database error');
      mockRepository.update.mockRejectedValue(error);

      await expect(
        service.testUpdateById('store-001', '1', updateData),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.testUpdateById('store-001', '1', updateData),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });

    it('should handle non-Error objects in catch block', async () => {
      const updateData = { name: 'Updated Test' };
      mockRepository.update.mockRejectedValue('String error');

      await expect(
        service.testUpdateById('store-001', '1', updateData),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.testUpdateById('store-001', '1', updateData),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
  });

  describe('deleteById', () => {
    it('should delete entity successfully', async () => {
      const deleteResult = { affected: 1, raw: [] };
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.testDeleteById('store-001', '1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(deleteResult);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.testDeleteById('store-001', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testDeleteById('store-001', '1')).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('softDeleteById', () => {
    it('should soft delete entity successfully', async () => {
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };
      mockRepository.softDelete.mockResolvedValue(updateResult);

      const result = await service.testSoftDeleteById('store-001', '1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
      expect(result).toBe(updateResult);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.softDelete.mockRejectedValue(error);

      await expect(
        service.testSoftDeleteById('store-001', '1'),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.testSoftDeleteById('store-001', '1'),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
  });

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      const where = { name: 'Test' };
      mockRepository.count.mockResolvedValue(1);

      const result = await service.testExists('store-001', where);

      expect(mockRepository.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      const where = { name: 'Test' };
      mockRepository.count.mockResolvedValue(0);

      const result = await service.testExists('store-001', where);

      expect(result).toBe(false);
    });

    it('should handle repository errors', async () => {
      const where = { name: 'Test' };
      const error = new Error('Database error');
      mockRepository.count.mockRejectedValue(error);

      await expect(service.testExists('store-001', where)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.testExists('store-001', where)).rejects.toThrow(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    });
  });

  describe('executeWithRepo', () => {
    it('should execute callback with repository successfully', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const expectedResult = 'result';

      const result = await service.testExecuteWithRepo('store-001', callback);

      expect(callback).toHaveBeenCalledWith(mockRepository);
      expect(result).toBe(expectedResult);
    });

    it('should handle callback errors', async () => {
      const error = new Error('Callback error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(
        service.testExecuteWithRepo('store-001', callback),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.testExecuteWithRepo('store-001', callback),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
  });

  describe('validateStoreId', () => {
    it('should validate correct store ID format', () => {
      expect(() => service.testValidateStoreId('store-001')).not.toThrow();
      expect(() => service.testValidateStoreId('store-999')).not.toThrow();
    });

    it('should throw BadRequestException for null storeId', () => {
      expect(() => service.testValidateStoreId(null as any)).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId(null as any)).toThrow(
        'Store ID phải là chuỗi không rỗng',
      );
    });

    it('should throw BadRequestException for undefined storeId', () => {
      expect(() => service.testValidateStoreId(undefined as any)).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId(undefined as any)).toThrow(
        'Store ID phải là chuỗi không rỗng',
      );
    });

    it('should throw BadRequestException for empty string', () => {
      expect(() => service.testValidateStoreId('')).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId('')).toThrow(
        'Store ID phải là chuỗi không rỗng',
      );
    });

    it('should throw BadRequestException for non-string storeId', () => {
      expect(() => service.testValidateStoreId(123 as any)).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId(123 as any)).toThrow(
        'Store ID phải là chuỗi không rỗng',
      );
    });

    it('should throw BadRequestException for invalid format', () => {
      expect(() => service.testValidateStoreId('store1')).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId('store1')).toThrow(
        'Store ID không đúng định dạng (vd: store-001)',
      );
    });

    it('should throw BadRequestException for wrong format', () => {
      expect(() => service.testValidateStoreId('store-1')).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId('store-01')).toThrow(
        BadRequestException,
      );
      expect(() => service.testValidateStoreId('store-0001')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('getEntityName', () => {
    it('should return entity name', () => {
      const result = service.testGetEntityName();
      expect(result).toBe('TestEntity');
    });
  });

  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      // Access protected properties through the service instance
      expect((service as any).tenantDataSourceService).toBe(
        tenantDataSourceService,
      );
      expect((service as any).entity).toBe(TestEntity);
      expect((service as any).primaryKey).toBe('id');
    });
  });

  describe('logger', () => {
    it('should have correct logger name', () => {
      expect(service['logger']).toBeInstanceOf(Logger);
      expect(service['logger']['context']).toBe('TestTenantService');
    });
  });
});
