// src/tenant/product/tenant-products.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService extends TenantBaseService<Product> {
  protected readonly logger = new Logger(ProductsService.name);
  protected primaryKey!: string;

  constructor(
    tenantDS: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
  ) {
    super(tenantDS, Product);
    this.primaryKey = 'productId';
  }

  async createProduct(storeId: string, dto: CreateProductDto) {
    try {
      this.logger.log(`Creating product for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const existing = await this.findById(storeId, dto.productId);
      if (existing) {
        throw new InternalServerErrorException(
          `❌ Sản phẩm với ID "${dto.productId}" đã tồn tại`,
        );
      }
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
      const saved = await repo.save(product);

      this.logger.log(`Product created successfully: ${saved.product_id}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: dto.createdByUserId ?? '',
        action: 'CREATE',
        targetTable: 'Product',
        targetId: saved.product_id,
        metadata: {
          action: 'CREATE',
          resource: 'Product',
          resourceId: saved.product_id,
          changes: { ...saved },
        },
      });

      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create product: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findById(storeId: string, productId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      product_id: productId,
      is_deleted: false,
      is_active: true,
    });
  }

  async findByproductCode(storeId: string, productCode?: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      product_code: productCode,
      is_deleted: false,
      is_active: true,
    });
  }

  async findOne(storeId: string, productId: string) {
    try {
      this.logger.debug(
        `Finding product by ID: ${productId} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const product = await repo.findOneBy({
        product_id: productId,
        is_deleted: false,
        is_active: true,
      });
      if (!product) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }

      this.logger.debug(`Product found: ${productId}`);
      return product;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find product: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async findOneProduc(storeId: string, productId: string) {
    const repo = await this.getRepo(storeId);

    const product = await repo.findOneBy({
      product_id: productId,
      is_deleted: false,
      is_active: true,
    });
    if (!product) {
      throw new NotFoundException(
        `❌ Không tìm thấy sản phẩm với ID "${productId}"`,
      );
    }

    return { repo, product };
  }

  async findAll(storeId: string) {
    try {
      this.logger.debug(`Finding all products for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const products = await repo.find({
        where: { is_deleted: false, is_active: true },
      });

      this.logger.debug(`Found ${products.length} products`);
      return products;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to find products: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async update(storeId: string, productId: string, dto: UpdateProductDto) {
    try {
      this.logger.log(`Updating product: ${productId} in store: ${storeId}`);

      const { repo, product } = await this.findOneProduc(storeId, productId);
      // Kiểm tra sản phẩm có productCode đã tồn tại
      if (dto.productCode) {
        const existingByCode = await this.findByproductCode(
          storeId,
          dto.productCode,
        );
        if (existingByCode && existingByCode.product_id !== productId) {
          throw new InternalServerErrorException(
            `❌ Sản phẩm với productCode "${dto.productCode}" đã tồn tại`,
          );
        }
      }

      const updated = repo.merge(product, dto);
      const saved = await repo.save(updated);

      this.logger.log(`Product updated successfully: ${productId}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: dto.updatedByUserId ?? '',
        action: 'UPDATE',
        targetTable: 'Product',
        targetId: productId,
        metadata: {
          action: 'UPDATE',
          resource: 'Product',
          resourceId: productId,
          changes: { before: { ...product }, after: { ...saved } },
        },
      });
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update product: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async remove(storeId: string, productId: string) {
    try {
      this.logger.log(`Removing product: ${productId} from store: ${storeId}`);

      const { repo, product } = await this.findOneProduc(storeId, productId);

      product.is_deleted = true;
      await repo.save(product);

      this.logger.log(`Product soft deleted successfully: ${productId}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: product.updated_by_user_id ?? '',
        action: 'REMOVE',
        targetTable: 'Product',
        targetId: productId,
        metadata: {
          action: 'REMOVE',
          resource: 'Product',
          resourceId: productId,
          changes: { ...product },
        },
      });
      return {
        message: `✅ Sản phẩm với ID "${productId}" đã được xóa`,
        data: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove product: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restore(storeId: string, productId: string) {
    try {
      this.logger.log(`Restoring product: ${productId} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { product_id: productId, is_deleted: true },
      });
      if (!entity) {
        throw new InternalServerErrorException(
          'Sản phẩm không tồn tại hoặc chưa bị xóa mềm',
        );
      }
      entity.is_deleted = false;
      await repo.save(entity);

      this.logger.log(`Product restored successfully: ${productId}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: entity.updated_by_user_id ?? '',
        action: 'RESTORE',
        targetTable: 'Product',
        targetId: productId,
        metadata: {
          action: 'RESTORE',
          resource: 'Product',
          resourceId: productId,
          changes: { ...entity },
        },
      });
      return {
        message: 'Khôi phục sản phẩm thành công',
        data: entity,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore product: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
