import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TenantBaseService } from 'src/core/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/core/tenant/tenant-datasource.service';
import { Product } from '../entity/product.entity';
import { Supplier } from 'src/entities/tenant/supplier.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { 
  SupplierProductDto,
  SupplierSummaryDto,
  AssignSupplierDto,
  UnassignSupplierDto,
  SupplierOperationResultDto
} from '../dto/supplier-integration.dto';

@Injectable()
export class SupplierIntegrationExtendedService extends TenantBaseService<Product> {
  private readonly logger = new Logger(SupplierIntegrationExtendedService.name);

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
  ) {
    super(tenantDataSourceService, Product);
  }

  /**
   * Assign supplier to products
   * @param storeId - Store ID
   * @param assignDto - Assignment data
   * @returns Operation result
   */
  async assignSupplierToProducts(storeId: string, assignDto: AssignSupplierDto): Promise<SupplierOperationResultDto> {
    try {
      this.logger.log(`Assigning supplier ${assignDto.supplierId} to ${assignDto.productIds.length} products in store: ${storeId}`);

      const dataSource = await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const supplierRepo = dataSource.getRepository(Supplier);

      // Validate supplier exists
      const supplier = await supplierRepo.findOne({
        where: { id: assignDto.supplierId, is_deleted: false },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${assignDto.supplierId} not found`);
      }

      const result: SupplierOperationResultDto = {
        successCount: 0,
        failureCount: 0,
        totalCount: assignDto.productIds.length,
        errors: [],
        successIds: [],
        failureIds: [],
        supplierInfo: {
          supplierId: supplier.id,
          supplierName: supplier.name,
        },
      };

      for (const productId of assignDto.productIds) {
        try {
          const product = await productRepo.findOne({
            where: { product_id: productId, is_deleted: false },
          });

          if (!product) {
            result.failureCount++;
            result.failureIds.push(productId);
            result.errors.push(`Product ${productId} not found`);
            continue;
          }

          const oldSupplierId = product.supplier_id;
          product.supplier_id = assignDto.supplierId;
          product.updated_by_user_id = assignDto.updatedByUserId;

          await productRepo.save(product);

          result.successCount++;
          result.successIds.push(productId);

          // Audit log
          await this.auditLogsService.create(storeId, {
            userId: assignDto.updatedByUserId ?? '',
            action: 'ASSIGN_SUPPLIER',
            targetTable: 'Product',
            targetId: productId,
            metadata: {
              action: 'ASSIGN_SUPPLIER',
              resource: 'Product',
              resourceId: productId,
              changes: {
                supplier_id: { before: oldSupplierId, after: assignDto.supplierId },
                supplier_name: supplier.name,
                note: assignDto.note,
              },
            },
          });

        } catch (error) {
          result.failureCount++;
          result.failureIds.push(productId);
          result.errors.push(`Product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.logger.log(`Supplier assignment completed: ${result.successCount} success, ${result.failureCount} failures`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to assign supplier: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Unassign supplier from products
   * @param storeId - Store ID
   * @param unassignDto - Unassignment data
   * @returns Operation result
   */
  async unassignSupplierFromProducts(storeId: string, unassignDto: UnassignSupplierDto): Promise<SupplierOperationResultDto> {
    try {
      this.logger.log(`Unassigning supplier from ${unassignDto.productIds.length} products in store: ${storeId}`);

      const productRepo = await this.getRepo(storeId);

      const result: SupplierOperationResultDto = {
        successCount: 0,
        failureCount: 0,
        totalCount: unassignDto.productIds.length,
        errors: [],
        successIds: [],
        failureIds: [],
      };

      for (const productId of unassignDto.productIds) {
        try {
          const product = await productRepo.findOne({
            where: { product_id: productId, is_deleted: false },
          });

          if (!product) {
            result.failureCount++;
            result.failureIds.push(productId);
            result.errors.push(`Product ${productId} not found`);
            continue;
          }

          const oldSupplierId = product.supplier_id;
          product.supplier_id = undefined;
          product.updated_by_user_id = unassignDto.updatedByUserId;

          await productRepo.save(product);

          result.successCount++;
          result.successIds.push(productId);

          // Audit log
          await this.auditLogsService.create(storeId, {
            userId: unassignDto.updatedByUserId ?? '',
            action: 'UNASSIGN_SUPPLIER',
            targetTable: 'Product',
            targetId: productId,
            metadata: {
              action: 'UNASSIGN_SUPPLIER',
              resource: 'Product',
              resourceId: productId,
              changes: {
                supplier_id: { before: oldSupplierId, after: null },
                note: unassignDto.note,
              },
            },
          });

        } catch (error) {
          result.failureCount++;
          result.failureIds.push(productId);
          result.errors.push(`Product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.logger.log(`Supplier unassignment completed: ${result.successCount} success, ${result.failureCount} failures`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to unassign supplier: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Get products without supplier
   * @param storeId - Store ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Products without supplier
   */
  async getProductsWithoutSupplier(storeId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      this.logger.debug(`Getting products without supplier in store: ${storeId}`);

      const productRepo = await this.getRepo(storeId);
      const offset = (page - 1) * limit;

      const queryBuilder = productRepo.createQueryBuilder('product')
        .where('product.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('(product.supplier_id IS NULL OR product.supplier_id = \'\')')
        .orderBy('product.created_at', 'DESC')
        .skip(offset)
        .take(limit);

      const [products, total] = await queryBuilder.getManyAndCount();

      const productDtos: SupplierProductDto[] = products.map(product => ({
        productId: product.product_id,
        productName: product.name,
        sku: product.sku,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get products without supplier: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Get all suppliers with product counts
   * @param storeId - Store ID
   * @returns Suppliers with product counts
   */
  async getSuppliersWithProductCounts(storeId: string): Promise<SupplierSummaryDto[]> {
    try {
      this.logger.debug(`Getting suppliers with product counts for store: ${storeId}`);

      const dataSource = await this.tenantDataSourceService.getTenantDataSource(storeId);
      const supplierRepo = dataSource.getRepository(Supplier);
      const productRepo = dataSource.getRepository(Product);

      const suppliers = await supplierRepo.find({
        where: { is_deleted: false },
        order: { name: 'ASC' },
      });

      const supplierSummaries: SupplierSummaryDto[] = [];

      for (const supplier of suppliers) {
        const products = await productRepo.find({
          where: { supplier_id: supplier.id, is_deleted: false },
        });

        const activeProducts = products.filter(p => p.is_active);
        const totalInventoryValue = products.reduce((sum, p) => sum + (p.price_retail * p.stock), 0);
        const lowStockProducts = products.filter(p => p.stock <= p.min_stock_level);
        const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price_retail, 0) / products.length : 0;

        supplierSummaries.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          contactPerson: supplier.contact_person,
          productCount: products.length,
          totalInventoryValue,
          activeProducts: activeProducts.length,
          lowStockProducts: lowStockProducts.length,
          averagePrice,
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at,
        });
      }

      return supplierSummaries.sort((a, b) => b.totalInventoryValue - a.totalInventoryValue);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get suppliers with product counts: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
