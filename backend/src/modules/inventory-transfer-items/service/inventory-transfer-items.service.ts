import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { InventoryTransferItem } from 'src/entities/tenant/inventory_transfer_item.entity';
import { CreateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/create-inventoryTransferItem.dto';
import { UpdateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/update-inventoryTransferItem.dto';

@Injectable()
export class InventoryTransferItemsService extends TenantBaseService<InventoryTransferItem> {
  protected primaryKey = 'id';

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, InventoryTransferItem);
  }

  async create(
    storeId: string,
    createInventoryTransferItemDto: CreateInventoryTransferItemDto,
  ): Promise<InventoryTransferItem> {
    const repo = await this.getRepo(storeId);
    const result = await repo.save({
      ...createInventoryTransferItemDto,
      storeId,
    });
    return DtoMapper.mapToDto<InventoryTransferItem>({ ...result });
  }

  async findAll(storeId: string): Promise<InventoryTransferItem[]> {
    const repo = await this.getRepo(storeId);
    const entities = await repo.find();
    return entities.map((entity) =>
      DtoMapper.mapToDto<InventoryTransferItem>({ ...entity }),
    );
  }

  async findOne(
    storeId: string,
    id: string,
  ): Promise<InventoryTransferItem | null> {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id } });
    return entity
      ? DtoMapper.mapToDto<InventoryTransferItem>({ ...entity })
      : null;
  }

  async update(
    storeId: string,
    id: string,
    updateInventoryTransferItemDto: UpdateInventoryTransferItemDto,
  ) {
    const entityData = DtoMapper.mapToEntity<InventoryTransferItem>(
      updateInventoryTransferItemDto as Record<string, unknown>,
    );
    await super.updateById(
      storeId,
      id,
      entityData as Partial<InventoryTransferItem>,
    );
    // Fetch the updated entity to return as DTO
    const repo = await this.getRepo(storeId);
    const updatedEntity = await repo.findOne({ where: { id } });
    return updatedEntity
      ? DtoMapper.mapToDto<InventoryTransferItem>({ ...updatedEntity })
      : null;
  }

  async removeInventoryTransferItem(id: string, storeId: string) {
    try {
      const result = await this.deleteById(storeId, id);
      if (result.affected === 0) {
        throw new NotFoundException('Inventory transfer item not found');
      }
      return { message: 'Inventory transfer item deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to delete inventory transfer item');
    }
  }
}
