import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Supplier } from 'src/entities/tenant/supplier.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import {
  SupplierProductFilterDto,
  SupplierProductsResponseDto,
  SupplierSummaryDto,
  SupplierProductDto,
  SupplierPerformanceDto,
  SupplierAnalyticsDto,
} from '../dto/supplier-integration.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { Product } from 'src/entities/tenant/product.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class SupplierIntegrationService extends TenantBaseService<Product> {
  protected readonly logger = new Logger(SupplierIntegrationService.name);
  protected primaryKey = 'product_id';

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
  ) {
    super(tenantDataSourceService, Product);
  }

  /**
   * Get products by supplier with pagination
   * @param storeId - Store ID
   * @param supplierId - Supplier ID
   * @param filterDto - Filter parameters
   * @returns Supplier products with pagination
   */
  async getSupplierProducts(
    storeId: string,
    supplierId: string,
    filterDto: SupplierProductFilterDto,
  ): Promise<SupplierProductsResponseDto> {
    try {
      this.logger.debug(
        `Getting products for supplier: ${supplierId} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const supplierRepo = dataSource.getRepository(Supplier);

      // Get supplier info
      const supplier = await supplierRepo.findOne({
        where: { id: supplierId, is_deleted: false },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
      }

      // Build query for products
      const queryBuilder = productRepo
        .createQueryBuilder('product')
        .where('product.supplier_id = :supplierId', { supplierId })
        .andWhere('product.is_deleted = :isDeleted', { isDeleted: false });

      // Apply additional filters
      if (filterDto.dateFrom) {
        queryBuilder.andWhere('product.created_at >= :dateFrom', {
          dateFrom: new Date(filterDto.dateFrom),
        });
      }

      if (filterDto.dateTo) {
        queryBuilder.andWhere('product.created_at <= :dateTo', {
          dateTo: new Date(filterDto.dateTo),
        });
      }

      // Add sorting
      const sortBy = filterDto.sortBy ?? 'name';
      const sortOrder = filterDto.sortOrder ?? 'ASC';

      let orderField = 'product.name';
      if (sortBy === 'created_at') orderField = 'product.created_at';
      else if (sortBy === 'product_count') orderField = 'product.stock';
      else if (sortBy === 'total_value')
        orderField = '(product.price_retail * product.stock)';

      queryBuilder.orderBy(orderField, sortOrder);

      // Add pagination
      const page = filterDto.page ?? 1;
      const limit = filterDto.limit ?? 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [products, total] = await queryBuilder.getManyAndCount();

      // Calculate supplier summary
      const allProducts = await productRepo.find({
        where: { supplier_id: supplierId, is_deleted: false },
      });

      const supplierSummary: SupplierSummaryDto = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        contactPerson: supplier.contact_person,
        productCount: allProducts.length,
        totalInventoryValue: allProducts.reduce(
          (sum, p) => sum + p.price_retail * p.stock,
          0,
        ),
        activeProducts: allProducts.filter((p) => p.is_active).length,
        lowStockProducts: allProducts.filter(
          (p) => p.stock <= p.min_stock_level,
        ).length,
        averagePrice:
          allProducts.length > 0
            ? allProducts.reduce((sum, p) => sum + p.price_retail, 0) /
              allProducts.length
            : 0,
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at,
      };

      // Transform products to DTOs
      const productDtos: SupplierProductDto[] = products.map((product) => ({
        productId: product.product_id,
        productName: product.name,
        // sku: product.sku,
        barcode: product.barcode,
        category: product.category_id,
        priceRetail: product.price_retail,
        priceWholesale: product.price_wholesale,
        costPrice: product.cost_price,
        currentStock: product.stock,
        minStockLevel: product.min_stock_level,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      return {
        supplier: supplierSummary,
        products: productDtos,
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
        `Failed to get supplier products: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get supplier performance analytics
   * @param storeId - Store ID
   * @param filterDto - Filter parameters
   * @returns Supplier performance data
   */
  async getSupplierPerformance(
    storeId: string,
    _filterDto: SupplierProductFilterDto,
  ): Promise<SupplierPerformanceDto[]> {
    try {
      this.logger.debug(`Getting supplier performance for store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const supplierRepo = dataSource.getRepository(Supplier);
      const productRepo = dataSource.getRepository(Product);

      // Get all active suppliers
      const suppliers = await supplierRepo.find({
        where: { is_deleted: false },
      });

      const performance: SupplierPerformanceDto[] = [];
      let totalInventoryValue = 0;

      // Calculate total inventory value first
      const allProducts = await productRepo.find({
        where: { is_deleted: false, is_active: true },
      });
      totalInventoryValue = allProducts.reduce(
        (sum, p) => sum + p.price_retail * p.stock,
        0,
      );

      for (const supplier of suppliers) {
        // Get products for this supplier
        const supplierProducts = await productRepo.find({
          where: {
            supplier_id: supplier.id,
            is_deleted: false,
            is_active: true,
          },
        });

        if (supplierProducts.length === 0) continue;

        const inventoryValue = supplierProducts.reduce(
          (sum, p) => sum + p.price_retail * p.stock,
          0,
        );
        const valuePercentage =
          totalInventoryValue > 0
            ? (inventoryValue / totalInventoryValue) * 100
            : 0;

        // Simplified calculations for demo
        const averageTurnoverRatio = Math.random() * 5 + 1;
        const fastMovingProducts = Math.floor(supplierProducts.length * 0.3);
        const slowMovingProducts = Math.floor(supplierProducts.length * 0.2);
        const lowStockProducts = supplierProducts.filter(
          (p) => p.stock <= p.min_stock_level,
        ).length;

        // Calculate performance score
        const performanceScore = Math.min(
          100,
          Math.max(
            0,
            averageTurnoverRatio * 20 +
              valuePercentage * 2 +
              ((supplierProducts.length - lowStockProducts) /
                supplierProducts.length) *
                30,
          ),
        );

        // Determine trend and rating
        const trend: 'increasing' | 'decreasing' | 'stable' =
          Math.random() > 0.6
            ? 'increasing'
            : Math.random() > 0.3
              ? 'stable'
              : 'decreasing';
        let rating: 'excellent' | 'good' | 'average' | 'poor';
        if (performanceScore >= 80) rating = 'excellent';
        else if (performanceScore >= 60) rating = 'good';
        else if (performanceScore >= 40) rating = 'average';
        else rating = 'poor';

        performance.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          productCount: supplierProducts.length,
          totalInventoryValue: inventoryValue,
          valuePercentage,
          averageTurnoverRatio,
          fastMovingProducts,
          slowMovingProducts,
          lowStockProducts,
          performanceScore,
          trend,
          rating,
        });
      }

      // Sort by performance score
      return performance.sort(
        (a, b) => b.performanceScore - a.performanceScore,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get supplier performance: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get supplier analytics overview
   * @param storeId - Store ID
   * @returns Supplier analytics data
   */
  async getSupplierAnalytics(storeId: string): Promise<SupplierAnalyticsDto> {
    try {
      this.logger.debug(`Getting supplier analytics for store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const supplierRepo = dataSource.getRepository(Supplier);
      const productRepo = dataSource.getRepository(Product);

      // Get basic counts
      const totalSuppliers = await supplierRepo.count({
        where: { is_deleted: false },
      });
      const activeSuppliers = await supplierRepo.count({
        where: { is_deleted: false },
      });

      const totalProducts = await productRepo.count({
        where: {
          is_deleted: false,
        },
      });

      const allProducts = await productRepo.find({
        where: { is_deleted: false, is_active: true },
      });

      const totalInventoryValue = allProducts.reduce(
        (sum, p) => sum + p.price_retail * p.stock,
        0,
      );
      const averageValuePerSupplier =
        activeSuppliers > 0 ? totalInventoryValue / activeSuppliers : 0;
      const averageProductsPerSupplier =
        activeSuppliers > 0 ? totalProducts / activeSuppliers : 0;

      // Get top performers
      const topPerformers = await this.getSupplierPerformance(storeId, {});
      const top5Performers = topPerformers.slice(0, 5);

      // Calculate performance distribution
      const performanceDistribution = {
        excellent: topPerformers.filter((p) => p.rating === 'excellent').length,
        good: topPerformers.filter((p) => p.rating === 'good').length,
        average: topPerformers.filter((p) => p.rating === 'average').length,
        poor: topPerformers.filter((p) => p.rating === 'poor').length,
      };

      return {
        totalSuppliers,
        activeSuppliers,
        totalProducts,
        totalInventoryValue,
        averageValuePerSupplier,
        averageProductsPerSupplier,
        topPerformers: top5Performers,
        performanceDistribution,
        generatedAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get supplier analytics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
