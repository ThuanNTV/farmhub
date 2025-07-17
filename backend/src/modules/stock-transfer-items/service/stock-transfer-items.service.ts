import { Injectable, NotFoundException } from '@nestjs/common';
import { StockTransferItem } from 'src/entities/tenant/stock_transfer_item.entity';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stockTransferItem.dto';
import { UpdateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/update-stockTransferItem.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class StockTransferItemsService extends TenantBaseService<StockTransferItem> {
  protected primaryKey = 'id';

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, StockTransferItem);
  }

  async create(
    storeId: string,
    createStockTransferItemDto: CreateStockTransferItemDto,
  ): Promise<StockTransferItem> {
    const repo = await this.getRepo(storeId);
    const result = await repo.save({ ...createStockTransferItemDto, storeId });
    return DtoMapper.mapToDto<StockTransferItem>({ ...result });
  }

  async findAll(storeId: string): Promise<StockTransferItem[]> {
    const repo = await this.getRepo(storeId);
    const entities = await repo.find();
    return entities.map((entity) =>
      DtoMapper.mapToDto<StockTransferItem>({ ...entity }),
    );
  }

  async findOne(
    storeId: string,
    id: string,
  ): Promise<StockTransferItem | null> {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id } });
    return entity ? DtoMapper.mapToDto<StockTransferItem>({ ...entity }) : null;
  }

  async update(
    storeId: string,
    id: string,
    updateStockTransferItemDto: UpdateStockTransferItemDto,
  ) {
    const entityData = DtoMapper.mapToEntity<StockTransferItem>(
      updateStockTransferItemDto as Record<string, unknown>,
    );
    await super.updateById(
      storeId,
      id,
      entityData as Partial<StockTransferItem>,
    );
    // Fetch the updated entity to return as DTO
    const repo = await this.getRepo(storeId);
    const updatedEntity = await repo.findOne({ where: { id } });
    return updatedEntity
      ? DtoMapper.mapToDto<StockTransferItem>({ ...updatedEntity })
      : null;
  }

  async removeStockTransferItem(id: string, storeId: string) {
    try {
      const result = await this.deleteById(storeId, id);
      if (result.affected === 0) {
        throw new NotFoundException('Stock transfer item not found');
      }
      return { message: 'Stock transfer item deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to delete stock transfer item');
    }
  }
}
