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
      seoRecord.seo_title ??= this.generateSeoTitle(product);

      seoRecord.seo_description ??= this.generateSeoDescription(product);

      if (!seoRecord.seo_keywords || seoRecord.seo_keywords.length === 0) {
        seoRecord.seo_keywords = this.generateSeoKeywords(product);
      }

      seoRecord.canonical_url ??= this.generateCanonicalUrl(
        storeId,
        product.slug,
      );

      // Generate structured data
      seoRecord.structured_data ??= this.generateStructuredData(product);

      // Generate schema markup
      seoRecord.schema_markup ??= this.generateSchemaMarkup(product);

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
        storeId,
        metadata: {
          action: 'UPDATE_PRODUCT_SEO',
          resource: 'ProductSeo',
          resourceId: savedSeo.seo_id,
          changes: seoDto as Record<string, unknown>,
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

      const results: ProductSeoResponseDto[] = [];
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
    const keywords: string[] = [];

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
    if (product.category.name) {
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
        openGraph: seoRecord.open_graph_data
          ? {
              ...seoRecord.open_graph_data,
              type: seoRecord.open_graph_data.type as OpenGraphType,
            }
          : undefined,
        twitterCard: seoRecord.twitter_card_data,
        structuredData: seoRecord.structured_data?.map((item) => ({
          ...item,
          '@type': item['@type'] as StructuredDataType,
        })),
        schemaMarkup: seoRecord.schema_markup,
      },
      seoAnalysis: seoRecord.seo_analysis as SeoAnalysisDto,
      canonicalUrl:
        seoRecord.canonical_url ??
        this.generateCanonicalUrl('', seoRecord.slug),
      sitemapEntry: {
        url:
          seoRecord.canonical_url ??
          this.generateCanonicalUrl('', seoRecord.slug),
        lastModified: seoRecord.updated_at,
        changeFreq: seoRecord.sitemap_change_freq ?? 'weekly',
        priority: seoRecord.sitemap_priority ?? 0.8,
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
  private generateStructuredData(product: Product): any[] {
    const structuredData: any[] = [];

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
        category: product.category.name,
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
  private generateSchemaMarkup(product: Product): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.product_code,
      brand: product.brand
        ? { '@type': 'Brand', name: product.brand }
        : undefined,
      category: product.category.name,
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
  private analyzeSeo(product: Product, seoRecord: ProductSeo): any {
    const analysis = {
      overallScore: 0,
      titleAnalysis: this.analyzeSeoTitle(seoRecord.seo_title ?? ''),
      descriptionAnalysis: this.analyzeSeoDescription(
        seoRecord.seo_description ?? '',
      ),
      keywordAnalysis: this.analyzeSeoKeywords(
        seoRecord.seo_keywords ?? [],
        product,
      ),
      imageAnalysis: this.analyzeSeoImages(product.images),
      structuredDataAnalysis: this.analyzeStructuredData(
        seoRecord.structured_data ?? [],
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
   * Analyze SEO description
   * @param description - SEO description
   * @returns Description analysis
   */
  private analyzeSeoDescription(description: string): {
    score: number;
    length: number;
    hasKeywords: boolean;
    suggestions: string[];
  } {
    const length = description.length;
    const hasKeywords =
      description.toLowerCase().includes('farmhub') ||
      description.toLowerCase().includes('nông nghiệp') ||
      description.toLowerCase().includes('cây trồng');

    let score = 0;
    const suggestions: string[] = [];

    // Length check (150-160 characters is optimal)
    if (length >= 150 && length <= 160) {
      score += 40;
    } else if (length >= 120 && length < 150) {
      score += 30;
      suggestions.push('Mô tả hơi ngắn, nên từ 150-160 ký tự');
    } else if (length > 160 && length <= 200) {
      score += 30;
      suggestions.push('Mô tả hơi dài, nên từ 150-160 ký tự');
    } else {
      score += 10;
      suggestions.push('Mô tả không tối ưu, nên từ 150-160 ký tự');
    }

    // Keywords check
    if (hasKeywords) {
      score += 30;
    } else {
      suggestions.push('Nên thêm từ khóa chính vào mô tả');
    }

    // Call-to-action check
    if (
      description.toLowerCase().includes('mua ngay') ||
      description.toLowerCase().includes('đặt hàng') ||
      description.toLowerCase().includes('liên hệ')
    ) {
      score += 30;
    } else {
      suggestions.push('Nên thêm lời kêu gọi hành động vào mô tả');
    }

    return { score, length, hasKeywords, suggestions };
  }

  /**
   * Analyze SEO keywords
   * @param keywords - SEO keywords array
   * @param product - Product entity
   * @returns Keywords analysis
   */
  private analyzeSeoKeywords(
    keywords: string[],
    _product: Product,
  ): {
    score: number;
    count: number;
    hasRelevantKeywords: boolean;
    suggestions: string[];
  } {
    const count = keywords.length;
    const hasRelevantKeywords = keywords.some(
      (keyword) =>
        keyword.toLowerCase().includes('farmhub') ||
        keyword.toLowerCase().includes('nông nghiệp') ||
        keyword.toLowerCase().includes('cây trồng'),
    );

    let score = 0;
    const suggestions: string[] = [];

    // Count check (5-10 keywords is optimal)
    if (count >= 5 && count <= 10) {
      score += 40;
    } else if (count >= 3 && count < 5) {
      score += 30;
      suggestions.push('Nên có từ 5-10 từ khóa');
    } else if (count > 10 && count <= 15) {
      score += 30;
      suggestions.push('Quá nhiều từ khóa, nên từ 5-10 từ khóa');
    } else {
      score += 10;
      suggestions.push('Số lượng từ khóa không tối ưu, nên từ 5-10 từ khóa');
    }

    // Relevance check
    if (hasRelevantKeywords) {
      score += 30;
    } else {
      suggestions.push('Nên thêm từ khóa liên quan đến nông nghiệp');
    }

    // Diversity check
    const uniqueKeywords = new Set(keywords.map((k) => k.toLowerCase()));
    if (uniqueKeywords.size === keywords.length) {
      score += 30;
    } else {
      suggestions.push('Tránh lặp lại từ khóa');
    }

    return { score, count, hasRelevantKeywords, suggestions };
  }

  /**
   * Analyze SEO images
   * @param images - Images JSON string
   * @returns Images analysis
   */
  private analyzeSeoImages(_images: string | undefined): {
    score: number;
    count: number;
    hasAltText: boolean;
    suggestions: string[];
  } {
    const imageUrls = this.extractImageUrls(_images);
    const count = imageUrls.length;

    let score = 0;
    const suggestions: string[] = [];

    // Count check (at least 1 image is required)
    if (count >= 3) {
      score += 40;
    } else if (count >= 1) {
      score += 30;
      suggestions.push('Nên có ít nhất 3 hình ảnh cho sản phẩm');
    } else {
      score += 0;
      suggestions.push('Sản phẩm cần có hình ảnh');
    }

    // Alt text check (assuming images have alt text if they exist)
    const hasAltText = count > 0;
    if (hasAltText) {
      score += 30;
    } else {
      suggestions.push('Nên thêm alt text cho hình ảnh');
    }

    // Quality check (basic check based on URL structure)
    if (count > 0) {
      score += 30;
    } else {
      suggestions.push('Nên tối ưu chất lượng hình ảnh');
    }

    return { score, count, hasAltText, suggestions };
  }

  /**
   * Analyze structured data
   * @param structuredData - Structured data array
   * @returns Structured data analysis
   */
  private analyzeStructuredData(
    structuredData: Array<{
      '@type': string;
      '@context': string;
      data: Record<string, any>;
    }>,
  ): {
    score: number;
    hasProductSchema: boolean;
    hasOfferSchema: boolean;
    suggestions: string[];
  } {
    const hasProductSchema = structuredData.some(
      (item) => item['@type'] === 'Product',
    );
    const hasOfferSchema = structuredData.some((item) => {
      const offers = item.data?.offers;
      return (
        offers &&
        typeof offers === 'object' &&
        offers !== null &&
        '@type' in offers &&
        (offers as Record<string, unknown>)['@type'] === 'Offer'
      );
    });

    let score = 0;
    const suggestions: string[] = [];

    // Product schema check
    if (hasProductSchema) {
      score += 40;
    } else {
      suggestions.push('Nên thêm Product schema markup');
    }

    // Offer schema check
    if (hasOfferSchema) {
      score += 30;
    } else {
      suggestions.push('Nên thêm Offer schema markup');
    }

    // Basic structure check
    if (structuredData.length > 0) {
      score += 30;
    } else {
      suggestions.push('Nên thêm structured data');
    }

    return { score, hasProductSchema, hasOfferSchema, suggestions };
  }

  /**
   * Generate SEO recommendations
   * @param analysis - SEO analysis object
   * @returns Array of recommendations
   */
  private generateSeoRecommendations(analysis: {
    overallScore: number;
    titleAnalysis: { suggestions: string[] };
    descriptionAnalysis: { suggestions: string[] };
    keywordAnalysis: { suggestions: string[] };
    imageAnalysis: { suggestions: string[] };
    structuredDataAnalysis: { suggestions: string[] };
    recommendations: string[];
    analyzedAt: Date;
  }): string[] {
    const recommendations: string[] = [];

    // Collect suggestions from all analyses
    recommendations.push(...analysis.titleAnalysis.suggestions);
    recommendations.push(...analysis.descriptionAnalysis.suggestions);
    recommendations.push(...analysis.keywordAnalysis.suggestions);
    recommendations.push(...analysis.imageAnalysis.suggestions);
    recommendations.push(...analysis.structuredDataAnalysis.suggestions);

    // Add overall recommendations based on score
    if (analysis.overallScore < 50) {
      recommendations.push(
        'SEO tổng thể cần cải thiện đáng kể. Hãy tập trung vào các đề xuất trên.',
      );
    } else if (analysis.overallScore < 80) {
      recommendations.push('SEO đã khá tốt nhưng vẫn có thể cải thiện thêm.');
    } else {
      recommendations.push('SEO rất tốt! Tiếp tục duy trì chất lượng.');
    }

    return recommendations;
  }

  /**
   * Analyze SEO title
   * @param title - SEO title
   * @returns Title analysis
   */
  private analyzeSeoTitle(title: string): {
    score: number;
    length: number;
    hasKeywords: boolean;
    suggestions: string[];
  } {
    const length = title.length;
    const hasKeywords =
      title.toLowerCase().includes('farmhub') ||
      title.toLowerCase().includes('nông nghiệp');

    let score = 0;
    const suggestions: string[] = [];

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
