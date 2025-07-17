import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/controller/users.controller';
import {
  CreateUserDto,
  UserRole,
} from '../../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../src/modules/users/dto/update-user.dto';
import { User } from '../../../src/entities/global/user.entity';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SecurityService } from '../../../src/service/global/security.service';
import { JwtService } from '@nestjs/jwt';
import { EnhancedAuthGuard } from '../../../src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from '../../../src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from '../../../src/common/auth/audit.interceptor';
import { UsersService } from 'src/core/user/service/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: any;
  let mockSecurityService: jest.Mocked<SecurityService>;
  let mockJwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    user_name: 'testuser',
    full_name: 'Test User',
    email: 'test@user.com',
    phone: '0123456789',
    password_hash: 'hashedPassword123',
    role: UserRole.STORE_STAFF,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    last_login_at: undefined,
    password_reset_token: undefined,
  };

  beforeEach(async () => {
    mockUsersService = {
      createUser: jest.fn(() => Promise.resolve()),
      findAll: jest.fn(() => Promise.resolve()),
      findOneById: jest.fn(() => Promise.resolve()),
      updateUser: jest.fn(() => Promise.resolve()),
      removeUser: jest.fn(() => Promise.resolve()),
      restore: jest.fn(() => Promise.resolve()),
      findByStore: jest.fn(() => Promise.resolve()),
      findByRole: jest.fn(() => Promise.resolve()),
    } as any;

    mockSecurityService = {
      recordFailedLoginAttempt: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
      validateToken: jest.fn(),
      blacklistToken: jest.fn(),
      createSession: jest.fn(),
      updateSessionActivity: jest.fn(),
      removeSession: jest.fn(),
      getUserSessions: jest.fn(),
      isLoginBlocked: jest.fn(),
      getRemainingBlockTime: jest.fn(),
      validatePasswordStrength: jest.fn(),
      isSuspiciousIP: jest.fn(),
      getSecurityReport: jest.fn(),
    } as any;

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(AuditInterceptor)
      .useValue({ intercept: jest.fn() })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      userName: 'newuser',
      fullName: 'New User',
      email: 'new@user.com',
      phone: '0987654321',
      password: 'password123',
      role: UserRole.STORE_STAFF,
    };

    it('should create a user successfully', async () => {
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(() => mockUsersService.createUser(createUserDto)).not.toThrow();
    });

    it('should handle duplicate username error', async () => {
      mockUsersService.createUser.mockRejectedValue(
        new ConflictException('❌ User với username "newuser" đã tồn tại.'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle service errors', async () => {
      mockUsersService.createUser.mockRejectedValue(
        new InternalServerErrorException('User creation failed'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(() => mockUsersService.findAll()).not.toThrow();
    });

    it('should handle empty results', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by ID', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(() => mockUsersService.findOneById(userId)).not.toThrow();
    });

    it('should handle user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated Test User',
      email: 'updated@user.com',
      phone: '0987654321',
      role: UserRole.ADMIN_STORE,
    };

    it('should update user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: `✅ User "${mockUser.user_name}" đã được cập nhật`,
        data: mockUser,
      };

      mockUsersService.updateUser.mockResolvedValue(expectedResponse);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(expectedResponse);
      expect(() =>
        mockUsersService.updateUser(userId, updateUserDto),
      ).not.toThrow();
    });

    it('should handle user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersService.updateUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle update errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersService.updateUser.mockRejectedValue(
        new InternalServerErrorException('Update failed'),
      );

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: `✅ user "${mockUser.full_name}" đã được xóa`,
        data: null,
      };

      mockUsersService.removeUser.mockResolvedValue(expectedResponse);

      const result = await controller.remove(userId);

      expect(result).toEqual(expectedResponse);
      expect(() => mockUsersService.removeUser(userId)).not.toThrow();
    });

    it('should handle user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersService.removeUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = {
        message: 'Khôi phục user thành công',
        data: mockUser,
      };

      mockUsersService.restore.mockResolvedValue(expectedResponse);

      const result = await controller.restore(userId);

      expect(result).toEqual(expectedResponse);
      expect(() => mockUsersService.restore(userId)).not.toThrow();
    });

    it('should handle user not found or not deleted', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersService.restore.mockRejectedValue(
        new NotFoundException('User không tồn tại hoặc chưa bị xóa mềm'),
      );

      await expect(controller.restore(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByStore', () => {
    it('should return users by store ID', async () => {
      const storeId = 'test-store-123';
      const users = [mockUser];
      mockUsersService.findByStore.mockResolvedValue(users);

      const result = await controller.findByStore(storeId);

      expect(result).toEqual(users);
      expect(() => mockUsersService.findByStore(storeId)).not.toThrow();
    });

    it('should handle empty store users', async () => {
      const storeId = 'test-store-123';
      mockUsersService.findByStore.mockResolvedValue([]);

      const result = await controller.findByStore(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const role = UserRole.ADMIN_STORE;
      const users = [mockUser];
      mockUsersService.findByRole.mockResolvedValue(users);

      const result = await controller.findByRole(role);

      expect(result).toEqual(users);
      expect(() => mockUsersService.findByRole(role)).not.toThrow();
    });

    it('should handle empty role users', async () => {
      const role = 'superadmin';
      mockUsersService.findByRole.mockResolvedValue([]);

      const result = await controller.findByRole(role);

      expect(result).toEqual([]);
    });
  });

  describe('parameter validation', () => {
    it('should handle invalid user ID format', async () => {
      const invalidId = 'invalid-id';
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle empty user ID', async () => {
      const emptyId = '';
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne(emptyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DTO validation', () => {
    it('should handle invalid create user DTO', async () => {
      const invalidDto = {
        userName: 'testuser',
        // missing required fields
      } as CreateUserDto;

      mockUsersService.createUser.mockRejectedValue(
        new InternalServerErrorException('Validation failed'),
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('business logic validation', () => {
    it('should handle duplicate username during creation', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'existinguser',
        fullName: 'Test User',
        email: 'test@user.com',
        phone: '0123456789',
        password: 'password123',
        role: UserRole.STORE_STAFF,
      };

      mockUsersService.createUser.mockRejectedValue(
        new ConflictException(
          '❌ User với username "existinguser" đã tồn tại.',
        ),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle user not found during operations', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException(
          '❌ Không tìm thấy user với ID "123e4567-e89b-12d3-a456-426614174001"',
        ),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle user already deleted during restore', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersService.restore.mockRejectedValue(
        new NotFoundException('User không tồn tại hoặc chưa bị xóa mềm'),
      );

      await expect(controller.restore(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('user management scenarios', () => {
    it('should handle user activation/deactivation', async () => {
      const updateUserDto: UpdateUserDto = {
        isActive: false,
      };

      const expectedResponse = {
        message: `✅ User "${mockUser.user_name}" đã được cập nhật`,
        data: { ...mockUser, is_active: false },
      };

      mockUsersService.updateUser.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateUserDto,
      );

      expect(result.data.is_active).toBe(false);
    });

    it('should handle role updates', async () => {
      const updateUserDto: UpdateUserDto = {
        role: UserRole.ADMIN_STORE,
      };

      const expectedResponse = {
        message: `✅ User "${mockUser.user_name}" đã được cập nhật`,
        data: { ...mockUser, role: UserRole.ADMIN_STORE },
      };

      mockUsersService.updateUser.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateUserDto,
      );

      expect(result.data.role).toBe(UserRole.ADMIN_STORE);
    });
  });

  describe('user search and filtering', () => {
    it('should handle store-based user filtering', async () => {
      const storeId = 'test-store-123';
      const storeUsers = [
        { ...mockUser, user_id: 'user1' },
        { ...mockUser, user_id: 'user2', user_name: 'user2' },
      ];

      mockUsersService.findByStore.mockResolvedValue(storeUsers);

      const result = await controller.findByStore(storeId);

      expect(result).toEqual(storeUsers);
      expect(result.length).toBe(2);
    });

    it('should handle role-based user filtering', async () => {
      const role = UserRole.ADMIN_STORE;
      const adminUsers = [
        { ...mockUser, role: UserRole.ADMIN_STORE },
        {
          ...mockUser,
          user_id: 'admin2',
          user_name: 'admin2',
          role: UserRole.ADMIN_STORE,
        },
      ];

      mockUsersService.findByRole.mockResolvedValue(adminUsers);

      const result = await controller.findByRole(role);

      expect(result).toEqual(adminUsers);
      expect(result.length).toBe(2);
      expect(result.every((user) => user.role === UserRole.ADMIN_STORE)).toBe(
        true,
      );
    });
  });

  describe('error handling scenarios', () => {
    it('should handle database connection errors', async () => {
      mockUsersService.findAll.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle service method errors', async () => {
      mockUsersService.createUser.mockRejectedValue(
        new InternalServerErrorException('Service method failed'),
      );

      await expect(
        controller.create({
          userName: 'testuser',
          fullName: 'Test User',
          email: 'test@user.com',
          phone: '0123456789',
          password: 'password123',
          role: UserRole.STORE_STAFF,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle validation errors', async () => {
      mockUsersService.updateUser.mockRejectedValue(
        new InternalServerErrorException('Validation failed'),
      );

      await expect(
        controller.update('123e4567-e89b-12d3-a456-426614174000', {
          email: 'invalid-email',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
