import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from 'src/entities/global/store.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { GlobalEntityService } from 'src/service/global-entity.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(Store, 'globalConnection')
    private storesRepo: Repository<Store>,
    private readonly tenantDataSourceService: TenantDataSourceService,
    private readonly globalEntityService: GlobalEntityService,
  ) {}

  async createStore(dto: CreateStoreDto) {
    // 🔍 Validate foreign key references trước khi tạo store
    const validationResult = await this.globalEntityService.validateReferences({
      userId: dto.managerUserId,
      bankId: dto.bankId,
    });

    if (!validationResult.valid) {
      throw new BadRequestException(
        `❌ Dữ liệu tham chiếu không hợp lệ: ${validationResult.errors.join(', ')}`,
      );
    }

    const existing = await this.storesRepo.findOneBy({
      schema_name: dto.schemaName,
    });
    if (existing && !existing.is_deleted) {
      throw new ConflictException(
        `❌ Store ID "${dto.schemaName}" đã tồn tại.`,
      );
    }
    const entityData = DtoMapper.mapToEntity<Store>(
      dto as unknown as Record<string, unknown>,
    );
    const store = this.storesRepo.create(entityData);
    try {
      await this.createTenantDatabase(store.schema_name);
    } catch (err) {
      throw new InternalServerErrorException(
        `❌ Không thể tạo database cho tenant: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    let saved: Store;
    try {
      saved = await this.storesRepo.save(store);
      try {
        this.logger.log(
          `🚀 Khởi tạo DataSource cho Store ID: ${store.schema_name}`,
        );
        await this.tenantDataSourceService.dropObsoleteIndexesWithGlobalConnection(
          store.schema_name,
        );
        const dataSource =
          await this.tenantDataSourceService.getTenantDataSource(
            saved.store_id,
          );
        await dataSource.synchronize();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `❌ Lỗi khi khởi tạo tenant datasource: ${errorMessage}`,
        );
        await this.storesRepo.delete({ schema_name: store.schema_name });
        throw new InternalServerErrorException(
          `❌ Không thể tạo schema cho tenant: ${errorMessage}`,
        );
      }
      // Kiểm tra lại store vừa lưu, nếu không thấy thì rollback và throw lỗi
      const findStore = await this.storesRepo.findOne({
        where: { store_id: saved.store_id },
      });
      if (!findStore) {
        this.logger.error(
          `❌ Không tìm thấy store sau khi lưu: ${saved.store_id}`,
        );
        await this.dropTenantDatabase(store.schema_name);
        throw new InternalServerErrorException(
          `❌ Không tìm thấy store sau khi lưu: ${saved.store_id}`,
        );
      }
    } catch (error) {
      await this.dropTenantDatabase(store.schema_name);
      throw error;
    }
    return {
      message: '✅ Tạo Store thành công',
      data: saved,
    };
  }

  async findAll() {
    return await this.storesRepo.find({
      where: { is_active: true, is_deleted: false },
    });
  }

  async findOne(storeId: string): Promise<Store> {
    const store = await this.storesRepo.findOne({
      where: { schema_name: storeId, is_deleted: false },
    });

    if (!store) {
      throw new NotFoundException(
        `❌ Store với ID "${storeId}" không tồn tại.`,
      );
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const store = await this.findOne(id);
    if (store.schema_name != updateStoreDto.schemaName) {
      throw new ConflictException(
        '❌ Không thể thay đổi schemaName của Store đã tồn tại.',
      );
    }
    const entityData = DtoMapper.mapToEntity<Store>(
      updateStoreDto as unknown as Record<string, unknown>,
    );
    const updated = this.storesRepo.merge(store, entityData);
    const saved = await this.storesRepo.save(updated);

    return {
      message: `✅ Store "${saved.name}" đã được cập nhật`,
      data: saved,
    };
  }

  async remove(id: string) {
    const store = await this.findOne(id);
    store.is_deleted = true;

    await this.storesRepo.save(store);
    return {
      message: `✅ Store với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(id: string) {
    const store = await this.storesRepo.findOne({
      where: { schema_name: id, is_deleted: true },
    });
    if (!store) {
      throw new InternalServerErrorException(
        'Store không tồn tại hoặc chưa bị xóa mềm',
      );
    }
    store.is_deleted = false;
    await this.storesRepo.save(store);
    return {
      message: 'Khôi phục store thành công',
      data: store,
    };
  }

  async createTenantDatabase(dbName: string) {
    const query = `CREATE DATABASE "${dbName}"`;
    try {
      // Sử dụng manager thay vì DataSource
      await this.storesRepo.manager.query(query);

      this.logger.log(`🎉 Database ${dbName} created.`);
    } catch (error) {
      this.logger.error(`❌ Failed to create database ${dbName}`, error);
      throw error;
    }
  }

  async updateStore(id: string, updateStoreDto: UpdateStoreDto) {
    return this.update(id, updateStoreDto);
  }

  async removeStore(id: string) {
    return this.remove(id);
  }

  async findByUser(userId: string) {
    return await this.storesRepo
      .createQueryBuilder('store')
      .innerJoin('store.userStoreMappings', 'mapping')
      .where('mapping.userId = :userId', { userId })
      .andWhere('store.is_deleted = :is_deleted', { is_deleted: false })
      .andWhere('store.is_active = :is_active', { is_active: true })
      .getMany();
  }

  // Thêm hàm dropTenantDatabase để xóa schema vật lý khi rollback
  async dropTenantDatabase(dbName: string) {
    const query = `DROP DATABASE IF EXISTS "${dbName}"`;
    try {
      await this.storesRepo.manager.query(query);
      this.logger.log(`🗑️ Database ${dbName} dropped.`);
    } catch (error) {
      this.logger.error(`❌ Failed to drop database ${dbName}`, error);
      // Không throw lại để tránh che lỗi gốc
    }
  }
}
