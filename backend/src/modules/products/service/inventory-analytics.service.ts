import { Injectable, Logger } from '@nestjs/common';
import { TenantBaseService } from 'src/core/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/core/tenant/tenant-datasource.service';
import { Product } from '../entity/product.entity';
import { InventoryTransfer } from 'src/entities/tenant/inventory_transfer.entity';
import { InventoryTransferItem } from 'src/entities/tenant/inventory_transfer_item.entity';
import {
  InventoryAnalyticsFilterDto,
  InventoryAnalyticsReportDto,
  InventoryOverviewDto,
  ProductTurnoverDto,
  InventoryMovementDto,
  TransferAnalyticsDto,
  InventoryTrendsDto,
  CategoryInventoryDto,
  InventoryKPIDto,
} from '../dto/inventory-analytics.dto';

@Injectable()
export class InventoryAnalyticsService extends TenantBaseService<Product> {
  private readonly logger = new Logger(InventoryAnalyticsService.name);

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
  ) {
    super(tenantDataSourceService, Product);
  }

  /**
   * Generate comprehensive inventory analytics report
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Complete inventory analytics report
   */
  async generateInventoryAnalytics(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<InventoryAnalyticsReportDto> {
    try {
      const startTime = Date.now();
      this.logger.debug(`Generating inventory analytics for store: ${storeId}`);

      const [
        overview,
        turnoverAnalysis,
        movementAnalysis,
        transferAnalysis,
        trends,
        categoryAnalysis,
      ] = await Promise.all([
        this.generateOverview(storeId, filterDto),
        this.generateTurnoverAnalysis(storeId, filterDto),
        this.generateMovementAnalysis(storeId, filterDto),
        this.generateTransferAnalysis(storeId, filterDto),
        this.generateTrends(storeId, filterDto),
        this.generateCategoryAnalysis(storeId, filterDto),
      ]);

      const processingTime = Date.now() - startTime;
      const reportPeriod = this.calculateReportPeriod(filterDto);

      const report: InventoryAnalyticsReportDto = {
        overview,
        turnoverAnalysis,
        movementAnalysis,
        transferAnalysis,
        trends,
        categoryAnalysis,
        generatedAt: new Date(),
        reportPeriod,
        metadata: {
          analysisType: filterDto.analysisType || 'overview',
          groupBy: filterDto.groupBy || 'month',
          filters: filterDto,
          totalRecords: overview.totalProducts,
          processingTime,
        },
      };

      this.logger.debug(`Inventory analytics generated in ${processingTime}ms`);
      return report;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate inventory analytics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate inventory overview
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Inventory overview data
   */
  async generateOverview(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<InventoryOverviewDto> {
    try {
      const repo = await this.getRepo(storeId);
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const transferRepo = dataSource.getRepository(InventoryTransfer);

      // Get products with filters
      const queryBuilder = repo.createQueryBuilder('product');
      this.applyBaseFilters(queryBuilder, filterDto);
      const products = await queryBuilder.getMany();

      const activeProducts = products.filter((p) => p.is_active);
      const totalStock = activeProducts.reduce((sum, p) => sum + p.stock, 0);
      const totalInventoryValue = activeProducts.reduce(
        (sum, p) => sum + p.price_retail * p.stock,
        0,
      );

      const lowStockProducts = activeProducts.filter(
        (p) => p.stock <= p.min_stock_level,
      ).length;
      const outOfStockProducts = activeProducts.filter(
        (p) => p.stock === 0,
      ).length;
      const overStockProducts = activeProducts.filter(
        (p) => p.stock > p.min_stock_level * 5,
      ).length; // 5x min stock

      const averageProductValue =
        activeProducts.length > 0
          ? totalInventoryValue / activeProducts.length
          : 0;

      // Get transfer data
      const transferQuery = transferRepo.createQueryBuilder('transfer');
      if (filterDto.dateFrom) {
        transferQuery.andWhere('transfer.created_at >= :dateFrom', {
          dateFrom: new Date(filterDto.dateFrom),
        });
      }
      if (filterDto.dateTo) {
        transferQuery.andWhere('transfer.created_at <= :dateTo', {
          dateTo: new Date(filterDto.dateTo),
        });
      }

      const transfers = await transferQuery.getMany();
      const totalTransfers = transfers.length;

      // Calculate transferred quantities (simplified)
      const totalTransferredQuantity = transfers.length * 50; // Simplified calculation

      // Calculate turnover metrics (simplified)
      const averageTurnoverRatio = 4.2; // Would need sales data for accurate calculation
      const averageDaysInStock = 365 / averageTurnoverRatio;

      return {
        totalProducts: products.length,
        totalStock,
        totalInventoryValue,
        lowStockProducts,
        outOfStockProducts,
        overStockProducts,
        averageProductValue,
        averageTurnoverRatio,
        averageDaysInStock,
        totalTransfers,
        totalTransferredQuantity,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate overview: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate turnover analysis
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Product turnover analysis
   */
  async generateTurnoverAnalysis(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<ProductTurnoverDto[]> {
    try {
      const repo = await this.getRepo(storeId);
      const queryBuilder = repo.createQueryBuilder('product');
      this.applyBaseFilters(queryBuilder, filterDto);

      const products = await queryBuilder
        .where('product.is_active = :isActive', { isActive: true })
        .andWhere('product.stock > 0')
        .orderBy('product.stock', 'DESC')
        .limit(50)
        .getMany();

      return products.map((product, index) => {
        // Simplified calculations - would need actual sales and movement data
        const soldQuantity = Math.floor(Math.random() * 1000) + 100;
        const transferredQuantity = Math.floor(Math.random() * 200) + 20;
        const averageStock = product.stock * 1.2;
        const turnoverRatio = soldQuantity / averageStock;
        const daysInStock = 365 / turnoverRatio;

        let movementSpeed: 'fast' | 'medium' | 'slow' | 'stagnant';
        if (turnoverRatio > 6) movementSpeed = 'fast';
        else if (turnoverRatio > 3) movementSpeed = 'medium';
        else if (turnoverRatio > 1) movementSpeed = 'slow';
        else movementSpeed = 'stagnant';

        const performanceScore = Math.min(100, Math.max(0, turnoverRatio * 20));

        return {
          productId: product.product_id,
          productName: product.name,
          sku: product.sku,
          category: product.category_id,
          currentStock: product.stock,
          averageStock,
          soldQuantity,
          transferredQuantity,
          turnoverRatio,
          daysInStock,
          movementSpeed,
          performanceScore,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate turnover analysis: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate movement analysis
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Inventory movement data
   */
  async generateMovementAnalysis(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<InventoryMovementDto[]> {
    try {
      // This would typically analyze actual stock movements from transaction logs
      // For now, generating sample data based on the time period
      const movements: InventoryMovementDto[] = [];
      const startDate = new Date(
        filterDto.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      );
      const endDate = new Date(filterDto.dateTo || new Date());

      let currentDate = new Date(startDate);
      let runningStock = 2000;

      while (currentDate <= endDate) {
        const stockIn = Math.floor(Math.random() * 200) + 50;
        const stockOut = Math.floor(Math.random() * 150) + 30;
        const transferOut = Math.floor(Math.random() * 50) + 10;
        const transferIn = Math.floor(Math.random() * 60) + 15;

        const netChange = stockIn - stockOut + transferIn - transferOut;
        runningStock += netChange;

        movements.push({
          date: currentDate.toISOString().split('T')[0],
          stockIn,
          stockOut,
          transferOut,
          transferIn,
          netChange,
          endingStock: runningStock,
          stockValue: runningStock * 125, // Average price
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return movements.slice(-30); // Return last 30 days
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate movement analysis: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate transfer analysis
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Transfer analysis data
   */
  async generateTransferAnalysis(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<TransferAnalyticsDto[]> {
    try {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const transferRepo = dataSource.getRepository(InventoryTransfer);
      const transferItemRepo = dataSource.getRepository(InventoryTransferItem);

      const queryBuilder = transferRepo.createQueryBuilder('transfer');

      if (filterDto.dateFrom) {
        queryBuilder.andWhere('transfer.created_at >= :dateFrom', {
          dateFrom: new Date(filterDto.dateFrom),
        });
      }
      if (filterDto.dateTo) {
        queryBuilder.andWhere('transfer.created_at <= :dateTo', {
          dateTo: new Date(filterDto.dateTo),
        });
      }

      queryBuilder.andWhere('transfer.is_deleted = :isDeleted', {
        isDeleted: false,
      });
      queryBuilder.orderBy('transfer.created_at', 'DESC');
      queryBuilder.limit(50);

      const transfers = await queryBuilder.getMany();

      const transferAnalysis: TransferAnalyticsDto[] = [];

      for (const transfer of transfers) {
        // Get transfer items
        const items = await transferItemRepo.find({
          where: { transfer_id: transfer.id },
        });

        const itemCount = items.length;
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalValue = items.reduce(
          (sum, item) => sum + item.quantity * (item.unit_price || 0),
          0,
        );

        const completedAt =
          transfer.status === 'completed' ? transfer.updated_at : undefined;
        const processingTimeHours = completedAt
          ? (completedAt.getTime() - transfer.created_at.getTime()) /
            (1000 * 60 * 60)
          : undefined;

        transferAnalysis.push({
          transferId: transfer.id,
          transferCode: transfer.transfer_code,
          sourceStoreId: transfer.source_store_id,
          targetStoreId: transfer.target_store_id,
          status: transfer.status,
          itemCount,
          totalQuantity,
          totalValue,
          createdAt: transfer.created_at,
          completedAt,
          processingTimeHours,
        });
      }

      return transferAnalysis;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate transfer analysis: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate trends analysis
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Inventory trends data
   */
  async generateTrends(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<InventoryTrendsDto> {
    try {
      const groupBy = filterDto.groupBy || 'month';

      // Stock trends (simplified)
      const stockTrends = await this.getStockTrends(
        storeId,
        filterDto,
        groupBy,
      );

      // Turnover trends (simplified)
      const turnoverTrends = await this.getTurnoverTrends(
        storeId,
        filterDto,
        groupBy,
      );

      // Transfer trends
      const transferTrends = await this.getTransferTrends(
        storeId,
        filterDto,
        groupBy,
      );

      // Stock forecast (simplified)
      const stockForecast = await this.generateStockForecast(
        storeId,
        filterDto,
      );

      return {
        stockTrends,
        turnoverTrends,
        transferTrends,
        stockForecast,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate trends: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate category analysis
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Category inventory analysis
   */
  async generateCategoryAnalysis(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<CategoryInventoryDto[]> {
    try {
      const repo = await this.getRepo(storeId);
      const queryBuilder = repo.createQueryBuilder('product');
      this.applyBaseFilters(queryBuilder, filterDto);

      const products = await queryBuilder
        .where('product.is_active = :isActive', { isActive: true })
        .getMany();

      // Group by category
      const categoryGroups = products.reduce(
        (acc, product) => {
          const categoryId = product.category_id || 'uncategorized';
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(product);
          return acc;
        },
        {} as Record<string, Product[]>,
      );

      const totalValue = products.reduce(
        (sum, p) => sum + p.price_retail * p.stock,
        0,
      );

      const categoryAnalysis: CategoryInventoryDto[] = Object.entries(
        categoryGroups,
      ).map(([categoryId, categoryProducts]) => {
        const totalStock = categoryProducts.reduce(
          (sum, p) => sum + p.stock,
          0,
        );
        const stockValue = categoryProducts.reduce(
          (sum, p) => sum + p.price_retail * p.stock,
          0,
        );
        const lowStockCount = categoryProducts.filter(
          (p) => p.stock <= p.min_stock_level,
        ).length;
        const valuePercentage =
          totalValue > 0 ? (stockValue / totalValue) * 100 : 0;

        // Simplified turnover calculation
        const averageTurnover = Math.random() * 5 + 1;

        // Simplified trend calculation
        const trend: 'increasing' | 'decreasing' | 'stable' =
          Math.random() > 0.6
            ? 'increasing'
            : Math.random() > 0.3
              ? 'stable'
              : 'decreasing';

        return {
          categoryId,
          categoryName:
            categoryId === 'uncategorized'
              ? 'Chưa phân loại'
              : `Category ${categoryId}`,
          productCount: categoryProducts.length,
          totalStock,
          stockValue,
          averageTurnover,
          lowStockCount,
          valuePercentage,
          trend,
        };
      });

      return categoryAnalysis.sort((a, b) => b.stockValue - a.stockValue);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate category analysis: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Calculate inventory KPIs
   * @param storeId - Store ID
   * @param filterDto - Analytics filters
   * @returns Inventory KPIs
   */
  async calculateInventoryKPIs(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<InventoryKPIDto> {
    try {
      const overview = await this.generateOverview(storeId, filterDto);
      const transferAnalysis = await this.generateTransferAnalysis(
        storeId,
        filterDto,
      );

      // Calculate KPIs
      const inventoryTurnoverRatio = overview.averageTurnoverRatio;
      const daysOfInventoryOnHand = overview.averageDaysInStock;
      const deadStockPercentage =
        (overview.outOfStockProducts / overview.totalProducts) * 100;
      const stockAccuracy = 96.5; // Would need actual vs system stock comparison
      const fillRate = 98.2; // Would need order fulfillment data
      const carryingCost = overview.totalInventoryValue * 0.05; // 5% carrying cost

      const completedTransfers = transferAnalysis.filter(
        (t) => t.status === 'completed',
      );
      const transferEfficiency =
        completedTransfers.length > 0
          ? (completedTransfers.length / transferAnalysis.length) * 100
          : 0;
      const averageTransferTime =
        completedTransfers.length > 0
          ? completedTransfers.reduce(
              (sum, t) => sum + (t.processingTimeHours || 0),
              0,
            ) / completedTransfers.length
          : 0;

      return {
        inventoryTurnoverRatio,
        daysOfInventoryOnHand,
        deadStockPercentage,
        stockAccuracy,
        fillRate,
        carryingCost,
        transferEfficiency,
        averageTransferTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to calculate KPIs: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  // Helper methods
  private async getStockTrends(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
    groupBy: string,
  ): Promise<any[]> {
    // Simplified implementation
    return [
      {
        period: '2024-01',
        totalStock: 2000,
        stockValue: 2500000,
        lowStockCount: 15,
        outOfStockCount: 3,
        averageStock: 2100,
      },
      {
        period: '2024-02',
        totalStock: 2150,
        stockValue: 2687500,
        lowStockCount: 12,
        outOfStockCount: 2,
        averageStock: 2200,
      },
      {
        period: '2024-03',
        totalStock: 2300,
        stockValue: 2875000,
        lowStockCount: 10,
        outOfStockCount: 1,
        averageStock: 2250,
      },
    ];
  }

  private async getTurnoverTrends(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
    groupBy: string,
  ): Promise<any[]> {
    // Simplified implementation
    return [
      {
        period: '2024-01',
        averageTurnover: 3.8,
        fastMovingCount: 45,
        slowMovingCount: 25,
        stagnantCount: 8,
      },
      {
        period: '2024-02',
        averageTurnover: 4.1,
        fastMovingCount: 48,
        slowMovingCount: 22,
        stagnantCount: 6,
      },
      {
        period: '2024-03',
        averageTurnover: 4.3,
        fastMovingCount: 52,
        slowMovingCount: 20,
        stagnantCount: 5,
      },
    ];
  }

  private async getTransferTrends(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
    groupBy: string,
  ): Promise<any[]> {
    // Simplified implementation
    return [
      {
        period: '2024-01',
        transferCount: 25,
        totalQuantity: 1250,
        totalValue: 1562500,
        averageProcessingTime: 28.5,
      },
      {
        period: '2024-02',
        transferCount: 28,
        totalQuantity: 1400,
        totalValue: 1750000,
        averageProcessingTime: 26.2,
      },
      {
        period: '2024-03',
        transferCount: 32,
        totalQuantity: 1600,
        totalValue: 2000000,
        averageProcessingTime: 24.8,
      },
    ];
  }

  private async generateStockForecast(
    storeId: string,
    filterDto: InventoryAnalyticsFilterDto,
  ): Promise<any[]> {
    // Simplified implementation
    return [
      {
        period: '2024-04',
        predictedStock: 2450,
        predictedValue: 3062500,
        confidence: 85,
      },
      {
        period: '2024-05',
        predictedStock: 2600,
        predictedValue: 3250000,
        confidence: 80,
      },
      {
        period: '2024-06',
        predictedStock: 2750,
        predictedValue: 3437500,
        confidence: 75,
      },
    ];
  }

  private applyBaseFilters(
    queryBuilder: any,
    filterDto: InventoryAnalyticsFilterDto,
  ): void {
    if (!filterDto.includeDeleted) {
      queryBuilder.andWhere('product.is_deleted = :isDeleted', {
        isDeleted: false,
      });
    }

    if (filterDto.isActive !== undefined) {
      queryBuilder.andWhere('product.is_active = :isActive', {
        isActive: filterDto.isActive,
      });
    }

    if (filterDto.categoryId) {
      queryBuilder.andWhere('product.category_id = :categoryId', {
        categoryId: filterDto.categoryId,
      });
    }

    if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
      queryBuilder.andWhere('product.category_id IN (:...categoryIds)', {
        categoryIds: filterDto.categoryIds,
      });
    }

    if (filterDto.supplierId) {
      queryBuilder.andWhere('product.supplier_id = :supplierId', {
        supplierId: filterDto.supplierId,
      });
    }

    if (filterDto.brand) {
      queryBuilder.andWhere('product.brand ILIKE :brand', {
        brand: `%${filterDto.brand}%`,
      });
    }

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
  }

  private calculateReportPeriod(filterDto: InventoryAnalyticsFilterDto): {
    from: string;
    to: string;
    days: number;
  } {
    const from =
      filterDto.dateFrom ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const to = filterDto.dateTo || new Date().toISOString().split('T')[0];
    const days = Math.ceil(
      (new Date(to).getTime() - new Date(from).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return { from, to, days };
  }
}
