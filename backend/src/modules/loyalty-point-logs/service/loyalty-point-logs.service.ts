import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { LoyaltyPointLog } from 'src/entities/tenant/loyalty_point_log.entity';
import { CreateLoyaltyPointLogDto } from 'src/modules/loyalty-point-logs/dto/create-loyaltyPointLog.dto';
import { UpdateLoyaltyPointLogDto } from 'src/modules/loyalty-point-logs/dto/update-loyaltyPointLog.dto';
import { LoyaltyPointLogResponseDto } from 'src/modules/loyalty-point-logs/dto/loyaltyPointLog-response.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';

@Injectable()
export class LoyaltyPointLogsService extends TenantBaseService<LoyaltyPointLog> {
  protected readonly logger = new Logger(LoyaltyPointLogsService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, LoyaltyPointLog);
    this.primaryKey = 'id';
  }

  async createLoyaltyPointLog(
    storeId: string,
    dto: CreateLoyaltyPointLogDto,
  ): Promise<LoyaltyPointLogResponseDto> {
    try {
      this.logger.log(`Creating loyalty point log for store: ${storeId}`);

      // Validate point change
      if (dto.change === 0) {
        throw new BadRequestException('Point change cannot be zero');
      }

      const entityData = DtoMapper.mapToEntity<LoyaltyPointLog>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`Loyalty point log created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findLoyaltyPointLogById(
    storeId: string,
    id: string,
  ): Promise<LoyaltyPointLogResponseDto | null> {
    try {
      this.logger.debug(
        `Finding loyalty point log by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Loyalty point log not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findOne(
    storeId: string,
    id: string,
  ): Promise<LoyaltyPointLogResponseDto> {
    try {
      this.logger.debug(
        `Finding loyalty point log by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(
          `Loyalty point log with ID "${id}" not found`,
        );
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllLoyaltyPointLogs(
    storeId: string,
  ): Promise<LoyaltyPointLogResponseDto[]> {
    try {
      this.logger.debug(`Finding all loyalty point logs for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} loyalty point logs`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find loyalty point logs: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updateLoyaltyPointLog(
    storeId: string,
    id: string,
    dto: UpdateLoyaltyPointLogDto,
  ): Promise<LoyaltyPointLogResponseDto> {
    try {
      this.logger.log(`Updating loyalty point log: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `Loyalty point log with ID "${id}" not found`,
        );
      }
      const repo = await this.getRepo(storeId);

      // Validate point change if provided
      if (dto.change !== undefined && dto.change === 0) {
        throw new BadRequestException('Point change cannot be zero');
      }

      const entityData = DtoMapper.mapToEntity<LoyaltyPointLog>(
        dto as unknown as Record<string, unknown>,
      );

      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Loyalty point log updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removeLoyaltyPointLog(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(
        `Removing loyalty point log: ${id} from store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `Loyalty point log with ID "${id}" not found`,
        );
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      entity.deleted_at = new Date();
      await repo.save(entity);

      this.logger.log(`Loyalty point log soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restoreLoyaltyPointLog(
    storeId: string,
    id: string,
  ): Promise<LoyaltyPointLogResponseDto> {
    try {
      this.logger.log(
        `Restoring loyalty point log: ${id} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Loyalty point log with ID "${id}" not found or not deleted`,
        );
      }

      entity.is_deleted = false;
      entity.deleted_at = undefined;
      const restored = await repo.save(entity);

      this.logger.log(`Loyalty point log restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore loyalty point log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private mapToResponseDto(
    entity: LoyaltyPointLog,
  ): LoyaltyPointLogResponseDto {
    return {
      id: entity.id,
      customerId: entity.customer_id,
      orderId: entity.order_id,
      change: entity.change,
      reason: entity.reason,
      createdAt: entity.created_at,
      createdByUserId: entity.created_by_user_id,
      updatedByUserId: entity.updated_by_user_id,
    };
  }
}
