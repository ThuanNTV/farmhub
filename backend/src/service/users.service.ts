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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      await this.findOne(createUserDto.id);
      // Nếu không throw => người dùng đã tồn tại
      throw new ConflictException(
        `❌ User ID "${createUserDto.id}" đã tồn tại.`,
      );
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
    }
    // 🔐 Hash password
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }
    // Lưu người dùng mới
    const userToSave = {
      ...createUserDto,
      passwordHash: createUserDto.password, // Lưu hash
      role: UserRole.STORE_MANAGER,
    } as Omit<typeof createUserDto, 'password'> & { password?: string };
    delete userToSave.password;
    const saved = await this.usersRepo.save(userToSave);
    return {
      message: '✅ Tạo người dùng thành công',
      data: saved,
    };
  }

  async findAll() {
    return await this.usersRepo.find({
      where: { isActive: true, isDelete: false },
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id, isDelete: false },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Cập nhật thông tin người dùng
    const updated = this.usersRepo.merge(user, dto);
    const saved = await this.usersRepo.save(updated);

    return {
      message: `✅ Store "${saved.username}" đã được cập nhật`,
      data: saved,
    };
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    user.isDelete = true;
    await this.usersRepo.save(user);
    return {
      message: `✅ user với ID "${id}" đã được xóa`,
      data: null,
    };
  }
}
