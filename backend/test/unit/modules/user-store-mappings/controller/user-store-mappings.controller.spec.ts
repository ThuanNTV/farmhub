import { UserStoreMappingsController } from 'src/modules/user-store-mappings/controller/user-store-mappings.controller';
import { UserStoreMappingsService } from 'src/modules/user-store-mappings/service/user-store-mappings.service';
import { UserStoreMappingsAdvancedService } from 'src/modules/user-store-mappings/service/user-store-mappings-advanced.service';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';
import {
  UserStoreMappingFilterDto,
  UserRole,
} from 'src/modules/user-store-mappings/dto/user-store-mapping-filter.dto';
import { BulkCreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/bulk-operations.dto';

describe('UserStoreMappingsController', () => {
  let controller: UserStoreMappingsController;
  let service: jest.Mocked<UserStoreMappingsService>;
  let advancedService: jest.Mocked<UserStoreMappingsAdvancedService>;

  const mockUserStoreMapping = {
    user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    store_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    role: 'STORE_STAFF',
    created_at: new Date('2023-01-01T00:00:00Z'),
    updated_at: new Date('2023-01-01T00:00:00Z'),
    is_deleted: false,
    deleted_at: null,
    created_by_user_id: 'creator-id',
    updated_by_user_id: null,
    user: {
      user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
    },
    store: {
      store_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      name: 'Main Store',
      address: '123 Main St',
    },
  };

  const mockResponseDto = {
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    role: 'STORE_STAFF',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    storeName: 'Main Store',
    storeAddress: '123 Main St',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    isDeleted: false,
    deletedAt: null,
  };

  beforeEach(() => {
    // Create mock services
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      mapToResponseDto: jest.fn(),
      findWithFilters: jest.fn(),
      findByUserId: jest.fn(),
      findByStoreId: jest.fn(),
    } as any;

    advancedService = {
      bulkCreate: jest.fn(),
      bulkUpdate: jest.fn(),
      bulkDelete: jest.fn(),
      getStatistics: jest.fn(),
      validateMappingRules: jest.fn(),
      getPerformanceMetrics: jest.fn(),
    } as any;

    // Create controller instance with mocked services
    controller = new UserStoreMappingsController(service, advancedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user store mapping', async () => {
      const createDto: CreateUserStoreMappingDto = {
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        role: 'STORE_STAFF',
      };

      service.create.mockResolvedValue(mockUserStoreMapping as any);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto.storeId, createDto);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(
        mockUserStoreMapping,
      );
      expect(result).toEqual(mockResponseDto);
    });
  });

  describe('findAll', () => {
    it('should return all user store mappings', async () => {
      const mappings = [mockUserStoreMapping];
      service.findAll.mockResolvedValue(mappings as any);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(service.mapToResponseDto).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockResponseDto]);
    });
  });

  describe('findOne', () => {
    it('should return a specific user store mapping', async () => {
      const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const storeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';

      service.findOne.mockResolvedValue(mockUserStoreMapping as any);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.findOne(userId, storeId);

      expect(service.findOne).toHaveBeenCalledWith(userId, storeId);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(
        mockUserStoreMapping,
      );
      expect(result).toEqual(mockResponseDto);
    });
  });

  describe('update', () => {
    it('should update a user store mapping', async () => {
      const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const storeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';
      const updateDto: UpdateUserStoreMappingDto = {
        role: 'STORE_MANAGER',
      };

      const updatedMapping = { ...mockUserStoreMapping, role: 'STORE_MANAGER' };
      const updatedResponseDto = { ...mockResponseDto, role: 'STORE_MANAGER' };

      service.update.mockResolvedValue(updatedMapping as any);
      service.mapToResponseDto.mockReturnValue(updatedResponseDto);

      const result = await controller.update(userId, storeId, updateDto);

      expect(service.update).toHaveBeenCalledWith(userId, storeId, updateDto);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(updatedMapping);
      expect(result).toEqual(updatedResponseDto);
    });
  });

  describe('remove', () => {
    it('should remove a user store mapping', async () => {
      const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const storeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';

      service.remove.mockResolvedValue({
        message: 'Deleted successfully',
        data: null,
      } as any);

      const result = await controller.remove(userId, storeId);

      expect(service.remove).toHaveBeenCalledWith(userId, storeId);
      expect(result).toEqual({ message: 'Xóa thành công' });
    });
  });

  describe('searchMappings', () => {
    it('should search mappings with filters', async () => {
      const filters: UserStoreMappingFilterDto = {
        role: UserRole.STORE_STAFF,
        page: 1,
        limit: 10,
      };

      const paginatedResult = {
        data: [mockResponseDto],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        appliedFilters: filters,
        generatedAt: new Date(),
      };

      service.findWithFilters.mockResolvedValue(paginatedResult);

      const result = await controller.searchMappings(filters);

      expect(service.findWithFilters).toHaveBeenCalledWith(filters);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getUserStores', () => {
    it('should get all stores for a user', async () => {
      const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const mappings = [mockUserStoreMapping];

      service.findByUserId.mockResolvedValue(mappings as any);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.getUserStores(userId);

      expect(service.findByUserId).toHaveBeenCalledWith(userId);
      expect(service.mapToResponseDto).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockResponseDto]);
    });
  });

  describe('getStoreUsers', () => {
    it('should get all users for a store', async () => {
      const storeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';
      const mappings = [mockUserStoreMapping];

      service.findByStoreId.mockResolvedValue(mappings as any);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.getStoreUsers(storeId);

      expect(service.findByStoreId).toHaveBeenCalledWith(storeId);
      expect(service.mapToResponseDto).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockResponseDto]);
    });
  });

  describe('getStatistics', () => {
    it('should get mapping statistics', async () => {
      const stats = {
        totalMappings: 100,
        mappingsByRole: { STORE_STAFF: 60, STORE_MANAGER: 40 },
        activeMappings: 95,
        deletedMappings: 5,
        topActiveStores: [],
        recentActivity: [],
        generatedAt: new Date(),
      };

      advancedService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(advancedService.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create mappings', async () => {
      const bulkDto: BulkCreateUserStoreMappingDto = {
        mappings: [
          {
            userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            role: UserRole.STORE_STAFF,
          },
        ],
      };

      const bulkResult = {
        successCount: 1,
        failureCount: 0,
        totalCount: 1,
        successDetails: [],
        failureDetails: [],
        completedAt: new Date(),
      };

      advancedService.bulkCreate.mockResolvedValue(bulkResult);

      const result = await controller.bulkCreate(bulkDto);

      expect(advancedService.bulkCreate).toHaveBeenCalledWith(bulkDto);
      expect(result).toEqual(bulkResult);
    });
  });
});
