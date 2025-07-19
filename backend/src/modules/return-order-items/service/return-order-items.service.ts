import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ReturnOrderItem } from 'src/entities/tenant/return_order_item.entity';
import { CreateReturnOrderItemDto } from 'src/modules/return-order-items/dto/create-returnOrderItem.dto';
import { UpdateReturnOrderItemDto } from 'src/modules/return-order-items/dto/update-returnOrderItem.dto';

@Injectable()
export class ReturnOrderItemsService extends TenantBaseService<ReturnOrderItem> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, ReturnOrderItem);
    this.primaryKey = 'id';
  }

  async createReturnOrderItem(
    storeId: string,
    dto: CreateReturnOrderItemDto,
    userId: string,
  ): Promise<ReturnOrderItem> {
    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<ReturnOrderItem>(
      dto as unknown as Record<string, unknown>,
    );
    entityData.created_by_user_id = userId;
    entityData.updated_by_user_id = userId;

    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<ReturnOrderItem | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<ReturnOrderItem | null> {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id } });
    return entity ? DtoMapper.mapToDto({ ...entity }) : null;
  }

  async findAll(storeId: string): Promise<ReturnOrderItem[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false },
      relations: [
        'return_order',
        'product',
        'created_by_user',
        'updated_by_user',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findByReturnOrder(
    storeId: string,
    returnOrderId: string,
  ): Promise<ReturnOrderItem[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { return_order_id: returnOrderId, is_deleted: false },
      relations: [
        'return_order',
        'product',
        'created_by_user',
        'updated_by_user',
      ],
      order: { created_at: 'ASC' },
    });
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateReturnOrderItemDto,
    userId: string,
  ): Promise<ReturnOrderItem> {
    const returnOrderItem = await this.findOne(storeId, id);
    if (!returnOrderItem) {
      throw new NotFoundException(
        `Return order item with ID "${id}" not found`,
      );
    }
    const repo = await this.getRepo(storeId);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<ReturnOrderItem>(
      dto as unknown as Record<string, unknown>,
    );
    entityData.updated_by_user_id = userId;

    const updated = repo.merge(returnOrderItem, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string, userId: string) {
    const returnOrderItem = await this.findOne(storeId, id);
    if (!returnOrderItem) {
      throw new NotFoundException(
        `Return order item with ID "${id}" not found`,
      );
    }
    const repo = await this.getRepo(storeId);

    // Soft delete
    returnOrderItem.is_deleted = true;
    returnOrderItem.updated_by_user_id = userId;
    await repo.save(returnOrderItem);

    return {
      message: `✅ Return order item với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(
    storeId: string,
    id: string,
    userId: string,
  ): Promise<ReturnOrderItem> {
    const repo = await this.getRepo(storeId);
    const returnOrderItem = await repo.findOne({
      where: { id, is_deleted: true },
    });

    if (!returnOrderItem) {
      throw new NotFoundException(
        `Return order item với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    returnOrderItem.is_deleted = false;
    returnOrderItem.deleted_at = undefined;
    returnOrderItem.updated_by_user_id = userId;
    return await repo.save(returnOrderItem);
  }

  mapToResponseDto(entity: ReturnOrderItem) {
    return {
      id: entity.id,
      returnOrderId: entity.return_order_id,
      productId: entity.product_id,
      quantity: entity.quantity,
      condition: entity.condition,
      notes: entity.note,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      deleted_at: entity.deleted_at,
      is_deleted: entity.is_deleted,
      created_by_user_id: entity.created_by_user_id,
      updated_by_user_id: entity.updated_by_user_id,
      returnOrder: entity.return_order,
      product: entity.product,
    };
  }

  private async validateForeignKeys(
    storeId: string,
    dto: CreateReturnOrderItemDto | UpdateReturnOrderItemDto,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);

    // Validate return_order_id exists
    if (dto.returnOrderId) {
      const returnOrder = await repo.manager.findOne('return_order', {
        where: { id: dto.returnOrderId, store_id: storeId, is_deleted: false },
      });
      if (!returnOrder) {
        throw new NotFoundException(
          `Return order with ID ${dto.returnOrderId} not found`,
        );
      }
    }

    // Validate product_id exists
    if (dto.productId) {
      const product = await repo.manager.findOne('product', {
        where: { product_id: dto.productId, is_deleted: false },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }
    }
  }
}
