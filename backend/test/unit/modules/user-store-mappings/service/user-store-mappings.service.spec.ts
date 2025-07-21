import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserStoreMappingsService } from 'src/modules/user-store-mappings/service/user-store-mappings.service';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';
import {
  UserStoreMappingFilterDto,
  UserRole,
} from 'src/modules/user-store-mappings/dto/user-store-mapping-filter.dto';

describe('UserStoreMappingsService', () => {
  let service: UserStoreMappingsService;
  let mappingRepository: jest.Mocked<Repository<UserStoreMapping>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let storeRepository: jest.Mocked<Repository<Store>>;

  const mockUserStoreMapping = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    store_id: '123e4567-e89b-12d3-a456-426614174001',
    role: 'STORE_STAFF',
    created_at: new Date('2023-01-01T00:00:00Z'),
    updated_at: new Date('2023-01-01T00:00:00Z'),
    is_deleted: false,
    deleted_at: null,
    created_by_user_id: 'creator-id',
    updated_by_user_id: null,
    user: {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      full_name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
    },
    store: {
      store_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Main Store',
      address: '123 Main St',
    },
  };

  const mockUser = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    full_name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    is_deleted: false,
  };

  const mockStore = {
    store_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Main Store',
    address: '123 Main St',
    is_deleted: false,
  };

  beforeEach(async () => {
    const mockMappingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockStoreRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStoreMappingsService,
        {
          provide: getRepositoryToken(UserStoreMapping, 'globalConnection'),
          useValue: mockMappingRepository,
        },
        {
          provide: getRepositoryToken(User, 'globalConnection'),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Store, 'globalConnection'),
          useValue: mockStoreRepository,
        },
      ],
    }).compile();

    service = module.get<UserStoreMappingsService>(UserStoreMappingsService);
    mappingRepository = module.get(
      getRepositoryToken(UserStoreMapping, 'globalConnection'),
    );
    userRepository = module.get(getRepositoryToken(User, 'globalConnection'));
    storeRepository = module.get(getRepositoryToken(Store, 'globalConnection'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user store mapping successfully', async () => {
      const createDto: CreateUserStoreMappingDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      storeRepository.findOne.mockResolvedValue(mockStore as any);
      mappingRepository.findOne.mockResolvedValue(null);
      mappingRepository.create.mockReturnValue(mockUserStoreMapping as any);
      mappingRepository.save.mockResolvedValue(mockUserStoreMapping as any);

      const result = await service.create('store-id', createDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: createDto.userId, is_deleted: false },
      });
      expect(storeRepository.findOne).toHaveBeenCalledWith({
        where: { store_id: createDto.storeId, is_deleted: false },
      });
      expect(mappingRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: createDto.userId,
          store_id: createDto.storeId,
          is_deleted: false,
        },
      });
      expect(mappingRepository.create).toHaveBeenCalled();
      expect(mappingRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUserStoreMapping);
    });

    it('should throw NotFoundException when user not found', async () => {
      const createDto: CreateUserStoreMappingDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create('store-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when store not found', async () => {
      const createDto: CreateUserStoreMappingDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      storeRepository.findOne.mockResolvedValue(null);

      await expect(service.create('store-id', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when mapping already exists', async () => {
      const createDto: CreateUserStoreMappingDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
      };

      userRepository.findOne.mockResolvedValue(mockUser as any);
      storeRepository.findOne.mockResolvedValue(mockStore as any);
      mappingRepository.findOne.mockResolvedValue(mockUserStoreMapping as any);

      await expect(service.create('store-id', createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active user store mappings', async () => {
      const mappings = [mockUserStoreMapping];
      mappingRepository.find.mockResolvedValue(mappings as any);

      const result = await service.findAll();

      expect(mappingRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mappings);
    });
  });

  describe('findOne', () => {
    it('should return a specific user store mapping', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';

      mappingRepository.findOne.mockResolvedValue(mockUserStoreMapping as any);

      const result = await service.findOne(userId, storeId);

      expect(mappingRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, store_id: storeId, is_deleted: false },
        relations: ['user', 'store'],
      });
      expect(result).toEqual(mockUserStoreMapping);
    });

    it('should throw NotFoundException when mapping not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';

      mappingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, storeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user store mapping successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';
      const updateDto: UpdateUserStoreMappingDto = {
        role: 'STORE_MANAGER',
      };

      const updatedMapping = { ...mockUserStoreMapping, role: 'STORE_MANAGER' };
      mappingRepository.findOne.mockResolvedValue(mockUserStoreMapping as any);
      mappingRepository.save.mockResolvedValue(updatedMapping as any);

      const result = await service.update(userId, storeId, updateDto);

      expect(mappingRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, store_id: storeId, is_deleted: false },
      });
      expect(mappingRepository.save).toHaveBeenCalled();
      expect(result.role).toBe('STORE_MANAGER');
    });

    it('should throw NotFoundException when mapping not found for update', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';
      const updateDto: UpdateUserStoreMappingDto = {
        role: 'STORE_MANAGER',
      };

      mappingRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, storeId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a user store mapping', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';

      mappingRepository.findOne.mockResolvedValue(mockUserStoreMapping as any);
      mappingRepository.save.mockResolvedValue({
        ...mockUserStoreMapping,
        is_deleted: true,
      } as any);

      await service.remove(userId, storeId);

      expect(mappingRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, store_id: storeId, is_deleted: false },
      });
      expect(mappingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when mapping not found for removal', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const storeId = '123e4567-e89b-12d3-a456-426614174001';

      mappingRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, storeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findWithFilters', () => {
    it('should find mappings with filters and pagination', async () => {
      const filters: UserStoreMappingFilterDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: UserRole.STORE_STAFF,
        page: 1,
        limit: 10,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockUserStoreMapping]),
      };

      mappingRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findWithFilters(filters);

      expect(mappingRepository.createQueryBuilder).toHaveBeenCalledWith(
        'mapping',
      );
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findByUserId', () => {
    it('should find mappings by user ID', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mappings = [mockUserStoreMapping];

      mappingRepository.find.mockResolvedValue(mappings as any);

      const result = await service.findByUserId(userId);

      expect(mappingRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId, is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mappings);
    });
  });

  describe('findByStoreId', () => {
    it('should find mappings by store ID', async () => {
      const storeId = '123e4567-e89b-12d3-a456-426614174001';
      const mappings = [mockUserStoreMapping];

      mappingRepository.find.mockResolvedValue(mappings as any);

      const result = await service.findByStoreId(storeId);

      expect(mappingRepository.find).toHaveBeenCalledWith({
        where: { store_id: storeId, is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mappings);
    });
  });

  describe('mapToResponseDto', () => {
    it('should map entity to response DTO', () => {
      const result = service.mapToResponseDto(mockUserStoreMapping as any);

      expect(result).toEqual({
        userId: mockUserStoreMapping.user_id,
        storeId: mockUserStoreMapping.store_id,
        role: mockUserStoreMapping.role,
        createdByUserId: mockUserStoreMapping.created_by_user_id,
        createdAt: mockUserStoreMapping.created_at,
      });
    });
  });
});
