import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchOrder } from 'src/entities/tenant/dispatch_order.entity';
import { CreateDispatchOrderDto } from 'src/modules/dispatch-orders/dto/create-dispatchOrder.dto';
import { UpdateDispatchOrderDto } from 'src/modules/dispatch-orders/dto/update-dispatchOrder.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class DispatchOrdersService extends TenantBaseService<DispatchOrder> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, DispatchOrder);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateDispatchOrderDto,
  ): Promise<DispatchOrder> {
    const entityData = DtoMapper.mapToEntity<DispatchOrder>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<DispatchOrder | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<DispatchOrder> {
    const entity = await super.findById(storeId, id);
    if (!entity) {
      throw new NotFoundException(`Dispatch order with ID ${id} not found`);
    }
    return entity;
  }

  async findAll(storeId: string): Promise<DispatchOrder[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find();
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateDispatchOrderDto,
  ): Promise<DispatchOrder> {
    const dispatchOrder = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<DispatchOrder>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(dispatchOrder, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const dispatchOrder = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    await repo.remove(dispatchOrder);
    return {
      message: `✅ Dispatch order với ID "${id}" đã được xóa`,
      data: null,
    };
  }

  mapToResponseDto(entity: DispatchOrder) {
    return {
      id: entity.id,
      dispatchCode: entity.dispatch_code,
      purpose: entity.purpose,
      status: entity.status,
      createdByUserId: entity.created_by_user_id,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }
}
