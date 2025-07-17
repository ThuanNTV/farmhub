import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Supplier } from 'src/entities/tenant/supplier.entity';
import { CreateSupplierDto } from 'src/modules/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from 'src/modules/suppliers/dto/update-supplier.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class SuppliersService extends TenantBaseService<Supplier> {
  protected primaryKey!: string;
  protected readonly logger = new Logger(SuppliersService.name);

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Supplier);
    this.primaryKey = 'id';
  }

  async create(storeId: string, dto: CreateSupplierDto): Promise<Supplier> {
    const entityData = DtoMapper.mapToEntity<Supplier>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<Supplier | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<Supplier> {
    return await super.findByIdOrFail(storeId, id);
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      relations: ['created_by_user', 'updated_by_user'],
    });
  }

  async update(storeId: string, id: string, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<Supplier>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(supplier, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    try {
      const supplier = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);
      supplier.is_deleted = true;
      await repo.save(supplier);
      this.logger.log(`Supplier soft deleted successfully: ${id}`);
      return {
        message: `✅ Supplier với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      this.logger.error('Failed to remove supplier', error);
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      const repo = await this.getRepo(storeId);
      const supplier = await repo.findOne({
        where: { id, is_deleted: true },
      });
      if (!supplier) {
        throw new NotFoundException(
          'Supplier không tồn tại hoặc chưa bị xóa mềm',
        );
      }
      supplier.is_deleted = false;
      await repo.save(supplier);
      this.logger.log(`Supplier restored successfully: ${id}`);
      return {
        message: 'Khôi phục supplier thành công',
        data: supplier,
      };
    } catch (error) {
      this.logger.error('Failed to restore supplier', error);
      throw error;
    }
  }
}
