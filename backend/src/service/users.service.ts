import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/global/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UserRole } from 'src/dto/dtoUsers/create-user.dto';
import { UpdateUserDto } from 'src/dto/dtoUsers/update-user.dto';
import { UserResponseDto } from 'src/dto/dtoUsers/UserResponseDto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.findOneUsername(dto.username).catch(() => null);
    if (existing) {
      throw new ConflictException(`❌ Username "${dto.username}" đã tồn tại.`);
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const { lastLoginAt, tokenExpiryAt, ...rest } = dto;

    const userToSave: Partial<User> = {
      ...rest,
      userName: dto.username,
      passwordHash: hashedPassword,
      role: UserRole.STORE_MANAGER,
      isActive: true,
      isDeleted: false,
      ...(lastLoginAt ? { lastLoginAt: new Date(lastLoginAt) } : {}),
      ...(tokenExpiryAt ? { tokenExpiryAt: new Date(tokenExpiryAt) } : {}),
    };

    const saved = await this.usersRepo.save(userToSave);

    return {
      message: '✅ Tạo người dùng thành công',
      data: plainToInstance(UserResponseDto, saved, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findAll() {
    return await this.usersRepo.find({
      where: { isActive: true, isDeleted: false },
    });
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(
      usernameOrEmail,
    );

    if (isEmail) {
      return this.usersRepo.findOne({ where: { email: usernameOrEmail } });
    } else {
      return this.usersRepo.findOne({ where: { userName: usernameOrEmail } });
    }
  }

  async findOneUsername(userName: string) {
    const user = await this.usersRepo.findOne({
      where: { userName, isDeleted: false, isActive: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ${userName} not found`);
    }
    return user;
  }

  async findOneById(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { userId, isDeleted: false, isActive: true },
    });
    if (!user) {
      throw new NotFoundException(`User with userId ${userId} not found`);
    }
    return user;
  }

  async updateLastLogin(userId: string) {
    const user = await this.findOneById(userId);
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.fullName}" đã được cập nhập`,
      data: null,
    };
  }

  async updateResetToken(userId: string, resetToken: string) {
    const user = await this.findOneById(userId);
    user.passwordResetToken = resetToken;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.fullName}" đã được cập nhập`,
      data: null,
    };
  }

  async updatePassword(userId: string, passwordHash: string) {
    const user = await this.findOneById(userId);
    user.passwordHash = passwordHash;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.fullName}" đã được cập nhập`,
      data: null,
    };
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.findOneById(userId);

    // Cập nhật thông tin người dùng
    // Omit 'role' from dto to avoid type incompatibility
    const { role: _role, ...dtoWithoutRole } = dto;
    const updated = this.usersRepo.merge(user, dtoWithoutRole);
    const saved = await this.usersRepo.save(updated);

    return {
      message: `✅ Store "${saved.userName}" đã được cập nhật`,
      data: saved,
    };
  }

  async remove(userId: string) {
    const user = await this.findOneById(userId);
    user.isDeleted = true;
    await this.usersRepo.save(user);
    return {
      message: `✅ user "${user.fullName}" đã được xóa`,
      data: null,
    };
  }
}
