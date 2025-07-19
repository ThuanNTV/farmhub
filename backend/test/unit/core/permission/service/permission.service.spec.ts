import { PermissionService } from '@core/permission/service/permission.service';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto, UserRole } from '@modules/users/dto/create-user.dto';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';

describe('PermissionService', () => {
  let service: PermissionService;
  let usersRepo: jest.Mocked<Repository<User>>;
  let userStoreMappingsRepo: jest.Mocked<Repository<UserStoreMapping>>;

  beforeEach(() => {
    usersRepo = { findOne: jest.fn() } as any;
    userStoreMappingsRepo = { find: jest.fn(), findOne: jest.fn() } as any;
    service = new PermissionService(usersRepo, userStoreMappingsRepo);
  });

  describe('hasPermission', () => {
    it('trả về false nếu không có permission', async () => {
      await expect(service.hasPermission('u1', '')).resolves.toBe(false);
    });
    it('ném lỗi nếu không tìm thấy user', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.hasPermission('u1', 'ADMIN')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('trả về true nếu user là ADMIN_GLOBAL', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: UserRole.ADMIN_GLOBAL,
      } as User);
      await expect(service.hasPermission('u1', 'admin_global')).resolves.toBe(
        true,
      );
    });
    it('trả về true nếu user có đúng role', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: UserRole.ADMIN_GLOBAL,
      } as User);
      await expect(service.hasPermission('u1', 'admin_global')).resolves.toBe(
        true,
      );
    });
    it('trả về false nếu user không có quyền', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: UserRole.STORE_MANAGER,
      } as User);
      await expect(
        service.hasPermission('u1', UserRole.ADMIN_STORE),
      ).resolves.toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('ném lỗi nếu không tìm thấy user', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.getUserPermissions('u1')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('trả về [*] nếu user là ADMIN_GLOBAL', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: UserRole.ADMIN_GLOBAL,
      } as User);
      await expect(service.getUserPermissions('u1')).resolves.toEqual([
        UserRole.ADMIN_GLOBAL,
      ]);
    });
    it('trả về [role] nếu user có role', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: UserRole.ADMIN_STORE,
      } as User);
      await expect(service.getUserPermissions('u1')).resolves.toEqual([
        UserRole.ADMIN_STORE,
      ]);
    });
    it('trả về [] nếu user không có role', async () => {
      usersRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        email: 'a@a.com',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        role: undefined,
      } as User);
      await expect(service.getUserPermissions('u1')).resolves.toEqual([]);
    });
  });

  describe('getUserStoreMappings', () => {
    it('trả về danh sách mapping', async () => {
      userStoreMappingsRepo.find.mockResolvedValue([{ id: 1 } as any]);
      const result = await service.getUserStoreMappings('u1');
      expect(result).toEqual([{ id: 1 }]);
      expect(userStoreMappingsRepo.find).toHaveBeenCalled();
    });
  });

  describe('validateUserStorePermission', () => {
    it('trả về false nếu không có permission', async () => {
      await expect(
        service.validateUserStorePermission('u1', 's1', ''),
      ).resolves.toBe(false);
    });
    it('ném lỗi nếu không có mapping', async () => {
      userStoreMappingsRepo.findOne.mockResolvedValue(null);
      await expect(
        service.validateUserStorePermission('u1', 's1', 'ADMIN'),
      ).rejects.toThrow(ForbiddenException);
    });
    it('trả về true nếu mapping là ADMIN_GLOBAL', async () => {
      userStoreMappingsRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        store_id: 's1',
        user: {} as any,
        store: {} as any,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        role: UserRole.ADMIN_GLOBAL,
      } as UserStoreMapping);
      await expect(
        service.validateUserStorePermission('u1', 's1', UserRole.ADMIN_GLOBAL),
      ).resolves.toBe(true);
    });
    it('trả về true nếu mapping có đúng role', async () => {
      userStoreMappingsRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        store_id: 's1',
        user: {} as any,
        store: {} as any,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        role: UserRole.ADMIN_STORE,
      } as UserStoreMapping);
      await expect(
        service.validateUserStorePermission('u1', 's1', UserRole.ADMIN_STORE),
      ).resolves.toBe(true);
    });
    it('trả về false nếu mapping không có quyền', async () => {
      userStoreMappingsRepo.findOne.mockResolvedValue({
        user_id: 'u1',
        store_id: 's1',
        user: {} as any,
        store: {} as any,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        role: UserRole.STORE_STAFF,
      } as UserStoreMapping);
      await expect(
        service.validateUserStorePermission('u1', 's1', UserRole.ADMIN_STORE),
      ).resolves.toBe(false);
    });
  });
});
