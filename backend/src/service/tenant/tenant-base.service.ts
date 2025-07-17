// src/common/tenant-base.service.ts
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import {
  ObjectLiteral,
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  UpdateResult,
  DeleteResult,
} from 'typeorm';

export abstract class TenantBaseService<T extends ObjectLiteral> {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * The primary key field name for the entity.
   * Subclasses must set this property.
   */
  protected abstract primaryKey: string;

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
    private readonly entity: new () => T, // Entity class
  ) {
    // Validate dependencies
    if (!tenantDataSourceService) {
      throw new Error('TenantDataSourceService is required');
    }
    if (!entity) {
      throw new Error('Entity class is required');
    }
  }

  // 🔧 IMPROVED: Better error handling and validation
  protected async getRepo(storeId: string): Promise<Repository<T>> {
    // Validate storeId
    if (!storeId || storeId.trim() === '') {
      throw new BadRequestException('Store ID không được để trống');
    }

    // Validate dependencies
    if (!this.tenantDataSourceService) {
      throw new InternalServerErrorException(
        'TenantDataSourceService không được khởi tạo',
      );
    }

    // Validate entity
    if (!this.entity) {
      throw new InternalServerErrorException(
        'Entity class không được định nghĩa',
      );
    }

    try {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);

      if (!dataSource) {
        throw new InternalServerErrorException(
          `Không thể lấy data source cho store "${storeId}"`,
        );
      }

      if (!dataSource.isInitialized) {
        throw new InternalServerErrorException(
          `Kết nối CSDL cho store "${storeId}" chưa được khởi tạo`,
        );
      }

      if (typeof dataSource.getRepository !== 'function') {
        throw new InternalServerErrorException(
          `Data source không có method getRepository`,
        );
      }

      const repository = dataSource.getRepository(this.entity);

      if (!repository) {
        throw new InternalServerErrorException(
          `Không thể lấy repository cho entity "${this.getEntityName()}"`,
        );
      }

      return repository;
    } catch (error) {
      // 🚨 Re-throw specific exceptions from tenantDataSourceService
      if (error instanceof NotFoundException) {
        this.logger.warn(`Store not found: ${storeId}`);
        throw new NotFoundException(`❌ Store "${storeId}" không tồn tại`);
      }

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error; // Re-throw our custom errors
      }

      // 🔍 Log unexpected errors with context
      this.logger.error(`Failed to get repository for store: ${storeId}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        storeId,
        entityName: this.getEntityName(),
        hasEntity: !!this.entity,
        hasDataSource: !!this.tenantDataSourceService,
      });

      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  // 🎯 BONUS: Common CRUD operations

  /**
   * Find entity by ID in specific tenant
   */
  protected async findById(
    storeId: string,
    id: string | number,
  ): Promise<T | null> {
    if (!this.primaryKey) {
      throw new Error(
        `${this.constructor.name} is missing 'primaryKey'. Please define it.`,
      );
    }

    try {
      const repo = await this.getRepo(storeId);
      return await repo.findOne({
        where: { [this.primaryKey]: id } as FindOptionsWhere<T>,
      });
    } catch (error) {
      this.logger.error(
        `❌ [${this.constructor.name}] Failed to find entity by ${this.primaryKey}=${id} in store ${storeId}`,
      );
      if (error instanceof Error) {
        this.logger.error(error.stack ?? error.message);
      } else {
        this.logger.error(String(error));
      }

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Find entity by ID or throw NotFoundException
   */
  protected async findByIdOrFail(
    storeId: string,
    id: string | number,
  ): Promise<T> {
    const entity = await this.findById(storeId, id);

    if (!entity) {
      throw new NotFoundException(
        `${this.getEntityName()} với ID "${id}" không tồn tại`,
      );
    }

    return entity;
  }

  /**
   * Find all entities with options
   */
  protected async findAll(
    storeId: string,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.find(options);
    } catch (error) {
      this.logger.error(`Failed to find entities in store: ${storeId}`, error);

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Count entities
   */
  protected async count(
    storeId: string,
    where?: FindOptionsWhere<T>,
  ): Promise<number> {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.count({ where });
    } catch (error) {
      this.logger.error(`Failed to count entities in store: ${storeId}`, error);

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Create new entity
   */
  protected async create(
    storeId: string,
    entityData: import('typeorm').DeepPartial<T>,
  ): Promise<T> {
    try {
      const repo = await this.getRepo(storeId);
      const entity = repo.create(entityData);
      return await repo.save(entity);
    } catch (error) {
      this.logger.error(`Failed to create entity in store: ${storeId}`, {
        error: error instanceof Error ? error.message : String(error),
        entityData,
      });

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Update entity by ID
   */
  protected async updateById(
    storeId: string,
    id: string | number,
    updateData: Partial<T>,
  ): Promise<UpdateResult> {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.update(id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update entity ${id} in store: ${storeId}`, {
        error: error instanceof Error ? error.message : String(error),
        updateData,
      });

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Delete entity by ID
   */
  protected async deleteById(
    storeId: string,
    id: string | number,
  ): Promise<DeleteResult> {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.delete(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete entity ${id} in store: ${storeId}`,
        error,
      );

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Soft delete entity by ID (if entity supports soft delete)
   */
  protected async softDeleteById(
    storeId: string,
    id: string | number,
  ): Promise<UpdateResult> {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.softDelete(id);
    } catch (error) {
      this.logger.error(
        `Failed to soft delete entity ${id} in store: ${storeId}`,
        error,
      );

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Check if entity exists
   */
  protected async exists(
    storeId: string,
    where: FindOptionsWhere<T>,
  ): Promise<boolean> {
    try {
      const repo = await this.getRepo(storeId);
      const count = await repo.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check entity existence in store: ${storeId}`,
        error,
      );

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  /**
   * Execute custom query with repository
   */
  protected async executeWithRepo<R>(
    storeId: string,
    callback: (repo: Repository<T>) => Promise<R>,
  ): Promise<R> {
    try {
      const repo = await this.getRepo(storeId);
      return await callback(repo);
    } catch (error) {
      this.logger.error(
        `Failed to execute custom query in store: ${storeId}`,
        error,
      );

      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Wrap repository errors
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  // 🔧 UTILITY METHODS

  /**
   * Validate store ID format (override in child classes if needed)
   */
  protected validateStoreId(storeId: string): void {
    if (!storeId || typeof storeId !== 'string') {
      throw new BadRequestException('Store ID phải là chuỗi không rỗng');
    }

    // Example: validate store ID format (store-001, store-002, etc.)
    const storeIdPattern = /^store-\d{3}$/;
    if (!storeIdPattern.test(storeId)) {
      throw new BadRequestException(
        'Store ID không đúng định dạng (vd: store-001)',
      );
    }
  }

  /**
   * Get entity name for logging/error messages
   */
  protected getEntityName(): string {
    return (this.entity as any).entityName || this.entity.name;
  }
}
