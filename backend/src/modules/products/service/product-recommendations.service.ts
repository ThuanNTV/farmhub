import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Category } from 'src/entities/tenant/category.entity';
import {
  ProductRecommendationFilterDto,
  ProductRecommendationsResponseDto,
  RecommendedProductDto,
  RecommendationAlgorithmDto,
  BulkRecommendationRequestDto,
  BulkRecommendationResponseDto,
  RecommendationAnalyticsDto,
} from '../dto/product-recommendations.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { Product } from 'src/entities/tenant/product.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class ProductRecommendationsService extends TenantBaseService<Product> {
  private readonly logger = new Logger(ProductRecommendationsService.name);

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
  ) {
    super(tenantDataSourceService, Product);
  }

  /**
   * Get product recommendations based on various algorithms
   * @param storeId - Store ID
   * @param filterDto - Recommendation filters
   * @returns Product recommendations
   */
  async getProductRecommendations(
    storeId: string,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<ProductRecommendationsResponseDto> {
    try {
      const startTime = Date.now();
      this.logger.debug(
        `Generating recommendations for product: ${filterDto.productId} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const categoryRepo = dataSource.getRepository(Category);

      // Get original product
      const originalProduct = await productRepo.findOne({
        where: { product_id: filterDto.productId, is_deleted: false },
      });

      if (!originalProduct) {
        throw new NotFoundException(
          `Product with ID ${filterDto.productId} not found`,
        );
      }

      // Get category info for original product
      const originalCategory = await categoryRepo.findOne({
        where: { category_id: originalProduct.category_id, is_deleted: false },
      });

      let recommendations: RecommendedProductDto[] = [];

      // Apply different recommendation algorithms based on type
      switch (filterDto.recommendationType) {
        case 'similar':
          recommendations = await this.getSimilarProducts(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        case 'category_based':
          recommendations = await this.getCategoryBasedRecommendations(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        case 'brand_based':
          recommendations = await this.getBrandBasedRecommendations(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        case 'price_based':
          recommendations = await this.getPriceBasedRecommendations(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        case 'related':
          recommendations = await this.getRelatedProducts(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        case 'frequently_bought_together':
          recommendations = await this.getFrequentlyBoughtTogether(
            storeId,
            originalProduct,
            filterDto,
          );
          break;
        default:
          recommendations = await this.getSimilarProducts(
            storeId,
            originalProduct,
            filterDto,
          );
      }

      const processingTime = Date.now() - startTime;
      const averageSimilarityScore =
        recommendations.length > 0
          ? recommendations.reduce((sum, r) => sum + r.similarityScore, 0) /
            recommendations.length
          : 0;

      // Transform original product to DTO
      const originalProductDto: RecommendedProductDto = {
        productId: originalProduct.product_id,
        productName: originalProduct.name,
        productCode: originalProduct.product_code,
        slug: originalProduct.slug,
        description: originalProduct.description,
        categoryId: originalProduct.category_id,
        categoryName: originalCategory?.name,
        brand: originalProduct.brand,
        priceRetail: originalProduct.price_retail,
        priceWholesale: originalProduct.price_wholesale,
        barcode: originalProduct.barcode,
        stock: originalProduct.stock,
        images: originalProduct.images,
        specs: originalProduct.specs,
        similarityScore: 1.0,
        recommendationReason: 'Original product',
        isActive: originalProduct.is_active,
        createdAt: originalProduct.created_at,
      };

      return {
        originalProduct: originalProductDto,
        recommendations,
        recommendationType: filterDto.recommendationType || 'similar',
        totalRecommendations: recommendations.length,
        generatedAt: new Date(),
        metadata: {
          algorithm: this.getAlgorithmName(
            filterDto.recommendationType || 'similar',
          ),
          processingTime,
          filters: filterDto,
          averageSimilarityScore,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate recommendations: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get similar products based on content similarity
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Similar products
   */
  private async getSimilarProducts(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    const productRepo = await this.getRepo(storeId);
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const categoryRepo = dataSource.getRepository(Category);

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = :isDeleted', { isDeleted: false });

    // Apply filters
    this.applyCommonFilters(queryBuilder, originalProduct, filterDto);

    const products = await queryBuilder
      .orderBy('product.created_at', 'DESC')
      .limit(filterDto.limit || 10)
      .getMany();

    const recommendations: RecommendedProductDto[] = [];

    for (const product of products) {
      const similarityScore = this.calculateSimilarityScore(
        originalProduct,
        product,
      );

      if (similarityScore >= 0.3) {
        // Minimum similarity threshold
        const category = await categoryRepo.findOne({
          where: { category_id: product.category_id, is_deleted: false },
        });

        recommendations.push({
          productId: product.product_id,
          productName: product.name,
          productCode: product.product_code,
          slug: product.slug,
          description: product.description,
          categoryId: product.category_id,
          categoryName: category?.name,
          brand: product.brand,
          priceRetail: product.price_retail,
          priceWholesale: product.price_wholesale,
          barcode: product.barcode,
          stock: product.stock,
          images: product.images,
          specs: product.specs,
          similarityScore,
          recommendationReason: this.generateRecommendationReason(
            originalProduct,
            product,
            similarityScore,
          ),
          isActive: product.is_active,
          createdAt: product.created_at,
        });
      }
    }

    return recommendations.sort(
      (a, b) => b.similarityScore - a.similarityScore,
    );
  }

  /**
   * Get category-based recommendations
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Category-based recommendations
   */
  private async getCategoryBasedRecommendations(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    const productRepo = await this.getRepo(storeId);
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const categoryRepo = dataSource.getRepository(Category);

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('product.category_id = :categoryId', {
        categoryId: originalProduct.category_id,
      });

    this.applyCommonFilters(queryBuilder, originalProduct, filterDto);

    const products = await queryBuilder
      .orderBy('product.price_retail', 'ASC')
      .limit(filterDto.limit || 10)
      .getMany();

    const category = await categoryRepo.findOne({
      where: { category_id: originalProduct.category_id, is_deleted: false },
    });

    return products.map((product) => ({
      productId: product.product_id,
      productName: product.name,
      productCode: product.product_code,
      slug: product.slug,
      description: product.description,
      categoryId: product.category_id,
      categoryName: category?.name,
      brand: product.brand,
      priceRetail: product.price_retail,
      priceWholesale: product.price_wholesale,
      barcode: product.barcode,
      stock: product.stock,
      images: product.images,
      specs: product.specs,
      similarityScore: 0.8, // High score for same category
      recommendationReason: `Cùng danh mục: ${category?.name || 'Unknown'}`,
      isActive: product.is_active,
      createdAt: product.created_at,
    }));
  }

  /**
   * Get brand-based recommendations
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Brand-based recommendations
   */
  private async getBrandBasedRecommendations(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    if (!originalProduct.brand) {
      return [];
    }

    const productRepo = await this.getRepo(storeId);
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const categoryRepo = dataSource.getRepository(Category);

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('product.brand = :brand', { brand: originalProduct.brand });

    this.applyCommonFilters(queryBuilder, originalProduct, filterDto);

    const products = await queryBuilder
      .orderBy('product.price_retail', 'ASC')
      .limit(filterDto.limit || 10)
      .getMany();

    const recommendations: RecommendedProductDto[] = [];

    for (const product of products) {
      const category = await categoryRepo.findOne({
        where: { category_id: product.category_id, is_deleted: false },
      });

      recommendations.push({
        productId: product.product_id,
        productName: product.name,
        productCode: product.product_code,
        slug: product.slug,
        description: product.description,
        categoryId: product.category_id,
        categoryName: category?.name,
        brand: product.brand,
        priceRetail: product.price_retail,
        priceWholesale: product.price_wholesale,
        barcode: product.barcode,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        similarityScore: 0.75, // High score for same brand
        recommendationReason: `Cùng thương hiệu: ${originalProduct.brand}`,
        isActive: product.is_active,
        createdAt: product.created_at,
      });
    }

    return recommendations;
  }

  /**
   * Get price-based recommendations
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Price-based recommendations
   */
  private async getPriceBasedRecommendations(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    const productRepo = await this.getRepo(storeId);
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const categoryRepo = dataSource.getRepository(Category);

    // Price range: ±20% of original price
    const priceRange = originalProduct.price_retail * 0.2;
    const minPrice = originalProduct.price_retail - priceRange;
    const maxPrice = originalProduct.price_retail + priceRange;

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('product.price_retail BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });

    this.applyCommonFilters(queryBuilder, originalProduct, filterDto);

    const products = await queryBuilder
      .orderBy('ABS(product.price_retail - :originalPrice)', 'ASC')
      .setParameter('originalPrice', originalProduct.price_retail)
      .limit(filterDto.limit || 10)
      .getMany();

    const recommendations: RecommendedProductDto[] = [];

    for (const product of products) {
      const category = await categoryRepo.findOne({
        where: { category_id: product.category_id, is_deleted: false },
      });

      const priceDifference = Math.abs(
        product.price_retail - originalProduct.price_retail,
      );
      const similarityScore = Math.max(
        0.4,
        1 - priceDifference / originalProduct.price_retail,
      );

      recommendations.push({
        productId: product.product_id,
        productName: product.name,
        productCode: product.product_code,
        slug: product.slug,
        description: product.description,
        categoryId: product.category_id,
        categoryName: category?.name,
        brand: product.brand,
        priceRetail: product.price_retail,
        priceWholesale: product.price_wholesale,
        barcode: product.barcode,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        similarityScore,
        recommendationReason: `Cùng tầm giá: ${product.price_retail.toLocaleString('vi-VN')} VND`,
        isActive: product.is_active,
        createdAt: product.created_at,
      });
    }

    return recommendations;
  }

  /**
   * Get related products (simplified implementation)
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Related products
   */
  private async getRelatedProducts(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    // Combine category and brand-based recommendations
    const categoryRecommendations = await this.getCategoryBasedRecommendations(
      storeId,
      originalProduct,
      { ...filterDto, limit: 5 },
    );
    const brandRecommendations = await this.getBrandBasedRecommendations(
      storeId,
      originalProduct,
      { ...filterDto, limit: 5 },
    );

    const combined = [...categoryRecommendations, ...brandRecommendations];
    const unique = combined.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.productId === item.productId),
    );

    return unique.slice(0, filterDto.limit || 10);
  }

  /**
   * Get frequently bought together products (simplified implementation)
   * @param storeId - Store ID
   * @param originalProduct - Original product
   * @param filterDto - Filters
   * @returns Frequently bought together products
   */
  private async getFrequentlyBoughtTogether(
    storeId: string,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): Promise<RecommendedProductDto[]> {
    // Simplified: return products from same category with different brands
    const productRepo = await this.getRepo(storeId);
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const categoryRepo = dataSource.getRepository(Category);

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('product.category_id = :categoryId', {
        categoryId: originalProduct.category_id,
      });

    if (originalProduct.brand) {
      queryBuilder.andWhere('product.brand != :brand', {
        brand: originalProduct.brand,
      });
    }

    this.applyCommonFilters(queryBuilder, originalProduct, filterDto);

    const products = await queryBuilder
      .orderBy('product.stock', 'DESC')
      .limit(filterDto.limit || 10)
      .getMany();

    const category = await categoryRepo.findOne({
      where: { category_id: originalProduct.category_id, is_deleted: false },
    });

    return products.map((product) => ({
      productId: product.product_id,
      productName: product.name,
      productCode: product.product_code,
      slug: product.slug,
      description: product.description,
      categoryId: product.category_id,
      categoryName: category?.name,
      brand: product.brand,
      priceRetail: product.price_retail,
      priceWholesale: product.price_wholesale,
      barcode: product.barcode,
      stock: product.stock,
      images: product.images,
      specs: product.specs,
      similarityScore: 0.6,
      recommendationReason: 'Thường được mua cùng',
      isActive: product.is_active,
      createdAt: product.created_at,
    }));
  }

  /**
   * Apply common filters to query builder
   * @param queryBuilder - TypeORM query builder
   * @param originalProduct - Original product
   * @param filterDto - Filters
   */
  private applyCommonFilters(
    queryBuilder: any,
    originalProduct: Product,
    filterDto: ProductRecommendationFilterDto,
  ): void {
    if (filterDto.excludeOriginal !== false) {
      queryBuilder.andWhere('product.product_id != :originalId', {
        originalId: originalProduct.product_id,
      });
    }

    if (filterDto.activeOnly !== false) {
      queryBuilder.andWhere('product.is_active = :isActive', {
        isActive: true,
      });
    }

    if (filterDto.inStockOnly !== false) {
      queryBuilder.andWhere('product.stock > 0');
    }

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

    if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
      queryBuilder.andWhere('product.category_id IN (:...categoryIds)', {
        categoryIds: filterDto.categoryIds,
      });
    }

    if (filterDto.brands && filterDto.brands.length > 0) {
      queryBuilder.andWhere('product.brand IN (:...brands)', {
        brands: filterDto.brands,
      });
    }
  }

  /**
   * Calculate similarity score between two products
   * @param product1 - First product
   * @param product2 - Second product
   * @returns Similarity score (0-1)
   */
  private calculateSimilarityScore(
    product1: Product,
    product2: Product,
  ): number {
    let score = 0;
    let factors = 0;

    // Category similarity (40% weight)
    if (product1.category_id === product2.category_id) {
      score += 0.4;
    }
    factors += 0.4;

    // Brand similarity (25% weight)
    if (product1.brand && product2.brand && product1.brand === product2.brand) {
      score += 0.25;
    }
    factors += 0.25;

    // Price similarity (20% weight)
    const priceDiff = Math.abs(product1.price_retail - product2.price_retail);
    const avgPrice = (product1.price_retail + product2.price_retail) / 2;
    const priceScore = Math.max(0, 1 - priceDiff / avgPrice);
    score += priceScore * 0.2;
    factors += 0.2;

    // Description similarity (15% weight) - simplified
    const desc1 = product1.description.toLowerCase();
    const desc2 = product2.description.toLowerCase();
    const commonWords = this.getCommonWords(desc1, desc2);
    const descScore =
      commonWords / Math.max(desc1.split(' ').length, desc2.split(' ').length);
    score += descScore * 0.15;
    factors += 0.15;

    return Math.min(1, score / factors);
  }

  /**
   * Get common words between two descriptions
   * @param desc1 - First description
   * @param desc2 - Second description
   * @returns Number of common words
   */
  private getCommonWords(desc1: string, desc2: string): number {
    const words1 = new Set(desc1.split(' ').filter((word) => word.length > 3));
    const words2 = new Set(desc2.split(' ').filter((word) => word.length > 3));

    let commonCount = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        commonCount++;
      }
    }

    return commonCount;
  }

  /**
   * Generate recommendation reason
   * @param original - Original product
   * @param recommended - Recommended product
   * @param score - Similarity score
   * @returns Recommendation reason
   */
  private generateRecommendationReason(
    original: Product,
    recommended: Product,
    score: number,
  ): string {
    const reasons: string[] = [];

    if (original.category_id === recommended.category_id) {
      reasons.push('cùng danh mục');
    }

    if (
      original.brand &&
      recommended.brand &&
      original.brand === recommended.brand
    ) {
      reasons.push('cùng thương hiệu');
    }

    const priceDiff = Math.abs(
      original.price_retail - recommended.price_retail,
    );
    if (priceDiff / original.price_retail < 0.2) {
      reasons.push('tầm giá tương đương');
    }

    if (reasons.length === 0) {
      return `Tương đồng ${Math.round(score * 100)}%`;
    }

    return `${reasons.join(', ')} (${Math.round(score * 100)}%)`;
  }

  /**
   * Get algorithm name
   * @param type - Recommendation type
   * @returns Algorithm name
   */
  private getAlgorithmName(type: string): string {
    const algorithms: Record<string, string> = {
      similar: 'Content-Based Similarity',
      category_based: 'Category-Based Filtering',
      brand_based: 'Brand-Based Filtering',
      price_based: 'Price-Based Similarity',
      related: 'Hybrid Recommendation',
      frequently_bought_together: 'Association Rules',
    };

    return algorithms[type] || 'Unknown Algorithm';
  }

  /**
   * Get bulk recommendations for multiple products
   * @param storeId - Store ID
   * @param requestDto - Bulk request
   * @returns Bulk recommendations
   */
  async getBulkRecommendations(
    storeId: string,
    requestDto: BulkRecommendationRequestDto,
  ): Promise<BulkRecommendationResponseDto> {
    try {
      const startTime = Date.now();
      this.logger.debug(
        `Generating bulk recommendations for ${requestDto.productIds.length} products in store: ${storeId}`,
      );

      const recommendations: Record<string, RecommendedProductDto[]> = {};
      let totalRecommendations = 0;

      for (const productId of requestDto.productIds) {
        try {
          const filterDto: ProductRecommendationFilterDto = {
            productId,
            recommendationType: requestDto.recommendationType,
            limit: requestDto.limitPerProduct,
            inStockOnly: requestDto.inStockOnly,
          };

          const result = await this.getProductRecommendations(
            storeId,
            filterDto,
          );
          recommendations[productId] = result.recommendations;
          totalRecommendations += result.recommendations.length;
        } catch (error) {
          this.logger.warn(
            `Failed to get recommendations for product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          recommendations[productId] = [];
        }
      }

      const processingTime = Date.now() - startTime;
      const averageRecommendationsPerProduct =
        requestDto.productIds.length > 0
          ? totalRecommendations / requestDto.productIds.length
          : 0;

      return {
        recommendations,
        summary: {
          totalProducts: requestDto.productIds.length,
          totalRecommendations,
          averageRecommendationsPerProduct,
          processingTime,
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate bulk recommendations: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
