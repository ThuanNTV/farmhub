import { Injectable, NotFoundException } from '@nestjs/common';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatchOrderItem.dto';
import { UpdateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/update-dispatchOrderItem.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DispatchOrderItem } from 'src/entities/tenant/dispatch_order_item.entity';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';

@Injectable()
export class DispatchOrderItemsService extends TenantBaseService<DispatchOrderItem> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, DispatchOrderItem);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateDispatchOrderItemDto,
  ): Promise<DispatchOrderItem> {
    const entityData = DtoMapper.mapToEntity<DispatchOrderItem>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(
    storeId: string,
    id: string,
  ): Promise<DispatchOrderItem | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<DispatchOrderItem> {
    const item = await this.findById(storeId, id);
    if (!item) {
      throw new NotFoundException(
        `DispatchOrderItem with ID "${id}" not found`,
      );
    }
    return item;
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false },
      relations: [
        'dispatch_order',
        'product',
        'created_by_user',
        'updated_by_user',
      ],
    });
  }

  async update(storeId: string, id: string, dto: UpdateDispatchOrderItemDto) {
    const item = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<DispatchOrderItem>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(item, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const item = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Soft delete
    item.is_deleted = true;
    await repo.save(item);

    return {
      message: `✅ DispatchOrderItem với ID "${id}" đã được xóa`,
      data: null,
    };
  }

  async findByDispatchOrderId(storeId: string, dispatchOrderId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: {
        dispatch_order_id: dispatchOrderId,
        is_deleted: false,
      },
      relations: ['product', 'created_by_user', 'updated_by_user'],
    });
  }
}
