/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserStoreMappingsService } from '@core/user/service/user-store-mappings.service';
import { CreateUserStoreMappingDto } from '@modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from '@modules/user-store-mappings/dto/update-userStoreMapping.dto';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';

describe('UserStoreMappingsService', () => {
  let service: UserStoreMappingsService;
  let userStoreMappingRepo: jest.Mocked<Repository<UserStoreMapping>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let storeRepo: jest.Mocked<Repository<Store>>;

  // Mock data
  const mockUser: User = {
    user_id: 'user-123',
    username: 'testuser',
    password: 'hashedpassword',
    full_name: 'Test User',
    email: 'test@example.com',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  } as User;

  const mockStore: Store = {
    store_id: 'store-123',
    name: 'Test Store',
    address: 'Test Address',
    schema_name: 'test_schema',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  } as Store;

  const mockUserStoreMapping: UserStoreMapping = {
    user_id: 'user-123',
    store_id: 'store-123',
    role: 'STORE_MANAGER',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    created_by_user_id: 'admin-123',
    user: mockUser,
    store: mockStore,
  } as UserStoreMapping;

  const createMockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStoreMappingsService,
        {
          provide: getRepositoryToken(UserStoreMapping, 'globalConnection'),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User, 'globalConnection'),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Store, 'globalConnection'),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserStoreMappingsService>(UserStoreMappingsService);
    userStoreMappingRepo = module.get(
      getRepositoryToken(UserStoreMapping, 'globalConnection'),
    );
    userRepo = module.get(getRepositoryToken(User, 'globalConnection'));
    storeRepo = module.get(getRepositoryToken(Store, 'globalConnection'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserAndStore', () => {
    it('should return user store mapping when found', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);

      const result = await service.findByUserAndStore('user-123', 'store-123');

      expect(result).toEqual(mockUserStoreMapping);
      expect(userStoreMappingRepo.findOne).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          store_id: 'store-123',
          is_deleted: false,
        },
      });
    });

    it('should return null when not found', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(null);

      const result = await service.findByUserAndStore('user-123', 'store-123');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return user store mappings for a user', async () => {
      const mockMappings = [mockUserStoreMapping];
      userStoreMappingRepo.find.mockResolvedValue(mockMappings);

      const result = await service.findByUserId('user-123');

      expect(result).toEqual(mockMappings);
      expect(userStoreMappingRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-123', is_deleted: false },
        relations: ['store'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no mappings found', async () => {
      userStoreMappingRepo.find.mockResolvedValue([]);

      const result = await service.findByUserId('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findByStoreId', () => {
    it('should return user store mappings for a store', async () => {
      const mockMappings = [mockUserStoreMapping];
      userStoreMappingRepo.find.mockResolvedValue(mockMappings);

      const result = await service.findByStoreId('store-123');

      expect(result).toEqual(mockMappings);
      expect(userStoreMappingRepo.find).toHaveBeenCalledWith({
        where: { store_id: 'store-123', is_deleted: false },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no mappings found', async () => {
      userStoreMappingRepo.find.mockResolvedValue([]);

      const result = await service.findByStoreId('store-123');

      expect(result).toEqual([]);
    });
  });

  describe('mapToResponseDto', () => {
    it('should map entity to response dto', () => {
      const result = service.mapToResponseDto(mockUserStoreMapping);

      expect(result).toEqual({
        userId: mockUserStoreMapping.user_id,
        storeId: mockUserStoreMapping.store_id,
        role: mockUserStoreMapping.role,
        createdAt: mockUserStoreMapping.created_at,
        createdByUserId: mockUserStoreMapping.created_by_user_id,
      });
    });
  });

  describe('validateForeignKeys', () => {
    it('should pass validation when user and store exist', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);

      await expect(
        service.validateForeignKeys({
          userId: 'user-123',
          store_id: 'store-123',
        }),
      ).resolves.not.toThrow();

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-123', is_deleted: false },
      });
      expect(storeRepo.findOne).toHaveBeenCalledWith({
        where: { store_id: 'store-123', is_deleted: false },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      storeRepo.findOne.mockResolvedValue(mockStore);

      await expect(
        service.validateForeignKeys({
          userId: 'user-123',
          store_id: 'store-123',
        }),
      ).rejects.toThrow(
        new NotFoundException('User with ID user-123 not found'),
      );
    });

    it('should throw NotFoundException when store does not exist', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateForeignKeys({
          userId: 'user-123',
          store_id: 'store-123',
        }),
      ).rejects.toThrow(
        new NotFoundException('Store with ID store-123 not found'),
      );
    });
  });

  describe('validateUniqueConstraint', () => {
    it('should pass validation when mapping does not exist', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateUniqueConstraint('user-123', 'store-123'),
      ).resolves.not.toThrow();

      expect(userStoreMappingRepo.findOne).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          store_id: 'store-123',
          is_deleted: false,
        },
      });
    });

    it('should throw ConflictException when mapping already exists', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);

      await expect(
        service.validateUniqueConstraint('user-123', 'store-123'),
      ).rejects.toThrow(
        new ConflictException(
          'User store mapping already exists for user user-123 and store store-123',
        ),
      );
    });
  });

  describe('create', () => {
    const createDto: CreateUserStoreMappingDto = {
      userId: 'user-123',
      storeId: 'store-123',
      role: 'STORE_MANAGER',
      createdByUserId: 'admin-123',
    };

    it('should create a new user store mapping successfully', async () => {
      // Mock validation methods
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);
      userStoreMappingRepo.findOne.mockResolvedValue(null);
      userStoreMappingRepo.create.mockReturnValue(mockUserStoreMapping);
      userStoreMappingRepo.save.mockResolvedValue(mockUserStoreMapping);

      const result = await service.create('store-123', createDto);

      expect(result).toEqual(mockUserStoreMapping);
      expect(userStoreMappingRepo.create).toHaveBeenCalledWith({
        user_id: createDto.userId,
        store_id: createDto.storeId,
        created_by_user_id: createDto.createdByUserId,
      });
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        mockUserStoreMapping,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.create('store-123', createDto)).rejects.toThrow(
        new NotFoundException('User with ID user-123 not found'),
      );
    });

    it('should throw ConflictException when mapping already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);

      await expect(service.create('store-123', createDto)).rejects.toThrow(
        new ConflictException(
          'User store mapping already exists for user user-123 and store store-123',
        ),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserStoreMappingDto = {
      role: 'STORE_STAFF',
    };

    it('should update user store mapping successfully', async () => {
      const updatedMapping = { ...mockUserStoreMapping, role: 'STORE_STAFF' };
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);
      userStoreMappingRepo.save.mockResolvedValue(updatedMapping);

      const result = await service.update('user-123', 'store-123', updateDto);

      expect(result).toEqual(updatedMapping);
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUserStoreMapping,
          updated_at: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when mapping does not exist', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'store-123', updateDto),
      ).rejects.toThrow(
        new NotFoundException(
          'User store mapping with user ID user-123 and store ID store-123 not found',
        ),
      );
    });

    it('should validate foreign keys when updating userId or storeId', async () => {
      const updateDtoWithIds: UpdateUserStoreMappingDto = {
        userId: 'user-456',
        storeId: 'store-456',
      };

      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);
      userStoreMappingRepo.save.mockResolvedValue(mockUserStoreMapping);

      await service.update('user-123', 'store-123', updateDtoWithIds);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-456', is_deleted: false },
      });
      expect(storeRepo.findOne).toHaveBeenCalledWith({
        where: { store_id: 'store-456', is_deleted: false },
      });
    });

    it('should update only userId when only userId is provided', async () => {
      const updateDtoWithUserId: UpdateUserStoreMappingDto = {
        userId: 'user-456',
      };

      const updatedMapping = { ...mockUserStoreMapping, user_id: 'user-456' };
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);
      userStoreMappingRepo.save.mockResolvedValue(updatedMapping);

      const result = await service.update(
        'user-123',
        'store-123',
        updateDtoWithUserId,
      );

      expect(result).toEqual(updatedMapping);
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-456',
          store_id: 'store-123',
        }),
      );
    });

    it('should update only storeId when only storeId is provided', async () => {
      const updateDtoWithStoreId: UpdateUserStoreMappingDto = {
        storeId: 'store-456',
      };

      const updatedMapping = { ...mockUserStoreMapping, store_id: 'store-456' };
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);
      userRepo.findOne.mockResolvedValue(mockUser);
      storeRepo.findOne.mockResolvedValue(mockStore);
      userStoreMappingRepo.save.mockResolvedValue(updatedMapping);

      const result = await service.update(
        'user-123',
        'store-123',
        updateDtoWithStoreId,
      );

      expect(result).toEqual(updatedMapping);
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          store_id: 'store-456',
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user store mapping successfully', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(mockUserStoreMapping);
      userStoreMappingRepo.save.mockResolvedValue({
        ...mockUserStoreMapping,
        is_deleted: true,
        deleted_at: new Date(),
      });

      const result = await service.remove('user-123', 'store-123');

      expect(result).toEqual({
        message:
          '✅ User store mapping với user ID "user-123" và store ID "store-123" đã được xóa mềm',
        data: null,
      });
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: true,
          deleted_at: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when mapping does not exist', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('user-123', 'store-123')).rejects.toThrow(
        new NotFoundException(
          'User store mapping with user ID user-123 and store ID store-123 not found',
        ),
      );
    });
  });

  describe('restore', () => {
    it('should restore deleted user store mapping successfully', async () => {
      const deletedMapping = { ...mockUserStoreMapping, is_deleted: true };
      const restoredMapping = { ...mockUserStoreMapping, is_deleted: false };

      userStoreMappingRepo.findOne.mockResolvedValue(deletedMapping);
      userStoreMappingRepo.save.mockResolvedValue(restoredMapping);

      const result = await service.restore('user-123', 'store-123');

      expect(result).toEqual(restoredMapping);
      expect(userStoreMappingRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-123', store_id: 'store-123', is_deleted: true },
      });
      expect(userStoreMappingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: false,
          deleted_at: undefined,
          updated_at: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when deleted mapping does not exist', async () => {
      userStoreMappingRepo.findOne.mockResolvedValue(null);

      await expect(service.restore('user-123', 'store-123')).rejects.toThrow(
        new NotFoundException(
          'Deleted user store mapping with user ID user-123 and store ID store-123 not found',
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all user store mappings', async () => {
      const mockMappings = [mockUserStoreMapping];
      userStoreMappingRepo.find.mockResolvedValue(mockMappings);

      const result = await service.findAll();

      expect(result).toEqual(mockMappings);
      expect(userStoreMappingRepo.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no mappings exist', async () => {
      userStoreMappingRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
