import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { StockAdjustment } from 'src/entities/tenant/stock_adjustment.entity';
import { CreateStockAdjustmentDto } from 'src/modules/stock-adjustments/dto/create-stockAdjustment.dto';
import { UpdateStockAdjustmentDto } from 'src/modules/stock-adjustments/dto/update-stockAdjustment.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class StockAdjustmentsService extends TenantBaseService<StockAdjustment> {
  protected primaryKey!: string;
  protected readonly logger = new Logger(StockAdjustmentsService.name);

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, StockAdjustment);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateStockAdjustmentDto,
  ): Promise<StockAdjustment> {
    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<StockAdjustment>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<StockAdjustment | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<StockAdjustment> {
    return await super.findByIdOrFail(storeId, id);
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false },
      relations: ['created_by_user', 'updated_by_user'],
    });
  }

  async update(storeId: string, id: string, dto: UpdateStockAdjustmentDto) {
    const stockAdjustment = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<StockAdjustment>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(stockAdjustment, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    try {
      const stockAdjustment = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);
      stockAdjustment.is_deleted = true;
      await repo.save(stockAdjustment);
      this.logger.log(`StockAdjustment soft deleted successfully: ${id}`);
      return {
        message: `✅ StockAdjustment với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      this.logger.error('Failed to remove stock adjustment', error);
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const stockAdjustment = await repo.findOne({
        where: { id, is_deleted: true },
      });
      if (!stockAdjustment) {
        throw new NotFoundException(
          `StockAdjustment với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
        );
      }
      stockAdjustment.is_deleted = false;
      stockAdjustment.deleted_at = undefined;
      const restored = await repo.save(stockAdjustment);
      this.logger.log(`StockAdjustment restored successfully: ${id}`);
      return {
        message: `✅ StockAdjustment với ID "${id}" đã được khôi phục`,
        data: restored,
      };
    } catch (error) {
      this.logger.error('Failed to restore stock adjustment', error);
      throw error;
    }
  }

  private async validateForeignKeys(
    storeId: string,
    dto: CreateStockAdjustmentDto | UpdateStockAdjustmentDto,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);
    if (dto.productId) {
      const product = await repo.manager.findOne('product', {
        where: { id: dto.productId, is_deleted: false },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }
    }
    if (dto.adjustedByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.adjustedByUserId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.adjustedByUserId} not found`,
        );
      }
    }
  }
}
