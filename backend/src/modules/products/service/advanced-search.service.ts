import { Injectable, Logger } from '@nestjs/common';
import { Product } from 'src/entities/tenant/product.entity';
import { Category } from 'src/entities/tenant/category.entity';
import {
  AdvancedSearchDto,
  AdvancedSearchResponseDto,
  SearchResultDto,
  SearchSuggestionsResponseDto,
  SearchSuggestionDto,
} from '../dto/advanced-search.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class AdvancedSearchService extends TenantBaseService<Product> {
  // Khai báo khóa chính cho entity Product
  protected primaryKey = 'product_id';

  /**
   * Sinh facets cho kết quả tìm kiếm (ví dụ: đếm theo category, brand, price range)
   * @param storeId - Mã cửa hàng
   * @param searchDto - Tham số tìm kiếm
   * @returns Facet data (thống kê theo các trường)
   */
  async generateFacets(
    storeId: string,
    _searchDto: AdvancedSearchDto,
  ): Promise<{
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    stockStatus: Array<{ status: string; count: number }>;
  }> {
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const productRepo = dataSource.getRepository(Product);

    // Facet theo category với tên category
    const categoryFacet = await productRepo
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('product.category_id', 'id')
      .addSelect('category.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('product.category_id, category.name')
      .getRawMany();

    // Facet theo brand
    const brandFacet = await productRepo
      .createQueryBuilder('product')
      .select('product.brand', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('product.is_deleted = :isDeleted AND product.brand IS NOT NULL', {
        isDeleted: false,
      })
      .groupBy('product.brand')
      .getRawMany();

    // Facet theo khoảng giá (ví dụ: <100k, 100k-500k, >500k)
    const priceFacet = await productRepo
      .createQueryBuilder('product')
      .select([
        `CASE
          WHEN product.price_retail < 100000 THEN '<100k'
          WHEN product.price_retail BETWEEN 100000 AND 500000 THEN '100k-500k'
          ELSE '>500k'
        END AS range`,
        'COUNT(*) AS count',
      ])
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('range')
      .getRawMany();

    // Facet theo trạng thái tồn kho
    const stockFacet = await productRepo
      .createQueryBuilder('product')
      .select([
        `CASE
          WHEN product.stock > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END AS status`,
        'COUNT(*) AS count',
      ])
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('status')
      .getRawMany();

    return {
      categories: categoryFacet.map((item: any) => ({
        id: String(item.id),
        name: item.name ? String(item.name) : 'Unknown Category',
        count: parseInt(String(item.count), 10),
      })),
      brands: brandFacet.map((item: any) => ({
        name: String(item.name),
        count: parseInt(String(item.count), 10),
      })),
      priceRanges: priceFacet.map((item: any) => ({
        range: String(item.range),
        count: parseInt(String(item.count), 10),
      })),
      stockStatus: stockFacet.map((item: any) => ({
        status: String(item.status),
        count: parseInt(String(item.count), 10),
      })),
    };
  }

  /**
   * Sinh gợi ý tìm kiếm khi không có kết quả (ví dụ: sửa lỗi chính tả, đề xuất từ gần giống)
   * @param storeId - Mã cửa hàng
   * @param query - Chuỗi tìm kiếm
   * @returns Mảng gợi ý
   */
  async generateSuggestions(storeId: string, query: string): Promise<string[]> {
    // Đơn giản: lấy các tên sản phẩm gần giống (Levenshtein distance < 3)
    const productRepo = await this.getRepo(storeId);

    // PostgreSQL hỗ trợ hàm similarity nếu cài pg_trgm
    const similarProducts = await productRepo
      .createQueryBuilder('product')
      .select('product.name', 'name')
      .where('product.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('similarity(product.name, :query) > 0.3', { query })
      .orderBy('similarity(product.name, :query)', 'DESC')
      .limit(5)
      .getRawMany();

    return similarProducts.map((item) => item.name);
  }
  protected readonly logger = new Logger(AdvancedSearchService.name);

  constructor(
    protected readonly tenantDataSourceService: TenantDataSourceService,
  ) {
    super(tenantDataSourceService, Product);
  }

  /**
   * Advanced full-text search with PostgreSQL
   * @param storeId - Store ID
   * @param searchDto - Search parameters
   * @returns Advanced search results
   */
  async advancedSearch(
    storeId: string,
    searchDto: AdvancedSearchDto,
  ): Promise<AdvancedSearchResponseDto> {
    try {
      const startTime = Date.now();
      this.logger.debug(
        `Advanced search in store: ${storeId} with query: ${searchDto.query}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const categoryRepo = dataSource.getRepository(Category);

      // Build the search query based on search type
      let searchQuery = '';
      let searchParams: any = {};

      if (searchDto.query) {
        const { query, params } = this.buildSearchQuery(searchDto);
        searchQuery = query;
        searchParams = params;
      }

      // Build the main query
      const queryBuilder = productRepo.createQueryBuilder('product');

      // Add search conditions
      if (searchQuery) {
        queryBuilder.where(searchQuery, searchParams);
      } else {
        queryBuilder.where('1=1'); // No search query, return all
      }

      // Apply filters
      this.applyFilters(queryBuilder, searchDto);

      // Add sorting
      this.applySorting(queryBuilder, searchDto);

      // Add pagination
      const page = searchDto.page ?? 1;
      const limit = searchDto.limit ?? 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      // Execute query
      const [products, total] = await queryBuilder.getManyAndCount();

      // Transform results
      const results: SearchResultDto[] = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const result = this.transformToSearchResult(
          product,
          searchDto,
          i + 1 + offset,
        );
        results.push(result);
      }

      // Generate facets
      const facets = await this.generateFacets(storeId, searchDto);

      // Generate suggestions if no results
      let suggestions: string[] = [];
      if (total === 0 && searchDto.query) {
        suggestions = await this.generateSuggestions(storeId, searchDto.query);
      }

      const searchTime = Date.now() - startTime;

      return {
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        searchInfo: {
          query: searchDto.query ?? '',
          searchType: searchDto.searchType ?? 'simple',
          searchFields: searchDto.searchFields ?? ['all'],
          language: searchDto.language ?? 'vietnamese',
          totalResults: total,
          searchTime,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        },
        facets,
        generatedAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to perform advanced search: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Build search query based on search type and fields
   * @param searchDto - Search parameters
   * @returns Query string and parameters
   */
  private buildSearchQuery(searchDto: AdvancedSearchDto): {
    query: string;
    params: any;
  } {
    const query = searchDto.query!;
    const searchType = searchDto.searchType ?? 'simple';
    const searchFields = searchDto.searchFields ?? ['all'];
    const language = searchDto.language ?? 'vietnamese';

    let searchQuery = '';
    const params: any = {};

    // Determine which fields to search
    const fieldsToSearch = this.getSearchFields(searchFields);

    switch (searchType) {
      case 'simple':
        searchQuery = this.buildSimpleSearch(fieldsToSearch, language);
        params.searchTerm = query;
        break;

      case 'phrase':
        searchQuery = this.buildPhraseSearch(fieldsToSearch, language);
        params.searchTerm = `"${query}"`;
        break;

      case 'boolean':
        searchQuery = this.buildBooleanSearch(fieldsToSearch, language);
        params.searchTerm = query;
        break;

      case 'fuzzy':
        searchQuery = this.buildFuzzySearch(fieldsToSearch);
        params.searchTerm = `%${query}%`;
        break;

      case 'wildcard':
        searchQuery = this.buildWildcardSearch(fieldsToSearch);
        params.searchTerm = query.replace(/\*/g, '%').replace(/\?/g, '_');
        break;

      default:
        searchQuery = this.buildSimpleSearch(fieldsToSearch, language);
        params.searchTerm = query;
    }

    return { query: searchQuery, params };
  }

  /**
   * Get search fields based on selection
   * @param searchFields - Selected search fields
   * @returns Array of field expressions
   */
  private getSearchFields(searchFields: string[]): string[] {
    if (searchFields.includes('all')) {
      return [
        'product.name',
        'product.description',
        'product.barcode',
        'product.brand',
        'product.specs',
      ];
    }

    const fieldMap: Record<string, string> = {
      name: 'product.name',
      description: 'product.description',
      barcode: 'product.barcode',
      brand: 'product.brand',
      specs: 'product.specs',
    };

    return searchFields.map((field) => fieldMap[field]).filter(Boolean);
  }

  /**
   * Build simple full-text search query
   * @param fields - Fields to search
   * @param language - Search language
   * @returns Search query string
   */
  private buildSimpleSearch(fields: string[], language: string): string {
    const langConfig = this.getLanguageConfig(language);
    const searchVector = fields
      .map((field) => `COALESCE(${field}, '')`)
      .join(` || ' ' || `);

    return `to_tsvector('${langConfig}', ${searchVector}) @@ plainto_tsquery('${langConfig}', :searchTerm)`;
  }

  /**
   * Build phrase search query
   * @param fields - Fields to search
   * @param language - Search language
   * @returns Search query string
   */
  private buildPhraseSearch(fields: string[], language: string): string {
    const langConfig = this.getLanguageConfig(language);
    const searchVector = fields
      .map((field) => `COALESCE(${field}, '')`)
      .join(` || ' ' || `);

    return `to_tsvector('${langConfig}', ${searchVector}) @@ phraseto_tsquery('${langConfig}', :searchTerm)`;
  }

  /**
   * Build boolean search query
   * @param fields - Fields to search
   * @param language - Search language
   * @returns Search query string
   */
  private buildBooleanSearch(fields: string[], language: string): string {
    const langConfig = this.getLanguageConfig(language);
    const searchVector = fields
      .map((field) => `COALESCE(${field}, '')`)
      .join(` || ' ' || `);

    return `to_tsvector('${langConfig}', ${searchVector}) @@ to_tsquery('${langConfig}', :searchTerm)`;
  }

  /**
   * Build fuzzy search query (ILIKE-based)
   * @param fields - Fields to search
   * @returns Search query string
   */
  private buildFuzzySearch(fields: string[]): string {
    const conditions = fields.map((field) => `${field} ILIKE :searchTerm`);
    return `(${conditions.join(' OR ')})`;
  }

  /**
   * Build wildcard search query
   * @param fields - Fields to search
   * @returns Search query string
   */
  private buildWildcardSearch(fields: string[]): string {
    const conditions = fields.map((field) => `${field} ILIKE :searchTerm`);
    return `(${conditions.join(' OR ')})`;
  }

  /**
   * Get PostgreSQL language configuration
   * @param language - Language code
   * @returns PostgreSQL language config
   */
  private getLanguageConfig(language: string): string {
    const langMap: Record<string, string> = {
      vietnamese: 'simple', // PostgreSQL doesn't have built-in Vietnamese, use simple
      english: 'english',
      simple: 'simple',
    };

    return langMap[language] || 'simple';
  }

  /**
   * Apply filters to query builder
   * @param queryBuilder - TypeORM query builder
   * @param searchDto - Search parameters
   */
  private applyFilters(queryBuilder: any, searchDto: AdvancedSearchDto): void {
    // Basic filters
    queryBuilder.andWhere('product.is_deleted = :isDeleted', {
      isDeleted: false,
    });

    if (searchDto.activeOnly !== false) {
      queryBuilder.andWhere('product.is_active = :isActive', {
        isActive: true,
      });
    }

    if (searchDto.inStockOnly) {
      queryBuilder.andWhere('product.stock > 0');
    }

    // Category filter
    if (searchDto.categoryIds && searchDto.categoryIds.length > 0) {
      queryBuilder.andWhere('product.category_id IN (:...categoryIds)', {
        categoryIds: searchDto.categoryIds,
      });
    }

    // Brand filter
    if (searchDto.brands && searchDto.brands.length > 0) {
      queryBuilder.andWhere('product.brand IN (:...brands)', {
        brands: searchDto.brands,
      });
    }

    // Price range filter
    if (searchDto.minPrice !== undefined) {
      queryBuilder.andWhere('product.price_retail >= :minPrice', {
        minPrice: searchDto.minPrice,
      });
    }

    if (searchDto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price_retail <= :maxPrice', {
        maxPrice: searchDto.maxPrice,
      });
    }

    // Stock filter
    if (searchDto.minStock !== undefined) {
      queryBuilder.andWhere('product.stock >= :minStock', {
        minStock: searchDto.minStock,
      });
    }

    // Supplier filter
    if (searchDto.supplierIds && searchDto.supplierIds.length > 0) {
      queryBuilder.andWhere('product.supplier_id IN (:...supplierIds)', {
        supplierIds: searchDto.supplierIds,
      });
    }
  }

  /**
   * Apply sorting to query builder
   * @param queryBuilder - TypeORM query builder
   * @param searchDto - Search parameters
   */
  private applySorting(queryBuilder: any, searchDto: AdvancedSearchDto): void {
    const sortBy = searchDto.sortBy ?? 'relevance';
    const sortOrder = searchDto.sortOrder ?? 'DESC';

    switch (sortBy) {
      case 'relevance':
        if (searchDto.query) {
          // Add relevance scoring for full-text search
          const langConfig = this.getLanguageConfig(
            searchDto.language ?? 'vietnamese',
          );
          const searchVector = `to_tsvector('${langConfig}', COALESCE(product.name, '') || ' ' || COALESCE(product.description, ''))`;
          const searchQuery = `plainto_tsquery('${langConfig}', '${searchDto.query}')`;

          queryBuilder.addSelect(
            `ts_rank(${searchVector}, ${searchQuery})`,
            'relevance_score',
          );
          queryBuilder.orderBy('relevance_score', sortOrder);
        } else {
          queryBuilder.orderBy('product.created_at', 'DESC');
        }
        break;

      case 'name':
        queryBuilder.orderBy('product.name', sortOrder);
        break;

      case 'price':
        queryBuilder.orderBy('product.price_retail', sortOrder);
        break;

      case 'created_at':
        queryBuilder.orderBy('product.created_at', sortOrder);
        break;

      case 'stock':
        queryBuilder.orderBy('product.stock', sortOrder);
        break;

      default:
        queryBuilder.orderBy('product.created_at', 'DESC');
    }
  }

  /**
   * Transform product to search result
   * @param product - Product entity
   * @param searchDto - Search parameters
   * @param rank - Search rank
   * @returns Search result DTO
   */
  private transformToSearchResult(
    product: Product,
    searchDto: AdvancedSearchDto,
    rank: number,
  ): SearchResultDto {
    // Calculate relevance score (simplified)
    let relevanceScore = 1.0;
    if (searchDto.query) {
      relevanceScore = this.calculateRelevanceScore(product, searchDto.query);
    }

    // Generate highlights if enabled
    let highlights: any = undefined;
    if (searchDto.highlight && searchDto.query) {
      highlights = this.generateHighlights(product, searchDto.query);
    }

    return {
      productId: product.product_id,
      productCode: product.product_code,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.category_id,
      brand: product.brand,
      priceRetail: product.price_retail,
      barcode: product.barcode,
      stock: product.stock,
      images: product.images,
      relevanceScore,
      searchRank: rank,
      highlights,
      isActive: product.is_active,
      createdAt: product.created_at,
    };
  }

  /**
   * Calculate relevance score for a product
   * @param product - Product entity
   * @param query - Search query
   * @returns Relevance score (0-1)
   */
  private calculateRelevanceScore(product: Product, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Name match (highest weight)
    if (product.name.toLowerCase().includes(queryLower)) {
      score += 0.4;
      if (product.name.toLowerCase().startsWith(queryLower)) {
        score += 0.2; // Bonus for prefix match
      }
    }

    // Description match
    if (product.description.toLowerCase().includes(queryLower)) {
      score += 0.2;
    }

    // Brand match
    if (product.brand?.toLowerCase().includes(queryLower)) {
      score += 0.15;
    }

    // Barcode exact match
    if (product.barcode && product.barcode === query) {
      score += 0.3;
    }

    // Specs match
    if (product.specs?.toLowerCase().includes(queryLower)) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Generate highlights for search results
   * @param product - Product entity
   * @param query - Search query
   * @returns Highlighted content
   */
  private generateHighlights(product: Product, query: string): any {
    const highlights: any = {};
    const queryLower = query.toLowerCase();
    const preTag = '<mark>';
    const postTag = '</mark>';

    // Highlight name
    if (product.name.toLowerCase().includes(queryLower)) {
      highlights.name = this.highlightText(
        product.name,
        query,
        preTag,
        postTag,
      );
    }

    // Highlight description
    if (product.description.toLowerCase().includes(queryLower)) {
      highlights.description = this.highlightText(
        product.description,
        query,
        preTag,
        postTag,
        150,
      );
    }

    // Highlight brand
    if (product.brand?.toLowerCase().includes(queryLower)) {
      highlights.brand = this.highlightText(
        product.brand,
        query,
        preTag,
        postTag,
      );
    }

    // Highlight specs
    if (product.specs?.toLowerCase().includes(queryLower)) {
      highlights.specs = this.highlightText(
        product.specs,
        query,
        preTag,
        postTag,
        100,
      );
    }

    return Object.keys(highlights).length > 0 ? highlights : undefined;
  }

  /**
   * Highlight text with query terms
   * @param text - Text to highlight
   * @param query - Search query
   * @param preTag - Opening tag
   * @param postTag - Closing tag
   * @param maxLength - Maximum length of highlighted text
   * @returns Highlighted text
   */
  private highlightText(
    text: string,
    query: string,
    preTag: string,
    postTag: string,
    maxLength?: number,
  ): string {
    const regex = new RegExp(`(${query})`, 'gi');
    let highlighted = text.replace(regex, `${preTag}$1${postTag}`);

    if (maxLength && highlighted.length > maxLength) {
      // Find the first highlight and create a fragment around it
      const highlightIndex = highlighted.toLowerCase().indexOf(preTag);
      if (highlightIndex !== -1) {
        const start = Math.max(0, highlightIndex - 50);
        const end = Math.min(highlighted.length, start + maxLength);
        highlighted =
          (start > 0 ? '...' : '') +
          highlighted.substring(start, end) +
          (end < highlighted.length ? '...' : '');
      } else {
        highlighted = `${highlighted.substring(0, maxLength)}...`;
      }
    }

    return highlighted;
  }

  /**
   * Get search suggestions for autocomplete
   * @param storeId - Store ID
   * @param query - Partial query
   * @returns Search suggestions
   */
  async getSearchSuggestions(
    storeId: string,
    query: string,
  ): Promise<SearchSuggestionsResponseDto> {
    try {
      this.logger.debug(
        `Getting search suggestions for: ${query} in store: ${storeId}`,
      );

      const productRepo = await this.getRepo(storeId);

      // Get autocomplete suggestions
      const autocompleteSuggestions = await productRepo
        .createQueryBuilder('product')
        .select('product.name', 'name')
        .addSelect('COUNT(*)', 'count')
        .where('product.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('product.is_active = :isActive', { isActive: true })
        .andWhere('product.name ILIKE :query', { query: `${query}%` })
        .groupBy('product.name')
        .orderBy('count', 'DESC')
        .addOrderBy('LENGTH(product.name)', 'ASC')
        .limit(10)
        .getRawMany();

      const suggestions: SearchSuggestionDto[] = autocompleteSuggestions.map(
        (item, index) => ({
          suggestion: item.name,
          type: 'autocomplete',
          score: 1.0 - index * 0.1,
          resultCount: parseInt(item.count),
        }),
      );

      return {
        query,
        suggestions,
        generatedAt: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get search suggestions: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
