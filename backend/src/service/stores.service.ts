import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from '../dto/dtoStores/create-store.dto';
import { UpdateStoreDto } from '../dto/dtoStores/update-store.dto';
import { Store } from 'src/entities/global/store.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(Store, 'globalConnection')
    private storesRepo: Repository<Store>,
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  async create(dto: CreateStoreDto) {
    const existing = await this.storesRepo.findOneBy({
      databaseName: dto.databaseName,
    });
    if (existing && !existing.isDeleted) {
      throw new ConflictException(
        `❌ Store ID "${dto.databaseName}" đã tồn tại.`,
      );
    }

    const store = this.storesRepo.create({
      ...dto,
    });

    // Bước 1: Tạo database vật lý trước
    try {
      await this.createTenantDatabase(store.databaseName);
    } catch (err) {
      throw new InternalServerErrorException(
        `❌ Không thể tạo database cho tenant: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // Bước 2: Ghi vào bảng stores
    const saved = await this.storesRepo.save(store);

    // Bước 3: Tạo kết nối và khởi tạo bảng
    try {
      this.logger.log(`🚀 Khởi tạo DataSource cho Store ID: ${store.storeId}`);
      const dataSource = await this.tenantDataSourceService.getTenantDataSource(
        store.storeId,
      );
      await dataSource.synchronize(); // Nếu cần tạo bảng
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `❌ Lỗi khi khởi tạo tenant datasource: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        `❌ Không thể tạo schema cho tenant: ${errorMessage}`,
      );
    }

    return {
      message: '✅ Tạo Store thành công',
      data: saved,
    };
  }

  async findAll() {
    return await this.storesRepo.find({
      where: { isActive: true, isDeleted: false },
    });
  }

  async findOne(storeId: string): Promise<Store> {
    const store = await this.storesRepo.findOne({
      where: { storeId, isDeleted: false },
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
    if (store.databaseName != updateStoreDto.databaseName) {
      throw new ConflictException(
        '❌ Không thể thay đổi databaseName của Store đã tồn tại.',
      );
    }
    const updated = this.storesRepo.merge(store, updateStoreDto);
    const saved = await this.storesRepo.save(updated);

    return {
      message: `✅ Store "${saved.name}" đã được cập nhật`,
      data: saved,
    };
  }

  async remove(id: string) {
    const store = await this.findOne(id);
    store.isDeleted = true;

    await this.storesRepo.save(store);
    return {
      message: `✅ Store với ID "${id}" đã được xóa mềm`,
      data: null,
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
}
