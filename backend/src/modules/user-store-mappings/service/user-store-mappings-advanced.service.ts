import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import {
  BulkCreateUserStoreMappingDto,
  BulkUpdateUserStoreMappingDto,
  BulkDeleteUserStoreMappingDto,
  BulkOperationResultDto,
} from '../dto/bulk-operations.dto';
import { UserStoreMappingStatsDto } from '../dto/user-store-mapping-filter.dto';

@Injectable()
export class UserStoreMappingsAdvancedService {
  private readonly logger = new Logger(UserStoreMappingsAdvancedService.name);

  constructor(
    @InjectRepository(UserStoreMapping, 'globalConnection')
    private userStoreMappingsRepo: Repository<UserStoreMapping>,
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
    @InjectRepository(Store, 'globalConnection')
    private storesRepo: Repository<Store>,
  ) {}

  /**
   * Bulk create user store mappings
   */
  async bulkCreate(
    dto: BulkCreateUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    const startTime = Date.now();
    this.logger.log(
      `Starting bulk create operation for ${dto.mappings.length} mappings`,
    );

    const result: BulkOperationResultDto = {
      successCount: 0,
      failureCount: 0,
      totalCount: dto.mappings.length,
      successDetails: [],
      failureDetails: [],
      completedAt: new Date(),
    };

    for (const mapping of dto.mappings) {
      try {
        // Validate foreign keys
        await this.validateForeignKeys(mapping.userId, mapping.storeId);

        // Check for existing mapping if not skipping validation
        if (!dto.skipExistingValidation) {
          const existing = await this.userStoreMappingsRepo.findOne({
            where: {
              user_id: mapping.userId,
              store_id: mapping.storeId,
              is_deleted: false,
            },
          });

          if (existing) {
            throw new Error('Mapping already exists');
          }
        }

        // Create mapping
        const newMapping = this.userStoreMappingsRepo.create({
          user_id: mapping.userId,
          store_id: mapping.storeId,
          role: mapping.role,
          created_by_user_id: 'system', // TODO: Get from context
        });

        await this.userStoreMappingsRepo.save(newMapping);

        result.successCount++;
        result.successDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'success',
          message: 'Mapping created successfully',
        });
      } catch (error) {
        result.failureCount++;
        result.failureDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    result.durationMs = Date.now() - startTime;
    this.logger.log(
      `Bulk create completed: ${result.successCount} success, ${result.failureCount} failures`,
    );

    return result;
  }

  /**
   * Bulk update user store mappings
   */
  async bulkUpdate(
    dto: BulkUpdateUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    const startTime = Date.now();
    this.logger.log(
      `Starting bulk update operation for ${dto.mappings.length} mappings`,
    );

    const result: BulkOperationResultDto = {
      successCount: 0,
      failureCount: 0,
      totalCount: dto.mappings.length,
      successDetails: [],
      failureDetails: [],
      completedAt: new Date(),
    };

    for (const mapping of dto.mappings) {
      try {
        // Find existing mapping
        const existing = await this.userStoreMappingsRepo.findOne({
          where: {
            user_id: mapping.userId,
            store_id: mapping.storeId,
            is_deleted: false,
          },
        });

        if (!existing) {
          throw new Error('Mapping not found');
        }

        // Update fields
        if (mapping.role !== undefined) {
          existing.role = mapping.role;
        }

        existing.updated_at = new Date();
        await this.userStoreMappingsRepo.save(existing);

        result.successCount++;
        result.successDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'success',
          message: 'Mapping updated successfully',
        });
      } catch (error) {
        result.failureCount++;
        result.failureDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    result.durationMs = Date.now() - startTime;
    this.logger.log(
      `Bulk update completed: ${result.successCount} success, ${result.failureCount} failures`,
    );

    return result;
  }

