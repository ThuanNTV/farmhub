import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { UserStoreMappingResponseDto } from 'src/modules/user-store-mappings/dto/userStoreMapping-response.dto';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';

@Injectable()
export class UserStoreMappingsService {
  constructor(
    @InjectRepository(UserStoreMapping, 'globalConnection')
    private userStoreMappingsRepo: Repository<UserStoreMapping>,
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
    @InjectRepository(Store, 'globalConnection')
    private storesRepo: Repository<Store>,
  ) {}

  async findByUserAndStore(
    userId: string,
    storeId: string,
  ): Promise<UserStoreMapping | null> {
    return await this.userStoreMappingsRepo.findOne({
      where: { user_id: userId, store_id: storeId, is_deleted: false },
    });
  }

  async findByUserId(userId: string): Promise<UserStoreMapping[]> {
    return await this.userStoreMappingsRepo.find({
      where: { user_id: userId, is_deleted: false },
      relations: ['store'],
      order: { created_at: 'DESC' },
    });
  }

  async findByStoreId(storeId: string): Promise<UserStoreMapping[]> {
    return await this.userStoreMappingsRepo.find({
      where: { store_id: storeId, is_deleted: false },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  mapToResponseDto(entity: UserStoreMapping): UserStoreMappingResponseDto {
    return {
      userId: entity.user_id,
      storeId: entity.store_id,
      role: entity.role,
      createdAt: entity.created_at,
      createdByUserId: entity.created_by_user_id,
    };
  }

  async validateForeignKeys(dto: {
    userId: string;
    store_id: string;
  }): Promise<void> {
    // Validate user exists
    const user = await this.usersRepo.findOne({
      where: { user_id: dto.userId, is_deleted: false },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }
    // Validate store exists
    const store = await this.storesRepo.findOne({
      where: { store_id: dto.store_id, is_deleted: false },
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${dto.store_id} not found`);
    }
  }

  async validateUniqueConstraint(
    userId: string,
    storeId: string,
  ): Promise<void> {
    const existingMapping = await this.userStoreMappingsRepo.findOne({
      where: { user_id: userId, store_id: storeId, is_deleted: false },
    });
    if (existingMapping) {
      throw new ConflictException(
        `User store mapping already exists for user ${userId} and store ${storeId}`,
      );
    }
  }

  async create(
    storeId: string,
    createUserStoreMappingDto: CreateUserStoreMappingDto,
  ) {
    await this.validateForeignKeys({
      userId: createUserStoreMappingDto.userId,
      store_id: createUserStoreMappingDto.storeId,
    });
    await this.validateUniqueConstraint(
      createUserStoreMappingDto.userId,
      createUserStoreMappingDto.storeId,
    );
    const userStoreMapping = this.userStoreMappingsRepo.create({
      user_id: createUserStoreMappingDto.userId,
      store_id: createUserStoreMappingDto.storeId,
      created_by_user_id: createUserStoreMappingDto.createdByUserId,
    });
    return await this.userStoreMappingsRepo.save(userStoreMapping);
  }

  async update(
    userId: string,
    storeId: string,
    updateUserStoreMappingDto: UpdateUserStoreMappingDto,
  ) {
    const userStoreMapping = await this.findByUserAndStore(userId, storeId);
    if (!userStoreMapping) {
      throw new NotFoundException(
        `User store mapping with user ID ${userId} and store ID ${storeId} not found`,
      );
    }
    if (updateUserStoreMappingDto.userId || updateUserStoreMappingDto.storeId) {
      await this.validateForeignKeys({
        userId: updateUserStoreMappingDto.userId ?? userStoreMapping.user_id,
        store_id:
          updateUserStoreMappingDto.storeId ?? userStoreMapping.store_id,
      });
    }
    if (updateUserStoreMappingDto.userId) {
      userStoreMapping.user_id = updateUserStoreMappingDto.userId;
    }
    if (updateUserStoreMappingDto.storeId) {
      userStoreMapping.store_id = updateUserStoreMappingDto.storeId;
    }
    userStoreMapping.updated_at = new Date();
    return await this.userStoreMappingsRepo.save(userStoreMapping);
  }

  async remove(userId: string, storeId: string) {
    const userStoreMapping = await this.findByUserAndStore(userId, storeId);
    if (!userStoreMapping) {
      throw new NotFoundException(
        `User store mapping with user ID ${userId} and store ID ${storeId} not found`,
      );
    }
    userStoreMapping.is_deleted = true;
    userStoreMapping.deleted_at = new Date();
    await this.userStoreMappingsRepo.save(userStoreMapping);
    return {
      message: `✅ User store mapping với user ID "${userId}" và store ID "${storeId}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(userId: string, storeId: string) {
    const userStoreMapping = await this.userStoreMappingsRepo.findOne({
      where: { user_id: userId, store_id: storeId, is_deleted: true },
    });
    if (!userStoreMapping) {
      throw new NotFoundException(
        `Deleted user store mapping with user ID ${userId} and store ID ${storeId} not found`,
      );
    }
    userStoreMapping.is_deleted = false;
    userStoreMapping.deleted_at = undefined;
    userStoreMapping.updated_at = new Date();
    return await this.userStoreMappingsRepo.save(userStoreMapping);
  }

  async findAll() {
    return await this.userStoreMappingsRepo.find({
      where: { is_deleted: false },
      relations: ['user', 'store'],
      order: { created_at: 'DESC' },
    });
  }
}
