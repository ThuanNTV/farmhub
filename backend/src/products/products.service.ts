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

    // Kiểm tra sản phẩm có ID đã tồn tại
    const existing = await this.findById(storeId, dto.id);
    if (existing) {
      throw new InternalServerErrorException(
        `❌ Sản phẩm với ID "${dto.id}" đã tồn tại`,
      );
    }
    // Kiểm tra sản phẩm có productCode đã tồn tại
    const existingByCode = await this.findByproductCode(
      storeId,
      dto.productCode,
    );
    if (existingByCode) {
      throw new InternalServerErrorException(
        `❌ Sản phẩm với productCode "${dto.productCode}" đã tồn tại`,
      );
    }

    const product = repo.create(dto);
    return await repo.save(product);
  }

  async findById(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      id,
      isDeleted: false,
      isActive: true,
    });
  }

  async findByproductCode(storeId: string, productCode?: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      productCode,
      isDeleted: false,
      isActive: true,
    });
  }

  async findOne(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);

    const product = await repo.findOneBy({
      id,
      isDeleted: false,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }

    return product;
  }

  async findOneProduc(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);

    const product = await repo.findOneBy({
      id,
      isDeleted: false,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }

    return { repo, product };
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { isDeleted: false, isActive: true },
    });
  }

  async update(storeId: string, id: string, dto: UpdateProductDto) {
    // const repo = await this.getRepo(storeId);

    const { repo, product } = await this.findOneProduc(storeId, id);
    if (!product) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }
    // Kiểm tra sản phẩm có productCode đã tồn tại
    if (dto.productCode) {
      const existingByCode = await this.findByproductCode(
        storeId,
        dto.productCode,
      );
      if (existingByCode && existingByCode.id !== id) {
        throw new InternalServerErrorException(
          `❌ Sản phẩm với productCode "${dto.productCode}" đã tồn tại`,
        );
      }
    }

    const updated = repo.merge(product, dto);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const { repo, product } = await this.findOneProduc(storeId, id);

    if (!product) {
      throw new NotFoundException(`❌ Không tìm thấy sản phẩm với ID "${id}"`);
    }

    product.isDeleted = true;
    await repo.save(product);
    return {
      message: `✅ Sản phẩm với ID "${id}" đã được xóa`,
      data: null,
    };
  }
}
