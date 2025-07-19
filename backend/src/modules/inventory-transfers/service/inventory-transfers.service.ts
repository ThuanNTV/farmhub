import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { InventoryTransfer } from 'src/entities/tenant/inventory_transfer.entity';
import { CreateInventoryTransferDto } from 'src/modules/inventory-transfers/dto/create-inventoryTransfer.dto';
import { UpdateInventoryTransferDto } from 'src/modules/inventory-transfers/dto/update-inventoryTransfer.dto';
import { InventoryTransferResponseDto } from 'src/modules/inventory-transfers/dto/inventoryTransfer-response.dto';
import { InventoryTransferStatus } from 'src/modules/inventory-transfers/dto/create-inventoryTransfer.dto';

@Injectable()
export class InventoryTransfersService extends TenantBaseService<InventoryTransfer> {
  protected readonly logger = new Logger(InventoryTransfersService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, InventoryTransfer);
    this.primaryKey = 'id';
  }

  async createInventoryTransfer(
    storeId: string,
    dto: CreateInventoryTransferDto,
  ): Promise<InventoryTransferResponseDto> {
    try {
      this.logger.log(`Creating inventory transfer for store: ${storeId}`);

      // Validate transfer data
      if (dto.sourceStoreId === dto.targetStoreId) {
        throw new BadRequestException(
          'Source and target stores cannot be the same',
        );
      }

      const entityData = DtoMapper.mapToEntity<InventoryTransfer>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`Inventory transfer created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findInventoryTransferById(
    storeId: string,
    id: string,
  ): Promise<InventoryTransferResponseDto | null> {
    try {
      this.logger.debug(
        `Finding inventory transfer by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Inventory transfer not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findInventoryTransfer(
    storeId: string,
    id: string,
  ): Promise<InventoryTransferResponseDto> {
    try {
      this.logger.debug(
        `Finding inventory transfer by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(
          `Inventory transfer with ID "${id}" not found`,
        );
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllInventoryTransfers(
    storeId: string,
  ): Promise<InventoryTransferResponseDto[]> {
    try {
      this.logger.debug(
        `Finding all inventory transfers for store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} inventory transfers`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find inventory transfers: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updateInventoryTransfer(
    storeId: string,
    id: string,
    dto: UpdateInventoryTransferDto,
  ): Promise<InventoryTransferResponseDto> {
    try {
      this.logger.log(
        `Updating inventory transfer: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `Inventory transfer with ID "${id}" not found`,
        );
      }
      const repo = await this.getRepo(storeId);

      // Validate update data
      if (
        dto.sourceStoreId &&
        dto.targetStoreId &&
        dto.sourceStoreId === dto.targetStoreId
      ) {
        throw new BadRequestException(
          'Source and target stores cannot be the same',
        );
      }

      const entityData = DtoMapper.mapToEntity<InventoryTransfer>(
        dto as unknown as Record<string, unknown>,
      );

      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Inventory transfer updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removeInventoryTransfer(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(
        `Removing inventory transfer: ${id} from store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `Inventory transfer with ID "${id}" not found`,
        );
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      await repo.save(entity);

      this.logger.log(`Inventory transfer soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restoreInventoryTransfer(
    storeId: string,
    id: string,
  ): Promise<InventoryTransferResponseDto> {
    try {
      this.logger.log(
        `Restoring inventory transfer: ${id} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Inventory transfer with ID "${id}" not found or not deleted`,
        );
      }

      entity.is_deleted = false;
      entity.deleted_at = undefined;
      const restored = await repo.save(entity);

      this.logger.log(`Inventory transfer restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore inventory transfer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  // Thêm method stub để tránh lỗi khi OrdersService gọi
  async validateStockAvailability(
    storeId: string,
    stockItems: any[],
  ): Promise<void> {
    this.logger.debug(
      `Stub: validateStockAvailability for store ${storeId} with items: ${JSON.stringify(stockItems)}`,
    );
    // TODO: Thêm logic kiểm tra tồn kho thực tế nếu cần
    await Promise.resolve(); // Satisfy async requirement
  }

  async decreaseStock(
    storeId: string,
    stockItems: any[],
    _manager?: any,
  ): Promise<void> {
    this.logger.debug(
      `Stub: decreaseStock for store ${storeId} with items: ${JSON.stringify(stockItems)}`,
    );
    // TODO: Thêm logic giảm tồn kho thực tế nếu cần
    await Promise.resolve(); // Satisfy async requirement
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(
    entity: InventoryTransfer,
  ): InventoryTransferResponseDto {
    return {
      id: entity.id,
      sourceStoreId: entity.source_store_id,
      targetStoreId: entity.target_store_id,
      transferCode: entity.transfer_code,
      note: entity.note,
      status: entity.status as InventoryTransferStatus,
      createdByUserId: entity.created_by_user_id,
      approvedByUserId: entity.approved_by_user_id,
      receivedByUserId: entity.received_by_user_id,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }
}
