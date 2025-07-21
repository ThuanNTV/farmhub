import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ProductSeo } from 'src/entities/tenant/product_seo.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { Category } from 'src/entities/tenant/category.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import {
  ProductSeoDto,
  ProductSeoResponseDto,
  SeoAnalysisDto,
  SeoConfigDto,
  SitemapEntryDto,
  StructuredDataType,
  OpenGraphType,
} from '../dto/product-seo.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductSeoService {
  private readonly logger = new Logger(ProductSeoService.name);

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Update SEO data for a product
   * @param storeId - Store ID
   * @param productId - Product ID
   * @param seoDto - SEO data
   * @returns Updated SEO data
   */
  async updateProductSeo(
    storeId: string,
    productId: string,
    seoDto: ProductSeoDto,
  ): Promise<ProductSeoResponseDto> {
    try {
      this.logger.log(
        `Updating SEO for product: ${productId} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const seoRepo = dataSource.getRepository(ProductSeo);

      // Check if product exists
      const product = await productRepo.findOne({
        where: { product_id: productId, is_deleted: false },
        relations: ['category'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Find or create SEO record
      let seoRecord = await seoRepo.findOne({
        where: { product_id: productId, is_deleted: false },
      });

      if (!seoRecord) {
        seoRecord = new ProductSeo();
        seoRecord.seo_id = uuidv4();
        seoRecord.product_id = productId;
        seoRecord.slug = product.slug;
      }

      // Update SEO fields
      if (seoDto.seoTitle !== undefined) seoRecord.seo_title = seoDto.seoTitle;
      if (seoDto.seoDescription !== undefined)
        seoRecord.seo_description = seoDto.seoDescription;
      if (seoDto.seoKeywords !== undefined)
        seoRecord.seo_keywords = seoDto.seoKeywords;
      if (seoDto.canonicalUrl !== undefined)
        seoRecord.canonical_url = seoDto.canonicalUrl;
      if (seoDto.metaRobots !== undefined)
        seoRecord.meta_robots = seoDto.metaRobots;
      if (seoDto.hreflangTags !== undefined)
        seoRecord.hreflang_tags = seoDto.hreflangTags;
      if (seoDto.customMetaTags !== undefined)
        seoRecord.custom_meta_tags = seoDto.customMetaTags;
      if (seoDto.openGraph !== undefined)
        seoRecord.open_graph_data = seoDto.openGraph;
      if (seoDto.twitterCard !== undefined)
        seoRecord.twitter_card_data = seoDto.twitterCard;
      if (seoDto.structuredData !== undefined)
        seoRecord.structured_data = seoDto.structuredData;
      if (seoDto.schemaMarkup !== undefined)
        seoRecord.schema_markup = seoDto.schemaMarkup;

      // Generate automatic SEO data if not provided
      if (!seoRecord.seo_title) {
        seoRecord.seo_title = this.generateSeoTitle(product);
      }

      if (!seoRecord.seo_description) {
        seoRecord.seo_description = this.generateSeoDescription(product);
      }

      if (!seoRecord.seo_keywords || seoRecord.seo_keywords.length === 0) {
        seoRecord.seo_keywords = this.generateSeoKeywords(product);
      }

      if (!seoRecord.canonical_url) {
        seoRecord.canonical_url = this.generateCanonicalUrl(
          storeId,
          product.slug,
        );
      }

      // Generate structured data
      if (!seoRecord.structured_data) {
        seoRecord.structured_data = await this.generateStructuredData(product);
      }

      // Generate schema markup
      if (!seoRecord.schema_markup) {
        seoRecord.schema_markup = await this.generateSchemaMarkup(product);
      }

      // Perform SEO analysis
      const seoAnalysis = await this.analyzeSeo(product, seoRecord);
      seoRecord.seo_analysis = seoAnalysis;

      const savedSeo = await seoRepo.save(seoRecord);

      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: '',
        action: 'UPDATE_PRODUCT_SEO',
        targetTable: 'ProductSeo',
        targetId: savedSeo.seo_id,
        metadata: {
          action: 'UPDATE_PRODUCT_SEO',
          resource: 'ProductSeo',
          resourceId: savedSeo.seo_id,
          changes: seoDto,
        },
      });

      return this.transformToResponseDto(product, savedSeo);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update product SEO: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get SEO data for a product
   * @param storeId - Store ID
   * @param productId - Product ID
   * @returns SEO data
   */
  async getProductSeo(
    storeId: string,
    productId: string,
  ): Promise<ProductSeoResponseDto> {
    try {
      this.logger.debug(
        `Getting SEO for product: ${productId} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const seoRepo = dataSource.getRepository(ProductSeo);

      const product = await productRepo.findOne({
        where: { product_id: productId, is_deleted: false },
        relations: ['category'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      let seoRecord = await seoRepo.findOne({
        where: { product_id: productId, is_deleted: false },
      });

      // Create default SEO if not exists
      if (!seoRecord) {
        const defaultSeoDto: ProductSeoDto = {
          seoTitle: this.generateSeoTitle(product),
          seoDescription: this.generateSeoDescription(product),
          seoKeywords: this.generateSeoKeywords(product),
          canonicalUrl: this.generateCanonicalUrl(storeId, product.slug),
          metaRobots: 'index,follow',
        };

        return this.updateProductSeo(storeId, productId, defaultSeoDto);
      }

      return this.transformToResponseDto(product, seoRecord);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get product SEO: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get SEO data by slug
   * @param storeId - Store ID
   * @param slug - Product slug
   * @returns SEO data
   */
  async getProductSeoBySlug(
    storeId: string,
    slug: string,
  ): Promise<ProductSeoResponseDto> {
    try {
      this.logger.debug(`Getting SEO by slug: ${slug} in store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const seoRepo = dataSource.getRepository(ProductSeo);

      const seoRecord = await seoRepo.findOne({
        where: { slug, is_deleted: false },
        relations: ['product', 'product.category'],
      });

      if (!seoRecord) {
        throw new NotFoundException(`Product with slug ${slug} not found`);
      }

      return this.transformToResponseDto(seoRecord.product, seoRecord);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get product SEO by slug: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate sitemap entries for all products
   * @param storeId - Store ID
   * @returns Sitemap entries
   */
  async generateSitemap(storeId: string): Promise<SitemapEntryDto[]> {
    try {
      this.logger.debug(`Generating sitemap for store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const seoRepo = dataSource.getRepository(ProductSeo);

      const seoRecords = await seoRepo.find({
        where: {
          is_deleted: false,
          is_active: true,
          sitemap_include: true,
        },
        relations: ['product'],
        order: { updated_at: 'DESC' },
      });

      return seoRecords.map((seo) => ({
        url: seo.canonical_url || this.generateCanonicalUrl(storeId, seo.slug),
        lastModified: seo.updated_at,
        changeFreq: seo.sitemap_change_freq || 'weekly',
        priority: seo.sitemap_priority || 0.8,
        images: seo.sitemap_images,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate sitemap: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Bulk update SEO for multiple products
   * @param storeId - Store ID
   * @param updates - Array of product ID and SEO data
   * @returns Updated SEO data
   */
  async bulkUpdateSeo(
    storeId: string,
    updates: Array<{ productId: string; seoData: ProductSeoDto }>,
  ): Promise<ProductSeoResponseDto[]> {
    try {
      this.logger.log(
        `Bulk updating SEO for ${updates.length} products in store: ${storeId}`,
      );

      const results = [];
      for (const update of updates) {
        const result = await this.updateProductSeo(
          storeId,
          update.productId,
          update.seoData,
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to bulk update SEO: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate SEO title
   * @param product - Product entity
   * @returns SEO title
   */
  private generateSeoTitle(product: Product): string {
    const brand = product.brand ? `${product.brand} ` : '';
    const category = product.category?.name
      ? ` - ${product.category.name}`
      : '';
    return `${brand}${product.name}${category} | FarmHub`;
  }

  /**
   * Generate SEO description
   * @param product - Product entity
   * @returns SEO description
   */
  private generateSeoDescription(product: Product): string {
    const brand = product.brand ? `${product.brand} ` : '';
    const price = `Giá: ${product.price_retail.toLocaleString('vi-VN')}đ`;
    const stock = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';

    return `${brand}${product.name}. ${product.description}. ${price}. ${stock}. Mua ngay tại FarmHub!`;
  }

  /**
   * Generate SEO keywords
   * @param product - Product entity
   * @returns SEO keywords
   */
  private generateSeoKeywords(product: Product): string[] {
    const keywords = [];

    // Add product name words
    keywords.push(
      ...product.name
        .toLowerCase()
        .split(' ')
        .filter((word) => word.length > 2),
    );

    // Add brand
    if (product.brand) {
      keywords.push(product.brand.toLowerCase());
    }

    // Add category
    if (product.category?.name) {
      keywords.push(
        ...product.category.name
          .toLowerCase()
          .split(' ')
          .filter((word) => word.length > 2),
      );
    }

    // Add common keywords
    keywords.push('farmhub', 'nông nghiệp', 'cây trồng');

    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  /**
   * Generate canonical URL
   * @param storeId - Store ID
   * @param slug - Product slug
   * @returns Canonical URL
   */
  private generateCanonicalUrl(storeId: string, slug: string): string {
    // This should be configurable based on your domain
    return `https://farmhub.com/stores/${storeId}/products/${slug}`;
  }

  /**
   * Extract image URLs from images JSON
   * @param images - Images JSON string
   * @returns Array of image URLs
   */
  private extractImageUrls(images?: string): string[] {
    try {
      if (!images) return [];
      const imageData = JSON.parse(images);
      if (Array.isArray(imageData)) {
        return imageData.map((img) => img.url || img).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Transform to response DTO
   * @param product - Product entity
   * @param seoRecord - SEO record
   * @returns Response DTO
   */
  private transformToResponseDto(
    product: Product,
    seoRecord: ProductSeo,
  ): ProductSeoResponseDto {
    return {
      productId: product.product_id,
      slug: seoRecord.slug,
      seoData: {
        seoTitle: seoRecord.seo_title,
        seoDescription: seoRecord.seo_description,
        seoKeywords: seoRecord.seo_keywords,
        canonicalUrl: seoRecord.canonical_url,
        metaRobots: seoRecord.meta_robots,
        hreflangTags: seoRecord.hreflang_tags,
        customMetaTags: seoRecord.custom_meta_tags,
        openGraph: seoRecord.open_graph_data,
        twitterCard: seoRecord.twitter_card_data,
        structuredData: seoRecord.structured_data,
        schemaMarkup: seoRecord.schema_markup,
      },
      seoAnalysis: seoRecord.seo_analysis,
      canonicalUrl:
        seoRecord.canonical_url ||
        this.generateCanonicalUrl('', seoRecord.slug),
      sitemapEntry: {
        url:
          seoRecord.canonical_url ||
          this.generateCanonicalUrl('', seoRecord.slug),
        lastModified: seoRecord.updated_at,
        changeFreq: seoRecord.sitemap_change_freq || 'weekly',
        priority: seoRecord.sitemap_priority || 0.8,
        images: seoRecord.sitemap_images,
      },
      updatedAt: seoRecord.updated_at,
    };
  }

  /**
   * Generate structured data
   * @param product - Product entity
   * @returns Structured data array
   */
  private async generateStructuredData(product: Product): Promise<any[]> {
    const structuredData = [];

    // Product schema
    structuredData.push({
      '@type': StructuredDataType.PRODUCT,
      '@context': 'https://schema.org',
      data: {
        name: product.name,
        description: product.description,
        sku: product.product_code,
        brand: product.brand
          ? { '@type': 'Brand', name: product.brand }
          : undefined,
        category: product.category?.name,
        image: this.extractImageUrls(product.images),
        offers: {
          '@type': 'Offer',
          price: product.price_retail,
          priceCurrency: 'VND',
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'FarmHub',
          },
        },
      },
    });

    return structuredData;
  }

  /**
   * Generate schema markup
   * @param product - Product entity
   * @returns Schema markup object
   */
  private async generateSchemaMarkup(
    product: Product,
  ): Promise<Record<string, any>> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.product_code,
      brand: product.brand
        ? { '@type': 'Brand', name: product.brand }
        : undefined,
      category: product.category?.name,
      image: this.extractImageUrls(product.images),
      offers: {
        '@type': 'Offer',
        price: product.price_retail,
        priceCurrency: 'VND',
        availability:
          product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'FarmHub',
        },
      },
    };
  }

  /**
   * Analyze SEO for a product
   * @param product - Product entity
   * @param seoRecord - SEO record
   * @returns SEO analysis
   */
  private async analyzeSeo(
    product: Product,
    seoRecord: ProductSeo,
  ): Promise<any> {
    const analysis = {
      overallScore: 0,
      titleAnalysis: this.analyzeSeoTitle(seoRecord.seo_title || ''),
      descriptionAnalysis: this.analyzeSeoDescription(
        seoRecord.seo_description || '',
      ),
      keywordAnalysis: this.analyzeSeoKeywords(
        seoRecord.seo_keywords || [],
        product,
      ),
      imageAnalysis: this.analyzeSeoImages(product.images),
      structuredDataAnalysis: this.analyzeStructuredData(
        seoRecord.structured_data || [],
      ),
      recommendations: [] as string[],
      analyzedAt: new Date(),
    };

    // Calculate overall score
    const scores = [
      analysis.titleAnalysis.score,
      analysis.descriptionAnalysis.score,
      analysis.keywordAnalysis.score,
      analysis.imageAnalysis.score,
      analysis.structuredDataAnalysis.score,
    ];
    analysis.overallScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length,
    );

    // Generate recommendations
    analysis.recommendations = this.generateSeoRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze SEO title
   * @param title - SEO title
   * @returns Title analysis
   */
  private analyzeSeoTitle(title: string): any {
    const length = title.length;
    const hasKeywords =
      title.toLowerCase().includes('farmhub') ||
      title.toLowerCase().includes('nông nghiệp');

    let score = 0;
    const suggestions = [];

    // Length check (50-60 characters is optimal)
    if (length >= 50 && length <= 60) {
      score += 40;
    } else if (length >= 30 && length < 50) {
      score += 30;
      suggestions.push('Tiêu đề hơi ngắn, nên từ 50-60 ký tự');
    } else if (length > 60 && length <= 70) {
      score += 30;
      suggestions.push('Tiêu đề hơi dài, nên từ 50-60 ký tự');
    } else {
      score += 10;
      suggestions.push('Tiêu đề không tối ưu, nên từ 50-60 ký tự');
    }

    // Keywords check
    if (hasKeywords) {
      score += 30;
    } else {
      suggestions.push('Nên thêm từ khóa chính vào tiêu đề');
    }

    // Brand check
    if (title.includes('FarmHub')) {
      score += 30;
    } else {
      suggestions.push('Nên thêm tên thương hiệu vào tiêu đề');
    }

    return { score, length, hasKeywords, suggestions };
  }
}
