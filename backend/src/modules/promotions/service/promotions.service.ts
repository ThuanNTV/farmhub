import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Promotion } from 'src/entities/tenant/promotion.entity';
import { CreatePromotionDto } from 'src/modules/promotions/dto/create-promotion.dto';
import { UpdatePromotionDto } from 'src/modules/promotions/dto/update-promotion.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DeepPartial } from 'typeorm';
import { PromotionType } from 'src/entities/tenant/promotion.entity';

@Injectable()
export class PromotionsService extends TenantBaseService<Promotion> {
  protected primaryKey!: string;
  protected readonly logger = new Logger(PromotionsService.name);

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Promotion);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    entityData: DeepPartial<Promotion>,
  ): Promise<Promotion> {
    if (entityData.type && typeof entityData.type === 'string') {
      entityData.type =
        PromotionType[
          (
            entityData.type as string
          ).toUpperCase() as keyof typeof PromotionType
        ];
    }
    return super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<Promotion | null> {
    try {
      return await super.findById(storeId, id);
    } catch (error) {
      this.logger.error('Failed to find promotion by id', error);
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<Promotion> {
    try {
      return await super.findByIdOrFail(storeId, id);
    } catch (error) {
      this.logger.error('Failed to find promotion', error);
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
      this.logger.error('Failed to find all promotions', error);
      throw error;
    }
  }

  async update(storeId: string, id: string, dto: UpdatePromotionDto) {
    try {
      const promotion = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);
      const entityData = DtoMapper.mapToEntity<Promotion>(
        dto as unknown as Record<string, unknown>,
      );
      const updated = repo.merge(promotion, entityData);
      const saved = await repo.save(updated);
      this.logger.log(`Promotion updated successfully: ${id}`);
      return saved;
    } catch (error) {
      this.logger.error('Failed to update promotion', error);
      throw error;
    }
  }

  async remove(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const promotion = await this.findOne(storeId, id);

      promotion.is_deleted = true;
      promotion.deleted_at = new Date();
      await repo.save(promotion);
      this.logger.log(`Promotion soft deleted successfully: ${id}`);
      return {
        message: `✅ Promotion với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      this.logger.error('Failed to remove promotion', error);
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const promotion = await repo.findOne({ where: { id, is_deleted: true } });
      if (!promotion) {
        throw new NotFoundException(
          `Promotion với ID "${id}" không tìm thấy hoặc chưa bị xóa mềm`,
        );
      }
      promotion.is_deleted = false;
      promotion.deleted_at = undefined;
      await repo.save(promotion);
      this.logger.log(`Promotion restored successfully: ${id}`);
      return {
        message: `✅ Promotion với ID "${id}" đã được khôi phục`,
        data: promotion,
      };
    } catch (error) {
      this.logger.error('Failed to restore promotion', error);
      throw error;
    }
  }
}
