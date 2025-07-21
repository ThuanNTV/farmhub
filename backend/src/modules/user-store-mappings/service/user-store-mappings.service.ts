import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';
import { UserStoreMappingResponseDto } from 'src/modules/user-store-mappings/dto/userStoreMapping-response.dto';
import {
  UserStoreMappingFilterDto,
  PaginatedUserStoreMappingResponseDto,
  UserStoreMappingStatsDto,
  PaginationMetaDto,
} from '../dto/user-store-mapping-filter.dto';
import {
  BulkCreateUserStoreMappingDto,
  BulkUpdateUserStoreMappingDto,
  BulkDeleteUserStoreMappingDto,
  BulkOperationResultDto,
} from '../dto/bulk-operations.dto';

@Injectable()
export class UserStoreMappingsService {
  private readonly logger = new Logger(UserStoreMappingsService.name);

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
    try {
      this.logger.log(`Finding mappings for user: ${userId}`);

      return await this.userStoreMappingsRepo.find({
        where: { user_id: userId, is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding mappings for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findByStoreId(storeId: string): Promise<UserStoreMapping[]> {
    try {
      this.logger.log(`Finding mappings for store: ${storeId}`);

      return await this.userStoreMappingsRepo.find({
        where: { store_id: storeId, is_deleted: false },
        relations: ['user', 'store'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding mappings for store ${storeId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
      role: createUserStoreMappingDto.role,
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
    if (updateUserStoreMappingDto.role !== undefined) {
      userStoreMapping.role = updateUserStoreMappingDto.role;
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

  async findOne(userId: string, storeId: string): Promise<UserStoreMapping> {
    const mapping = await this.userStoreMappingsRepo.findOne({
      where: { user_id: userId, store_id: storeId, is_deleted: false },
      relations: ['user', 'store'],
    });

    if (!mapping) {
      throw new NotFoundException(
        `User store mapping with user ID ${userId} and store ID ${storeId} not found`,
      );
    }

    return mapping;
  }

  /**
   * Find user store mappings with advanced filtering and pagination
   */
  async findWithFilters(
    filters: UserStoreMappingFilterDto,
  ): Promise<PaginatedUserStoreMappingResponseDto> {
    try {
      this.logger.log(
        `Finding user store mappings with filters: ${JSON.stringify(filters)}`,
      );

      const queryBuilder = this.createFilteredQueryBuilder(filters);

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      // Execute query
      const mappings = await queryBuilder.getMany();

      // Transform to response DTOs
      const data = mappings.map((mapping) => this.mapToResponseDto(mapping));

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const pagination: PaginationMetaDto = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      return {
        data,
        pagination,
        appliedFilters: filters,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error finding user store mappings with filters: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Create a filtered query builder based on provided filters
   */
  private createFilteredQueryBuilder(
    filters: UserStoreMappingFilterDto,
  ): SelectQueryBuilder<UserStoreMapping> {
    const queryBuilder = this.userStoreMappingsRepo
      .createQueryBuilder('mapping')
      .leftJoinAndSelect('mapping.user', 'user')
      .leftJoinAndSelect('mapping.store', 'store');

    // Base filter for deleted status
    if (!filters.includeDeleted) {
      queryBuilder.andWhere('mapping.is_deleted = :isDeleted', {
        isDeleted: false,
      });
    }

    // Filter by user ID
    if (filters.userId) {
      queryBuilder.andWhere('mapping.user_id = :userId', {
        userId: filters.userId,
      });
    }

    // Filter by multiple user IDs
    if (filters.userIds && filters.userIds.length > 0) {
      queryBuilder.andWhere('mapping.user_id IN (:...userIds)', {
        userIds: filters.userIds,
      });
    }

    // Filter by store ID
    if (filters.storeId) {
      queryBuilder.andWhere('mapping.store_id = :storeId', {
        storeId: filters.storeId,
      });
    }

    // Filter by multiple store IDs
    if (filters.storeIds && filters.storeIds.length > 0) {
      queryBuilder.andWhere('mapping.store_id IN (:...storeIds)', {
        storeIds: filters.storeIds,
      });
    }

    // Filter by role
    if (filters.role) {
      queryBuilder.andWhere('mapping.role = :role', { role: filters.role });
    }

    // Filter by multiple roles
    if (filters.roles && filters.roles.length > 0) {
      queryBuilder.andWhere('mapping.role IN (:...roles)', {
        roles: filters.roles,
      });
    }

    // Filter by date range
    if (filters.startDate) {
      queryBuilder.andWhere('mapping.created_at >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('mapping.created_at <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Search by user name or email
    if (filters.userSearch) {
      queryBuilder.andWhere(
        '(LOWER(user.full_name) LIKE LOWER(:userSearch) OR LOWER(user.email) LIKE LOWER(:userSearch) OR LOWER(user.username) LIKE LOWER(:userSearch))',
        { userSearch: `%${filters.userSearch}%` },
      );
    }

    // Search by store name
    if (filters.storeSearch) {
      queryBuilder.andWhere('LOWER(store.name) LIKE LOWER(:storeSearch)', {
        storeSearch: `%${filters.storeSearch}%`,
      });
    }

    // Apply sorting
    const sortBy = filters.sortBy ?? 'created_at';
    const sortOrder = filters.sortOrder ?? 'DESC';

    switch (sortBy as string) {
      case 'user_id':
        queryBuilder.orderBy('mapping.user_id', sortOrder as 'ASC' | 'DESC');
        break;
      case 'store_id':
        queryBuilder.orderBy('mapping.store_id', sortOrder as 'ASC' | 'DESC');
        break;
      case 'role':
        queryBuilder.orderBy('mapping.role', sortOrder as 'ASC' | 'DESC');
        break;
      case 'updated_at':
        queryBuilder.orderBy('mapping.updated_at', sortOrder as 'ASC' | 'DESC');
        break;
      default:
        queryBuilder.orderBy('mapping.created_at', sortOrder as 'ASC' | 'DESC');
    }

    return queryBuilder;
  }
}