  /**
   * Bulk delete user store mappings
   */
  async bulkDelete(
    dto: BulkDeleteUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    const startTime = Date.now();
    this.logger.log(
      `Starting bulk delete operation for ${dto.mappings.length} mappings`,
    );

    const result: BulkOperationResultDto = {
      successCount: 0,
      failureCount: 0,
      totalCount: dto.mappings.length,
      successDetails: [],
      failureDetails: [],
      completedAt: new Date(),
    };

    for (const mapping of dto.mappings) {
      try {
        const existing = await this.userStoreMappingsRepo.findOne({
          where: {
            user_id: mapping.userId,
            store_id: mapping.storeId,
            is_deleted: false,
          },
        });

        if (!existing) {
          throw new Error('Mapping not found');
        }

        if (dto.hardDelete) {
          await this.userStoreMappingsRepo.remove(existing);
        } else {
          existing.is_deleted = true;
          existing.deleted_at = new Date();
          await this.userStoreMappingsRepo.save(existing);
        }

        result.successCount++;
        result.successDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'success',
          message: dto.hardDelete
            ? 'Mapping permanently deleted'
            : 'Mapping soft deleted',
        });
      } catch (error) {
        result.failureCount++;
        result.failureDetails?.push({
          userId: mapping.userId,
          storeId: mapping.storeId,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    result.durationMs = Date.now() - startTime;
    this.logger.log(
      `Bulk delete completed: ${result.successCount} success, ${result.failureCount} failures`,
    );

    return result;
  }

  /**
   * Get comprehensive statistics about user store mappings
   */
  async getStatistics(): Promise<UserStoreMappingStatsDto> {
    this.logger.log('Generating user store mapping statistics');

    // Get total mappings count
    const totalMappings = await this.userStoreMappingsRepo.count();

    // Get active mappings count
    const activeMappings = await this.userStoreMappingsRepo.count({
      where: { is_deleted: false },
    });

    // Get deleted mappings count
    const deletedMappings = totalMappings - activeMappings;

    // Get mappings by role
    const roleStats = await this.userStoreMappingsRepo
      .createQueryBuilder('mapping')
      .select('mapping.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('mapping.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('mapping.role')
      .getRawMany();

    const mappingsByRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count);
      return acc;
    }, {});

    // Get top active stores
    const storeStats = await this.userStoreMappingsRepo
      .createQueryBuilder('mapping')
      .leftJoin('mapping.store', 'store')
      .select('mapping.store_id', 'storeId')
      .addSelect('store.name', 'storeName')
      .addSelect('COUNT(*)', 'userCount')
      .where('mapping.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('mapping.store_id, store.name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    const topActiveStores = storeStats.map((stat) => ({
      storeId: stat.storeId,
      storeName: stat.storeName,
      userCount: parseInt(stat.userCount),
    }));

    // Get recent activity
    const recentActivity = await this.userStoreMappingsRepo
      .createQueryBuilder('mapping')
      .leftJoin('mapping.user', 'user')
      .leftJoin('mapping.store', 'store')
      .select([
        'mapping.user_id as userId',
        'user.full_name as userName',
        'mapping.store_id as storeId',
        'store.name as storeName',
        'mapping.created_at as createdAt',
      ])
      .where('mapping.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('mapping.created_at', 'DESC')
      .limit(20)
      .getRawMany();

    const formattedRecentActivity = recentActivity.map((activity) => ({
      action: 'CREATE',
      userId: activity.userId,
      userName: activity.userName,
      storeId: activity.storeId,
      storeName: activity.storeName,
      createdAt: activity.createdAt,
    }));

    return {
      totalMappings,
      mappingsByRole,
      activeMappings,
      deletedMappings,
      topActiveStores,
      recentActivity: formattedRecentActivity,
      generatedAt: new Date(),
    };
  }

  /**
   * Validate that user and store exist
   */
  private async validateForeignKeys(
    userId: string,
    storeId: string,
  ): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { user_id: userId, is_deleted: false },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const store = await this.storesRepo.findOne({
      where: { store_id: storeId, is_deleted: false },
    });
    if (!store) {
      throw new Error(`Store with ID ${storeId} not found`);
    }
  }

  /**
   * Validate mapping business rules
   */
  async validateMappingRules(
    userId: string,
    storeId: string,
    role: string,
  ): Promise<void> {
    // Check if user already has a mapping with this store
    const existingMapping = await this.userStoreMappingsRepo.findOne({
      where: {
        user_id: userId,
        store_id: storeId,
        is_deleted: false,
      },
    });

    if (existingMapping) {
      throw new Error(
        `User ${userId} already has a mapping with store ${storeId}`,
      );
    }

    // Check role-specific business rules
    if (role === 'ADMIN_GLOBAL') {
      // Global admins can only be assigned to one store
      const globalAdminMappings = await this.userStoreMappingsRepo.count({
        where: {
          user_id: userId,
          role: 'ADMIN_GLOBAL',
          is_deleted: false,
        },
      });

      if (globalAdminMappings > 0) {
        throw new Error('Global admin can only be assigned to one store');
      }
    }

    // Check store manager limit (max 3 managers per store)
    if (role === 'STORE_MANAGER') {
      const managerCount = await this.userStoreMappingsRepo.count({
        where: {
          store_id: storeId,
          role: 'STORE_MANAGER',
          is_deleted: false,
        },
      });

      if (managerCount >= 3) {
        throw new Error('Store can have maximum 3 managers');
      }
    }
  }

  /**
   * Get mapping performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    averageResponseTime: number;
    totalQueries: number;
    cacheHitRate: number;
    errorRate: number;
  }> {
    // This would typically integrate with monitoring tools
    // For now, return mock data
    return {
      averageResponseTime: 150, // ms
      totalQueries: 1000,
      cacheHitRate: 85.5, // %
      errorRate: 0.5, // %
    };
  }
}
