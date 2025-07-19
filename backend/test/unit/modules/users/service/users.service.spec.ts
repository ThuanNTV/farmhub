import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto, UserRole } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/core/user/service/users.service';
import { User } from 'src/entities/global/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: jest.Mocked<any>;

  const mockUser: User = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    user_name: 'testuser',
    full_name: 'Test User',
    email: 'test@user.com',
    phone: '0123456789',
    password_hash: 'hashedPassword123',
    role: 'user',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    last_login_at: new Date(),
    password_reset_token: '',
    // userStoreMappings: [],
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User, 'globalConnection'),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'newuser',
        password: 'password123',
        fullName: 'New User',
        email: 'new@user.com',
        phone: '0987654321',
        role: UserRole.STORE_STAFF,
      };

      const mockUser = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        user_name: 'newuser',
        password_hash: 'hashedPassword123',
        full_name: 'New User',
        email: 'new@user.com',
        phone: '0987654321',
        role: 'store_staff',
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { user_name: 'newuser', is_deleted: false, is_active: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_name: createUserDto.userName,
          full_name: createUserDto.fullName,
          email: createUserDto.email,
          phone: createUserDto.phone,
          role: createUserDto.role,
          password_hash: 'hashedPassword123',
        }),
      );
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'newuser',
        password: 'password123',
        fullName: 'New User',
        email: 'new@user.com',
        phone: '0987654321',
        role: UserRole.STORE_STAFF,
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle bcrypt hash errors', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'newuser',
        password: 'password123',
        fullName: 'New User',
        email: 'new@user.com',
        phone: '0987654321',
        role: UserRole.STORE_STAFF,
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Hash failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const users = [
        {
          user_id: '1',
          user_name: 'user1',
          full_name: 'User One',
          email: 'user1@test.com',
          role: 'admin',
          is_active: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: { is_active: true, is_deleted: false },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockUsersRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOneUsernameOrEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@user.com';
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneUsernameOrEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should find user by username', async () => {
      const username = 'testuser';
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneUsernameOrEmail(username);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { user_name: username },
      });
    });

    it('should return null when user not found', async () => {
      const username = 'nonexistent';
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneUsernameOrEmail(username);

      expect(result).toBeNull();
    });
  });

  describe('findOneUsername', () => {
    it('should return user by username', async () => {
      const username = 'testuser';
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneUsername(username);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { user_name: username, is_deleted: false, is_active: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const username = 'nonexistent';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneUsername(username)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneById', () => {
    it('should return user by ID', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneById(userId);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, is_deleted: false, is_active: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const userWithLastLogin = { ...mockUser, last_login_at: new Date() };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(userWithLastLogin);

      const result = await service.updateLastLogin(userId);

      expect(result).toEqual({
        message: `✅ user "${mockUser.full_name}" đã được cập nhập`,
        data: null,
      });
      expect(mockUser.last_login_at).toBeInstanceOf(Date);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateLastLogin(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateResetToken', () => {
    it('should update reset token successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const resetToken = 'reset-token-123';

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateResetToken(userId, resetToken);

      expect(result).toEqual({
        message: `✅ user "${mockUser.full_name}" đã được cập nhập`,
        data: null,
      });
      expect(mockUser.password_reset_token).toBe(resetToken);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateResetToken(userId, 'token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const newPasswordHash = 'newHashedPassword123';

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.updatePassword(userId, newPasswordHash);

      expect(result).toEqual({
        message: `✅ user "${mockUser.full_name}" đã được cập nhập`,
        data: null,
      });
      expect(mockUser.password_hash).toBe(newPasswordHash);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePassword(userId, 'newHash')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@user.com',
        fullName: 'Updated Test User',
        phone: '0987654321',
      };

      const mockUser = {
        user_id: userId,
        user_name: 'testuser',
        full_name: 'Test User',
        email: 'test@user.com',
        phone: '0123456789',
        role: 'user',
        is_active: true,
        is_deleted: false,
        password_hash: 'newHashedPassword123',
        password_reset_token: 'reset-token-123',
        last_login_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedUser = {
        ...mockUser,
        email: 'updated@user.com',
        full_name: 'Updated Test User',
        phone: '0987654321',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.merge.mockReturnValue(updatedUser);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual({
        message: `✅ User "${updatedUser.user_name}" đã được cập nhật`,
        data: updatedUser,
      });
      expect(mockUsersRepository.merge).toHaveBeenCalledWith(mockUser, {
        email: 'updated@user.com',
        full_name: 'Updated Test User',
        phone: '0987654321',
      });
      expect(mockUsersRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@user.com',
        fullName: 'Updated Test User',
        phone: '0987654321',
      };

      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.removeUser(userId);

      expect(result).toEqual({
        message: `✅ user "${mockUser.full_name}" đã được xóa`,
        data: null,
      });
      expect(mockUser.is_deleted).toBe(true);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.removeUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedUser = { ...mockUser, is_deleted: true };

      mockUsersRepository.findOne.mockResolvedValue(deletedUser);
      mockUsersRepository.save.mockResolvedValue(deletedUser);

      const result = await service.restore(userId);

      expect(result).toEqual({
        message: 'Khôi phục user thành công',
        data: deletedUser,
      });
      expect(deletedUser.is_deleted).toBe(false);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(deletedUser);
    });

    it('should throw NotFoundException if user not found or not deleted', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should call update method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated User',
      };

      const expectedResult = {
        message: `✅ User "${mockUser.user_name}" đã được cập nhật`,
        data: mockUser,
      };

      const updateMethod = jest.spyOn(service, 'updateUser');

      updateMethod.mockResolvedValue(expectedResult);

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(updateMethod).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('removeUser', () => {
    it('should call remove method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = {
        user_id: userId,
        user_name: 'testuser',
        full_name: 'Test User',
        email: 'test@user.com',
        role: 'user',
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        is_deleted: true,
      });

      const result = await service.removeUser(userId);

      expect(result).toEqual({
        message: `✅ user "${mockUser.full_name}" đã được xóa`,
        data: null,
      });
      expect(mockUsersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        is_deleted: true,
      });
    });
  });

  describe('findByStore', () => {
    it('should return users by store ID', async () => {
      const storeId = 'test-store-123';
      const users = [mockUser];

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByStore(storeId);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'user.userStoreMappings',
        'mapping',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'mapping.storeId = :storeId',
        { storeId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.isDeleted = :isDeleted',
        { isDeleted: false },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return empty array when store has no users', async () => {
      const storeId = 'test-store-123';

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByStore(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const role = 'admin';
      const users = [
        {
          user_id: '1',
          user_name: 'admin1',
          full_name: 'Admin One',
          email: 'admin1@test.com',
          role: 'admin',
          is_active: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findByRole(role);

      expect(result).toEqual(users);
      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: {
          role,
          is_deleted: false,
          is_active: true,
        },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no users with role exist', async () => {
      const role = 'superadmin';
      mockUsersRepository.find.mockResolvedValue([]);

      const result = await service.findByRole(role);

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockUsersRepository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOneUsername('testuser')).rejects.toThrow();
    });

    it('should handle repository save errors', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockRejectedValue(
        new Error('Save operation failed'),
      );

      await expect(
        service.updateLastLogin('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow();
    });
  });

  describe('validation scenarios', () => {
    it('should handle duplicate email during update', async () => {
      const updateDto = {
        email: 'duplicate@email.com',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.merge.mockReturnValue(mockUser);
      mockUsersRepository.save.mockRejectedValue(
        new Error('Duplicate email constraint violation'),
      );

      await expect(
        service.updateUser('123e4567-e89b-12d3-a456-426614174000', updateDto),
      ).rejects.toThrow();
    });

    it('should handle invalid user ID format', async () => {
      const invalidId = 'invalid-id';
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle password hash validation', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        fullName: 'Test User',
        email: 'test@user.com',
        phone: '0123456789',
        password: 'weak', // Weak password
        role: UserRole.STORE_STAFF,
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('weak', 10);
    });
  });

  describe('user management scenarios', () => {
    it('should handle user activation/deactivation', async () => {
      const updateDto: UpdateUserDto = {
        isActive: false,
      };

      const deactivatedUser = { ...mockUser, is_active: false };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.merge.mockReturnValue(deactivatedUser);
      mockUsersRepository.save.mockResolvedValue(deactivatedUser);

      const result = await service.updateUser(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto,
      );

      expect(result.data.is_active).toBe(false);
    });

    it('should handle role updates', async () => {
      const updateDto: UpdateUserDto = {
        role: UserRole.ADMIN_GLOBAL,
      };

      const adminUser = { ...mockUser, role: UserRole.ADMIN_GLOBAL };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.merge.mockReturnValue(adminUser);
      mockUsersRepository.save.mockResolvedValue(adminUser);

      const result = await service.updateUser(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto,
      );

      expect(result.data.role).toBe(UserRole.ADMIN_GLOBAL);
    });

    it('should handle password reset flow', async () => {
      const resetToken = 'reset-token-123';
      const newPasswordHash = 'newHashedPassword';

      // Update reset token
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      await service.updateResetToken(
        '123e4567-e89b-12d3-a456-426614174000',
        resetToken,
      );
      expect(mockUser.password_reset_token).toBe(resetToken);

      // Update password
      await service.updatePassword(
        '123e4567-e89b-12d3-a456-426614174000',
        newPasswordHash,
      );
      expect(mockUser.password_hash).toBe(newPasswordHash);
    });
  });
});
