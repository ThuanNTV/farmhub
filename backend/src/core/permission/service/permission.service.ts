import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/global/user.entity';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
    @InjectRepository(UserStoreMapping, 'globalConnection')
    private userStoreMappingsRepo: Repository<UserStoreMapping>,
  ) {}

  // Kiểm tra user có quyền cụ thể không (giả định quyền lưu trong user.role)
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    if (!permission) return false;
    const user = await this.usersRepo.findOne({
      where: { user_id: userId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN_GLOBAL') return true;
    if (user.role === permission) return true;
    return false;
  }

  // Lấy danh sách quyền của user (giả định theo role)
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.usersRepo.findOne({
      where: { user_id: userId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN_GLOBAL') return ['*'];
    return user.role ? [user.role] : [];
  }

  // Lấy danh sách mapping user-store
  async getUserStoreMappings(userId: string): Promise<UserStoreMapping[]> {
    return await this.userStoreMappingsRepo.find({
      where: { user_id: userId, is_deleted: false },
      relations: ['store'],
      order: { created_at: 'DESC' },
    });
  }

  // Kiểm tra user có quyền trên store cụ thể không (giả định quyền theo mapping)
  async validateUserStorePermission(
    userId: string,
    storeId: string,
    permission: string,
  ): Promise<boolean> {
    if (!permission) return false;
    const mapping = await this.userStoreMappingsRepo.findOne({
      where: { user_id: userId, store_id: storeId, is_deleted: false },
    });
    if (!mapping)
      throw new ForbiddenException('User không có quyền trên store này');
    if (mapping.role === 'ADMIN_GLOBAL') return true;
    if (mapping.role === permission) return true;
    return false;
  }
}
