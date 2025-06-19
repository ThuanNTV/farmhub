// src/tenant/product/tenant-products.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TenantDataSourceService } from '../config/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  private async getRepo(storeId: string): Promise<Repository<Product>> {
    try {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const stats = this.tenantDataSourceService.getConnectionStats();

      console.log(`[ProductsService] ✅ Connected to ${storeId}`);
      console.log(
        `[ProductsService] 🔌 Active connections: ${stats.totalConnections}`,
      );

      return dataSource.getRepository(Product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`❌ Store "${storeId}" chưa tồn tại`);
      }

      console.error(`[ProductsService] ❗ getRepo error:`, error);
      throw new InternalServerErrorException(
        'Lỗi khi kết nối tới CSDL chi nhánh',
      );
    }
  }

  async create(storeId: string, dto: CreateProductDto) {
    const repo = await this.getRepo(storeId);

    const existing = await repo.findOneBy({ id: dto.id });
    if (existing) {
      throw new Error(`⚠️ Sản phẩm với ID "${dto.id}" đã tồn tại.`);
    }

    const product = repo.create(dto);
    return await repo.save(product);
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { isDeleted: false, isActive: true },
    });
  }

  async update(storeId: string, id: string, dto: UpdateProductDto) {
    const repo = await this.getRepo(storeId);

    const existing = await repo.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }

    const updated = repo.merge(existing, dto);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);

    const existing = await repo.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }

    existing.isDeleted = true;
    return await repo.save(existing);
  }
}
