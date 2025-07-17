import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ReturnOrder } from 'src/entities/tenant/return_order.entity';
import { CreateReturnOrderDto } from 'src/modules/return-orders/dto/create-returnOrder.dto';
import { UpdateReturnOrderDto } from 'src/modules/return-orders/dto/update-returnOrder.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class ReturnOrdersService extends TenantBaseService<ReturnOrder> {
  protected primaryKey!: string;
  protected readonly logger = new Logger(ReturnOrdersService.name);

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, ReturnOrder);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateReturnOrderDto,
  ): Promise<ReturnOrder> {
    try {
      const entityData = DtoMapper.mapToEntity<ReturnOrder>(
        dto as unknown as Record<string, unknown>,
      );
      const created = await super.create(storeId, entityData);
      this.logger.log(`ReturnOrder created successfully: ${created.id}`);
      return created;
    } catch (error) {
      this.logger.error('Failed to create return order', error);
      throw error;
    }
  }

  async findById(storeId: string, id: string): Promise<ReturnOrder | null> {
    try {
      return await super.findById(storeId, id);
    } catch (error) {
      this.logger.error('Failed to find return order by id', error);
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<ReturnOrder> {
    try {
      return await super.findByIdOrFail(storeId, id);
    } catch (error) {
      this.logger.error('Failed to find return order', error);
      throw error;
    }
  }

  async findAll(storeId: string) {
    try {
      const repo = await this.getRepo(storeId);
      return await repo.find({
        relations: ['created_by_user', 'updated_by_user'],
      });
    } catch (error) {
      this.logger.error('Failed to find all return orders', error);
      throw error;
    }
  }

  async update(storeId: string, id: string, dto: UpdateReturnOrderDto) {
    try {
      const returnOrder = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);
      const entityData = DtoMapper.mapToEntity<ReturnOrder>(
        dto as unknown as Record<string, unknown>,
      );
      const updated = repo.merge(returnOrder, entityData);
      const saved = await repo.save(updated);
      this.logger.log(`ReturnOrder updated successfully: ${id}`);
      return saved;
    } catch (error) {
      this.logger.error('Failed to update return order', error);
      throw error;
    }
  }

  async remove(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const returnOrder = await this.findOne(storeId, id);

      returnOrder.is_deleted = true;
      returnOrder.deleted_at = new Date();
      await repo.save(returnOrder);
      this.logger.log(`ReturnOrder soft deleted successfully: ${id}`);
      return {
        message: `✅ ReturnOrder với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      this.logger.error('Failed to remove return order', error);
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const returnOrder = await repo.findOne({
        where: { id, is_deleted: true },
      });
      if (!returnOrder) {
        throw new NotFoundException(
          `ReturnOrder với ID "${id}" không tìm thấy hoặc chưa bị xóa mềm`,
        );
      }
      returnOrder.is_deleted = false;
      returnOrder.deleted_at = undefined;
      await repo.save(returnOrder);
      this.logger.log(`ReturnOrder restored successfully: ${id}`);
      return {
        message: `✅ ReturnOrder với ID "${id}" đã được khôi phục`,
        data: returnOrder,
      };
    } catch (error) {
      this.logger.error('Failed to restore return order', error);
      throw error;
    }
  }
}
