// src/tenant/product/tenant-products.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TenantDataSourceService } from '../config/db/dbtenant/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { CreateProductDto } from 'src/dto/dtoProducts/create-product.dto';
import { UpdateProductDto } from 'src/dto/dtoProducts/update-product.dto';
import { TenantBaseService } from 'src/common/helpers/tenant-base.service';

@Injectable()
export class ProductsService extends TenantBaseService<Product> {
  protected primaryKey!: string;
  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Product);
    this.primaryKey = 'productId';
  }

  async create(storeId: string, dto: CreateProductDto) {
    const repo = await this.getRepo(storeId);

    // Kiểm tra sản phẩm có ID đã tồn tại
    const existing = await this.findById(storeId, dto.productId);
    if (existing) {
      throw new InternalServerErrorException(
        `❌ Sản phẩm với ID "${dto.productId}" đã tồn tại`,
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

  async findById(storeId: string, productId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      productId,
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

  async findOne(storeId: string, productId: string) {
    const repo = await this.getRepo(storeId);
    const product = await repo.findOneBy({
      productId,
      isDeleted: false,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    return product;
  }

  async findOneProduc(storeId: string, productId: string) {
    const repo = await this.getRepo(storeId);

    const product = await repo.findOneBy({
      productId,
      isDeleted: false,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(
        `❌ Không tìm thấy sản phẩm với ID "${productId}"`,
      );
    }

    return { repo, product };
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { isDeleted: false, isActive: true },
    });
  }

  async update(storeId: string, productId: string, dto: UpdateProductDto) {
    const { repo, product } = await this.findOneProduc(storeId, productId);
    // Kiểm tra sản phẩm có productCode đã tồn tại
    if (dto.productCode) {
      const existingByCode = await this.findByproductCode(
        storeId,
        dto.productCode,
      );
      if (existingByCode && existingByCode.productId !== productId) {
        throw new InternalServerErrorException(
          `❌ Sản phẩm với productCode "${dto.productCode}" đã tồn tại`,
        );
      }
    }

    const updated = repo.merge(product, dto);
    return await repo.save(updated);
  }

  async remove(storeId: string, productId: string) {
    const { repo, product } = await this.findOneProduc(storeId, productId);

    product.isDeleted = true;
    await repo.save(product);
    return {
      message: `✅ Sản phẩm với ID "${productId}" đã được xóa`,
      data: null,
    };
  }
}
