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
import { Category } from 'src/entities/tenant/category.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import { ProductSearchDto } from 'src/modules/products/dto/product-search.dto';
import { ProductFilterDto } from 'src/modules/products/dto/product-filter.dto';
import {
  ProductPaginationDto,
  PaginationMetaDto,
  ProductStatsDto,
} from 'src/modules/products/dto/product-pagination.dto';
import {
  BulkUpdateRequestDto,
  BulkDeleteRequestDto,
  BulkOperationResultDto,
  BulkStockAdjustmentDto,
} from 'src/modules/products/dto/bulk-operations.dto';
import { PriceHistoriesService } from 'src/modules/price-histories/service/price-histories.service';

@Injectable()
export class ProductsService extends TenantBaseService<Product> {
  protected readonly logger = new Logger(ProductsService.name);
  protected primaryKey!: string;

  constructor(
    tenantDS: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
    private readonly priceHistoryService: PriceHistoriesService,
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

      // Validate categoryId exists
      await this.validateCategoryExists(storeId, dto.categoryId);
      const product = repo.create(dto);
      const saved = await repo.save(product);

      this.logger.log(`Product created successfully: ${saved.product_id}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        storeId,
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

      // Validate categoryId if provided
      if (dto.categoryId) {
        await this.validateCategoryExists(storeId, dto.categoryId);
      }

      // Store original product for price tracking
      const originalProduct = Object.assign(new Product(), product);

      const updated = repo.merge(product, dto);
      const saved = await repo.save(updated);

      // Track price changes
      await this.trackPriceChanges(
        storeId,
        productId,
        originalProduct,
        saved,
        dto.updatedByUserId,
        'Product update',
      );

      this.logger.log(`Product updated successfully: ${productId}`);
      // Audit log
      await this.auditLogsService.create(storeId, {
        storeId,
        userId: dto.updatedByUserId ?? '',
        action: 'UPDATE',
        targetTable: 'Product',
        targetId: productId,
        metadata: {
          action: 'UPDATE',
          resource: 'Product',
          resourceId: productId,
          changes: { before: { ...originalProduct }, after: { ...saved } },
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
        storeId,
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
        storeId,
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

  /**
   * Search products by keyword (name, description, barcode)
   * @param storeId - Store ID
   * @param searchDto - Search parameters
   * @returns Paginated search results
   */
  async searchProducts(
    storeId: string,
    searchDto: ProductSearchDto,
  ): Promise<ProductPaginationDto> {
    try {
      this.logger.debug(
        `Searching products in store: ${storeId} with keyword: ${searchDto.keyword}`,
      );

      const repo = await this.getRepo(storeId);
      const queryBuilder = repo
        .createQueryBuilder('product')
        .where('product.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('product.is_active = :isActive', { isActive: true });

      // Add search conditions
      if (searchDto.keyword) {
        queryBuilder.andWhere(
          '(product.name ILIKE :keyword OR product.description ILIKE :keyword OR product.barcode ILIKE :keyword)',
          { keyword: `%${searchDto.keyword}%` },
        );
      }

      // Add sorting
      const sortBy = searchDto.sortBy || 'created_at';
      const sortOrder = searchDto.sortOrder || 'DESC';
      queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

      // Add pagination
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [products, total] = await queryBuilder.getManyAndCount();

      this.logger.debug(
        `Found ${products.length} products matching search criteria`,
      );

      return {
        data: products as any, // Will be transformed by controller
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to search products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find product by barcode
   * @param storeId - Store ID
   * @param barcode - Product barcode
   * @returns Product or null
   */
  async findByBarcode(
    storeId: string,
    barcode: string,
  ): Promise<Product | null> {
    try {
      this.logger.debug(
        `Finding product by barcode: ${barcode} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const product = await repo.findOne({
        where: {
          barcode,
          is_deleted: false,
          is_active: true,
        },
      });

      this.logger.debug(
        product ? `Product found: ${product.product_id}` : 'Product not found',
      );
      return product;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to find product by barcode: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find products by category
   * @param storeId - Store ID
   * @param categoryId - Category ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated products
   */
  async findByCategory(
    storeId: string,
    categoryId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ProductPaginationDto> {
    try {
      this.logger.debug(
        `Finding products by category: ${categoryId} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const offset = (page - 1) * limit;

      const [products, total] = await repo.findAndCount({
        where: {
          category_id: categoryId,
          is_deleted: false,
          is_active: true,
        },
        order: { created_at: 'DESC' },
        skip: offset,
        take: limit,
      });

      this.logger.debug(`Found ${products.length} products in category`);

      return {
        data: products as any,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to find products by category: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Advanced filter products with multiple criteria
   * @param storeId - Store ID
   * @param filterDto - Filter parameters
   * @returns Paginated filtered results
   */
  async filterProducts(
    storeId: string,
    filterDto: ProductFilterDto,
  ): Promise<ProductPaginationDto> {
    try {
      this.logger.debug(
        `Filtering products in store: ${storeId} with filters:`,
        filterDto,
      );

      const repo = await this.getRepo(storeId);
      const queryBuilder = repo
        .createQueryBuilder('product')
        .where('product.is_deleted = :isDeleted', { isDeleted: false });

      // Active status filter
      if (filterDto.isActive !== undefined) {
        queryBuilder.andWhere('product.is_active = :isActive', {
          isActive: filterDto.isActive,
        });
      } else {
        queryBuilder.andWhere('product.is_active = :isActive', {
          isActive: true,
        });
      }

      // Search text
      if (filterDto.search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search OR product.barcode ILIKE :search)',
          { search: `%${filterDto.search}%` },
        );
      }

      // Category filter
      if (filterDto.categoryId) {
        queryBuilder.andWhere('product.category_id = :categoryId', {
          categoryId: filterDto.categoryId,
        });
      }

      // Multiple categories filter
      if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
        queryBuilder.andWhere('product.category_id IN (:...categoryIds)', {
          categoryIds: filterDto.categoryIds,
        });
      }

      // Supplier filter
      if (filterDto.supplierId) {
        queryBuilder.andWhere('product.supplier_id = :supplierId', {
          supplierId: filterDto.supplierId,
        });
      }

      // Brand filter
      if (filterDto.brand) {
        queryBuilder.andWhere('product.brand ILIKE :brand', {
          brand: `%${filterDto.brand}%`,
        });
      }

      // Price range filter
      if (filterDto.minPrice !== undefined) {
        queryBuilder.andWhere('product.price_retail >= :minPrice', {
          minPrice: filterDto.minPrice,
        });
      }
      if (filterDto.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price_retail <= :maxPrice', {
          maxPrice: filterDto.maxPrice,
        });
      }

      // Stock range filter
      if (filterDto.minStock !== undefined) {
        queryBuilder.andWhere('product.stock >= :minStock', {
          minStock: filterDto.minStock,
        });
      }
      if (filterDto.maxStock !== undefined) {
        queryBuilder.andWhere('product.stock <= :maxStock', {
          maxStock: filterDto.maxStock,
        });
      }

      // Low stock filter
      if (filterDto.lowStock) {
        queryBuilder.andWhere('product.stock <= product.min_stock_level');
      }

      // Date range filter
      if (filterDto.dateFrom) {
        queryBuilder.andWhere('product.created_at >= :dateFrom', {
          dateFrom: filterDto.dateFrom,
        });
      }
      if (filterDto.dateTo) {
        queryBuilder.andWhere('product.created_at <= :dateTo', {
          dateTo: filterDto.dateTo,
        });
      }

      // Add sorting
      const sortBy = filterDto.sortBy || 'created_at';
      const sortOrder = filterDto.sortOrder || 'DESC';
      queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

      // Add pagination
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [products, total] = await queryBuilder.getManyAndCount();

      this.logger.debug(
        `Found ${products.length} products matching filter criteria`,
      );

      // Calculate additional metadata
      const totalValue = products.reduce(
        (sum, product) => sum + product.price_retail * product.stock,
        0,
      );
      const averagePrice =
        products.length > 0
          ? products.reduce((sum, product) => sum + product.price_retail, 0) /
            products.length
          : 0;
      const lowStockCount = products.filter(
        (product) => product.stock <= product.min_stock_level,
      ).length;
      const categories = [
        ...new Set(products.map((product) => product.category_id)),
      ];

      return {
        data: products as any,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        meta: {
          totalValue,
          averagePrice,
          lowStockCount,
          categories,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to filter products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find products with low stock (stock <= minStockLevel)
   * @param storeId - Store ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated low stock products
   */
  async findLowStockProducts(
    storeId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ProductPaginationDto> {
    try {
      this.logger.debug(`Finding low stock products in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const offset = (page - 1) * limit;

      const [products, total] = await repo.findAndCount({
        where: {
          is_deleted: false,
          is_active: true,
        },
        order: { stock: 'ASC' }, // Show lowest stock first
        skip: offset,
        take: limit,
      });

      // Filter products where stock <= min_stock_level
      const lowStockProducts = products.filter(
        (product) => product.stock <= product.min_stock_level,
      );
      const lowStockTotal = await repo.count({
        where: {
          is_deleted: false,
          is_active: true,
        },
      });

      // Count actual low stock products
      const actualLowStockCount = (
        await repo.find({
          where: {
            is_deleted: false,
            is_active: true,
          },
        })
      ).filter((product) => product.stock <= product.min_stock_level).length;

      this.logger.debug(`Found ${lowStockProducts.length} low stock products`);

      return {
        data: lowStockProducts as any,
        pagination: {
          page,
          limit,
          total: actualLowStockCount,
          totalPages: Math.ceil(actualLowStockCount / limit),
          hasNext: page < Math.ceil(actualLowStockCount / limit),
          hasPrev: page > 1,
        },
        meta: {
          lowStockCount: actualLowStockCount,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to find low stock products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get product statistics
   * @param storeId - Store ID
   * @returns Product statistics
   */
  async getProductStats(storeId: string): Promise<ProductStatsDto> {
    try {
      this.logger.debug(`Getting product statistics for store: ${storeId}`);

      const repo = await this.getRepo(storeId);

      // Get all active products
      const allProducts = await repo.find({
        where: {
          is_deleted: false,
        },
      });

      const activeProducts = allProducts.filter((product) => product.is_active);
      const lowStockProducts = activeProducts.filter(
        (product) => product.stock <= product.min_stock_level,
      );

      const totalInventoryValue = activeProducts.reduce(
        (sum, product) => sum + product.price_retail * product.stock,
        0,
      );
      const averagePrice =
        activeProducts.length > 0
          ? activeProducts.reduce(
              (sum, product) => sum + product.price_retail,
              0,
            ) / activeProducts.length
          : 0;

      // Get unique categories and brands
      const categories = [
        ...new Set(
          activeProducts.map((product) => product.category_id).filter(Boolean),
        ),
      ];
      const brands = [
        ...new Set(
          activeProducts.map((product) => product.brand).filter(Boolean),
        ),
      ];

      const stats: ProductStatsDto = {
        totalProducts: allProducts.length,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        totalInventoryValue,
        averagePrice,
        totalCategories: categories.length,
        totalBrands: brands.length,
      };

      this.logger.debug(`Product statistics calculated:`, stats);
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get product statistics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Update stock for a product
   * @param storeId - Store ID
   * @param productId - Product ID
   * @param newStock - New stock quantity
   * @param updatedByUserId - User ID who made the update
   * @returns Updated product
   */
  async updateStock(
    storeId: string,
    productId: string,
    newStock: number,
    updatedByUserId?: string,
  ): Promise<Product> {
    try {
      this.logger.log(
        `Updating stock for product: ${productId} to ${newStock} in store: ${storeId}`,
      );

      const { repo, product } = await this.findOneProduc(storeId, productId);
      const oldStock = product.stock;

      product.stock = newStock;
      product.updated_by_user_id = updatedByUserId;

      const saved = await repo.save(product);

      // Audit log for stock update
      await this.auditLogsService.create(storeId, {
        storeId,
        userId: updatedByUserId ?? '',
        action: 'UPDATE_STOCK',
        targetTable: 'Product',
        targetId: productId,
        metadata: {
          action: 'UPDATE_STOCK',
          resource: 'Product',
          resourceId: productId,
          changes: {
            stock: { before: oldStock, after: newStock },
            updatedBy: updatedByUserId,
          },
        },
      });

      this.logger.log(`Stock updated successfully for product: ${productId}`);
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update stock: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Bulk update products
   * @param storeId - Store ID
   * @param bulkUpdateDto - Bulk update data
   * @returns Operation result
   */
  async bulkUpdateProducts(
    storeId: string,
    bulkUpdateDto: BulkUpdateRequestDto,
  ): Promise<BulkOperationResultDto> {
    try {
      this.logger.log(
        `Bulk updating ${bulkUpdateDto.products.length} products in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const result: BulkOperationResultDto = {
        successCount: 0,
        failureCount: 0,
        totalCount: bulkUpdateDto.products.length,
        errors: [],
        successIds: [],
        failureIds: [],
      };

      for (const productUpdate of bulkUpdateDto.products) {
        try {
          // Find product
          const product = await repo.findOne({
            where: {
              product_id: productUpdate.productId,
              is_deleted: false,
            },
          });

          if (!product) {
            result.failureCount++;
            result.failureIds.push(productUpdate.productId);
            result.errors.push(`Product ${productUpdate.productId} not found`);
            continue;
          }

          // Validate category if provided
          if (productUpdate.categoryId) {
            await this.validateCategoryExists(
              storeId,
              productUpdate.categoryId,
            );
          }

          // Update fields
          if (productUpdate.priceRetail !== undefined)
            product.price_retail = productUpdate.priceRetail;
          if (productUpdate.priceWholesale !== undefined)
            product.price_wholesale = productUpdate.priceWholesale;
          if (productUpdate.stock !== undefined)
            product.stock = productUpdate.stock;
          if (productUpdate.isActive !== undefined)
            product.is_active = productUpdate.isActive;
          if (productUpdate.categoryId !== undefined)
            product.category_id = productUpdate.categoryId;
          if (productUpdate.brand !== undefined)
            product.brand = productUpdate.brand;

          product.updated_by_user_id = bulkUpdateDto.updatedByUserId;

          await repo.save(product);

          result.successCount++;
          result.successIds.push(productUpdate.productId);

          // Audit log
          await this.auditLogsService.create(storeId, {
            storeId,
            userId: bulkUpdateDto.updatedByUserId ?? '',
            action: 'BULK_UPDATE',
            targetTable: 'Product',
            targetId: productUpdate.productId,
            metadata: {
              action: 'BULK_UPDATE',
              resource: 'Product',
              resourceId: productUpdate.productId,
              changes: productUpdate,
            },
          });
        } catch (error) {
          result.failureCount++;
          result.failureIds.push(productUpdate.productId);
          result.errors.push(
            `Product ${productUpdate.productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `Bulk update completed: ${result.successCount} success, ${result.failureCount} failures`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to bulk update products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Bulk delete products (soft delete)
   * @param storeId - Store ID
   * @param bulkDeleteDto - Bulk delete data
   * @returns Operation result
   */
  async bulkDeleteProducts(
    storeId: string,
    bulkDeleteDto: BulkDeleteRequestDto,
  ): Promise<BulkOperationResultDto> {
    try {
      this.logger.log(
        `Bulk deleting ${bulkDeleteDto.productIds.length} products in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const result: BulkOperationResultDto = {
        successCount: 0,
        failureCount: 0,
        totalCount: bulkDeleteDto.productIds.length,
        errors: [],
        successIds: [],
        failureIds: [],
      };

      for (const productId of bulkDeleteDto.productIds) {
        try {
          const product = await repo.findOne({
            where: {
              product_id: productId,
              is_deleted: false,
            },
          });

          if (!product) {
            result.failureCount++;
            result.failureIds.push(productId);
            result.errors.push(`Product ${productId} not found`);
            continue;
          }

          product.is_deleted = true;
          product.updated_by_user_id = bulkDeleteDto.updatedByUserId;

          await repo.save(product);

          result.successCount++;
          result.successIds.push(productId);

          // Audit log
          await this.auditLogsService.create(storeId, {
            storeId,
            userId: bulkDeleteDto.updatedByUserId ?? '',
            action: 'BULK_DELETE',
            targetTable: 'Product',
            targetId: productId,
            metadata: {
              action: 'BULK_DELETE',
              resource: 'Product',
              resourceId: productId,
              changes: { is_deleted: true },
            },
          });
        } catch (error) {
          result.failureCount++;
          result.failureIds.push(productId);
          result.errors.push(
            `Product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `Bulk delete completed: ${result.successCount} success, ${result.failureCount} failures`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to bulk delete products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Bulk stock adjustment
   * @param storeId - Store ID
   * @param bulkStockDto - Bulk stock adjustment data
   * @returns Operation result
   */
  async bulkStockAdjustment(
    storeId: string,
    bulkStockDto: BulkStockAdjustmentDto,
  ): Promise<BulkOperationResultDto> {
    try {
      this.logger.log(
        `Bulk stock adjustment for ${bulkStockDto.adjustments.length} products in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const result: BulkOperationResultDto = {
        successCount: 0,
        failureCount: 0,
        totalCount: bulkStockDto.adjustments.length,
        errors: [],
        successIds: [],
        failureIds: [],
      };

      for (const adjustment of bulkStockDto.adjustments) {
        try {
          const product = await repo.findOne({
            where: {
              product_id: adjustment.productId,
              is_deleted: false,
              is_active: true,
            },
          });

          if (!product) {
            result.failureCount++;
            result.failureIds.push(adjustment.productId);
            result.errors.push(`Product ${adjustment.productId} not found`);
            continue;
          }

          const oldStock = product.stock;
          const newStock = oldStock + adjustment.adjustment;

          // Validate new stock is not negative
          if (newStock < 0) {
            result.failureCount++;
            result.failureIds.push(adjustment.productId);
            result.errors.push(
              `Product ${adjustment.productId}: Stock cannot be negative (current: ${oldStock}, adjustment: ${adjustment.adjustment})`,
            );
            continue;
          }

          product.stock = newStock;
          product.updated_by_user_id = bulkStockDto.updatedByUserId;

          await repo.save(product);

          result.successCount++;
          result.successIds.push(adjustment.productId);

          // Audit log
          await this.auditLogsService.create(storeId, {
            storeId,
            userId: bulkStockDto.updatedByUserId ?? '',
            action: 'BULK_STOCK_ADJUSTMENT',
            targetTable: 'Product',
            targetId: adjustment.productId,
            metadata: {
              action: 'BULK_STOCK_ADJUSTMENT',
              resource: 'Product',
              resourceId: adjustment.productId,
              changes: {
                stock: {
                  before: oldStock,
                  after: newStock,
                  adjustment: adjustment.adjustment,
                },
                reason: adjustment.reason,
              },
            },
          });
        } catch (error) {
          result.failureCount++;
          result.failureIds.push(adjustment.productId);
          result.errors.push(
            `Product ${adjustment.productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `Bulk stock adjustment completed: ${result.successCount} success, ${result.failureCount} failures`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to bulk adjust stock: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Track price changes and create price history
   * @param storeId - Store ID
   * @param productId - Product ID
   * @param oldProduct - Product before update
   * @param newProduct - Product after update
   * @param updatedByUserId - User ID who made the update
   * @param reason - Reason for price change
   */
  private async trackPriceChanges(
    storeId: string,
    productId: string,
    oldProduct: Product,
    newProduct: Product,
    updatedByUserId?: string,
    reason?: string,
  ): Promise<void> {
    try {
      const priceChanges: Array<{
        type: 'retail' | 'wholesale' | 'credit' | 'cost';
        oldPrice: number;
        newPrice: number;
      }> = [];

      // Check retail price change
      if (oldProduct.price_retail !== newProduct.price_retail) {
        priceChanges.push({
          type: 'retail',
          oldPrice: oldProduct.price_retail,
          newPrice: newProduct.price_retail,
        });
      }

      // Check wholesale price change
      if (oldProduct.price_wholesale !== newProduct.price_wholesale) {
        priceChanges.push({
          type: 'wholesale',
          oldPrice: oldProduct.price_wholesale || 0,
          newPrice: newProduct.price_wholesale || 0,
        });
      }

      // Check credit price change
      if (oldProduct.credit_price !== newProduct.credit_price) {
        priceChanges.push({
          type: 'credit',
          oldPrice: oldProduct.credit_price || 0,
          newPrice: newProduct.credit_price || 0,
        });
      }

      // Check cost price change
      if (oldProduct.cost_price !== newProduct.cost_price) {
        priceChanges.push({
          type: 'cost',
          oldPrice: oldProduct.cost_price || 0,
          newPrice: newProduct.cost_price || 0,
        });
      }

      // Create price history records for each change
      for (const change of priceChanges) {
        await this.priceHistoryService.createPriceHistories(storeId, {
          productId,
          priceType: change.type,
          oldPrice: change.oldPrice,
          newPrice: change.newPrice,
          reason: reason || 'Product update',
          changedByUserId: updatedByUserId,
          metadata: {
            source: 'product_update',
            timestamp: new Date().toISOString(),
          },
        });
      }

      if (priceChanges.length > 0) {
        this.logger.debug(
          `Created ${priceChanges.length} price history records for product: ${productId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to track price changes for product ${productId}:`,
        error,
      );
      // Don't throw error to avoid breaking the main update operation
    }
  }

  /**
   * Validate if categoryId exists in the system
   * @param storeId - Store ID
   * @param categoryId - Category ID to validate
   * @throws InternalServerErrorException if category doesn't exist
   */
  private async validateCategoryExists(
    storeId: string,
    categoryId: string,
  ): Promise<void> {
    try {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const categoryRepo = dataSource.getRepository(Category);

      const category = await categoryRepo.findOne({
        where: {
          category_id: categoryId,
          is_deleted: false,
          is_active: true,
        },
      });

      if (!category) {
        throw new InternalServerErrorException(
          `❌ Danh mục với ID "${categoryId}" không tồn tại trong hệ thống`,
        );
      }
    } catch (error) {
      // Re-throw InternalServerErrorException
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // Handle other errors
      this.logger.error(`Error validating category existence: ${error}`);
      throw new InternalServerErrorException(
        `❌ Lỗi kiểm tra danh mục: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
