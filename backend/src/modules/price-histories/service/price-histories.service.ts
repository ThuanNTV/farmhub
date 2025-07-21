import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { PriceHistory } from 'src/entities/tenant/price_history.entity';
import { CreatePriceHistoryDto } from 'src/modules/price-histories/dto/create-priceHistory.dto';
import { UpdatePriceHistoryDto } from 'src/modules/price-histories/dto/update-priceHistory.dto';
import { PriceHistoryResponseDto } from 'src/modules/price-histories/dto/priceHistory-response.dto';

@Injectable()
export class PriceHistoriesService extends TenantBaseService<PriceHistory> {
  protected readonly logger = new Logger(PriceHistoriesService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, PriceHistory);
    this.primaryKey = 'id';
  }

  async createPriceHistories(
    storeId: string,
    dto: CreatePriceHistoryDto,
  ): Promise<PriceHistoryResponseDto> {
    try {
      this.logger.log(`Creating price history for store: ${storeId}`);

      // Validate price change
      if (dto.oldPrice < 0 || dto.newPrice < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      const repo = await this.getRepo(storeId);

      // Calculate price difference and percentage change
      const priceDifference = dto.newPrice - dto.oldPrice;
      const percentageChange =
        dto.oldPrice > 0 ? (priceDifference / dto.oldPrice) * 100 : 0;

      const priceHistory = repo.create({
        product_id: dto.productId,
        price_type: dto.priceType || 'retail',
        old_price: dto.oldPrice,
        new_price: dto.newPrice,
        price_difference: priceDifference,
        percentage_change: percentageChange,
        reason: dto.reason,
        metadata: dto.metadata,
        changed_by_user_id: dto.changedByUserId,
        created_by_user_id: dto.createdByUserId,
        updated_by_user_id: dto.updatedByUserId,
      });

      const created = await repo.save(priceHistory);

      this.logger.log(`Price history created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findPriceHistoryById(
    storeId: string,
    id: string,
  ): Promise<PriceHistoryResponseDto | null> {
    try {
      this.logger.debug(
        `Finding price history by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Price history not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<PriceHistoryResponseDto> {
    try {
      this.logger.debug(
        `Finding price history by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(`Price history with ID "${id}" not found`);
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllPriceHistories(
    storeId: string,
  ): Promise<PriceHistoryResponseDto[]> {
    try {
      this.logger.debug(`Finding all price histories for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
        order: { changed_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} price histories`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find price histories: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updatePriceHistory(
    storeId: string,
    id: string,
    dto: UpdatePriceHistoryDto,
  ): Promise<PriceHistoryResponseDto> {
    try {
      this.logger.log(`Updating price history: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Price history with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Validate price change if provided
      if (dto.oldPrice !== undefined && dto.oldPrice < 0) {
        throw new BadRequestException('Old price cannot be negative');
      }
      if (dto.newPrice !== undefined && dto.newPrice < 0) {
        throw new BadRequestException('New price cannot be negative');
      }

      const entityData = DtoMapper.mapToEntity<PriceHistory>(
        dto as unknown as Record<string, unknown>,
      );

      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Price history updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removePriceHistory(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(`Removing price history: ${id} from store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Price history with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      entity.deleted_at = new Date();
      await repo.save(entity);

      this.logger.log(`Price history soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restorePriceHistory(
    storeId: string,
    id: string,
  ): Promise<PriceHistoryResponseDto> {
    try {
      this.logger.log(`Restoring price history: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Price history with ID "${id}" not found or not deleted`,
        );
      }

      entity.is_deleted = false;
      entity.deleted_at = undefined;
      const restored = await repo.save(entity);

      this.logger.log(`Price history restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore price history: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private mapToResponseDto(entity: PriceHistory): PriceHistoryResponseDto {
    return {
      id: entity.id,
      productId: entity.product_id,
      productName: entity.product?.name,
      priceType: entity.price_type,
      oldPrice: entity.old_price,
      newPrice: entity.new_price,
      priceDifference: entity.price_difference || 0,
      percentageChange: entity.percentage_change || 0,
      reason: entity.reason,
      metadata: entity.metadata,
      changedByUserId: entity.changed_by_user_id,
      changedAt: entity.changed_at,
      isIncrease: entity.isIncrease,
      isDecrease: entity.isDecrease,
      absoluteChange: entity.absoluteChange,
      formattedPercentageChange: entity.formattedPercentageChange,
      createdByUserId: entity.created_by_user_id,
      updatedByUserId: entity.updated_by_user_id,
    };
  }
}
