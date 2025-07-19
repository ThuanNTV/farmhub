import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/global/user.entity';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
  ) {}

  async findOneUsernameOrEmail(usernameOrEmail: string) {
    if (usernameOrEmail.includes('@')) {
      return this.usersRepo.findOne({ where: { email: usernameOrEmail } });
    } else {
      return this.usersRepo.findOne({ where: { user_name: usernameOrEmail } });
    }
  }

  async findOneUsername(userName: string) {
    const user = await this.usersRepo.findOne({
      where: { user_name: userName, is_deleted: false, is_active: true },
    });
    if (!user) {
      throw new NotFoundException(
        `❌ Không tìm thấy user với username "${userName}"`,
      );
    }
    return user;
  }

  async findOneById(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { user_id: userId, is_deleted: false, is_active: true },
    });
    if (!user) {
      throw new NotFoundException(`❌ Không tìm thấy user với ID "${userId}"`);
    }
    return user;
  }

  async updateLastLogin(userId: string) {
    const user = await this.findOneById(userId);
    user.last_login_at = new Date();
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.full_name}" đã được cập nhập`,
      data: null,
    };
  }

  async updateResetToken(userId: string, resetToken: string) {
    const user = await this.findOneById(userId);
    user.password_reset_token = resetToken;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.full_name}" đã được cập nhập`,
      data: null,
    };
  }

  async updatePassword(userId: string, passwordHash: string) {
    const user = await this.findOneById(userId);
    user.password_hash = passwordHash;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.full_name}" đã được cập nhập`,
      data: null,
    };
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.findOneUsername(dto.userName).catch(() => null);
    if (existing) {
      throw new ConflictException(
        `❌ User với username "${dto.userName}" đã tồn tại.`,
      );
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const entityData = DtoMapper.mapToEntity<any>(
      dto as unknown as Record<string, unknown>,
    );
    const user = this.usersRepo.create({
      ...entityData,
      password_hash: passwordHash,
    });
    return await this.usersRepo.save(user);
  }

  async findAll() {
    return await this.usersRepo.find({
      where: { is_active: true, is_deleted: false },
      order: { created_at: 'DESC' },
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(userId);
    const entityData = DtoMapper.mapToEntity<any>(
      updateUserDto as unknown as Record<string, unknown>,
    );
    const updated = this.usersRepo.merge(user, entityData);
    const saved = await this.usersRepo.save(updated);
    return {
      message: `✅ User "${saved.user_name}" đã được cập nhật`,
      data: saved,
    };
  }

  async removeUser(userId: string) {
    const user = await this.findOneById(userId);
    user.is_deleted = true;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.full_name}" đã được xóa`,
      data: null,
    };
  }

  async restore(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { user_id: userId, is_deleted: true },
    });
    if (!user) {
      throw new NotFoundException('User không tồn tại hoặc chưa bị xóa mềm');
    }
    user.is_deleted = false;
    await this.usersRepo.save(user);
    return {
      message: 'Khôi phục user thành công',
      data: user,
    };
  }

  async findByStore(storeId: string) {
    return await this.usersRepo
      .createQueryBuilder('user')
      .innerJoin('user.userStoreMappings', 'mapping')
      .where('mapping.storeId = :storeId', { storeId })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findByRole(role: string) {
    return await this.usersRepo.find({
      where: {
        role,
        is_deleted: false,
        is_active: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  // TODO: Di chuyển các hàm CRUD đặc thù nghiệp vụ hoặc các hàm còn lại nếu cần
}
