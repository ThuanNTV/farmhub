import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdvancedSearchDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    required: false,
    example: 'phân bón NPK',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Loại tìm kiếm',
    enum: ['simple', 'phrase', 'boolean', 'fuzzy', 'wildcard'],
    required: false,
    default: 'simple',
  })
  @IsOptional()
  @IsEnum(['simple', 'phrase', 'boolean', 'fuzzy', 'wildcard'])
  searchType?: 'simple' | 'phrase' | 'boolean' | 'fuzzy' | 'wildcard' =
    'simple';

  @ApiProperty({
    description: 'Trường tìm kiếm',
    enum: ['all', 'name', 'description', 'barcode', 'brand', 'specs'],
    required: false,
    isArray: true,
    default: ['all'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['all', 'name', 'description', 'barcode', 'brand', 'specs'], {
    each: true,
  })
  searchFields?: (
    | 'all'
    | 'name'
    | 'description'
    | 'barcode'
    | 'brand'
    | 'specs'
  )[] = ['all'];

  @ApiProperty({
    description: 'Ngôn ngữ tìm kiếm',
    enum: ['vietnamese', 'english', 'simple'],
    required: false,
    default: 'vietnamese',
  })
  @IsOptional()
  @IsEnum(['vietnamese', 'english', 'simple'])
  language?: 'vietnamese' | 'english' | 'simple' = 'vietnamese';

  @ApiProperty({
    description: 'Trang hiện tại',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['relevance', 'name', 'price', 'created_at', 'stock'],
    required: false,
    default: 'relevance',
  })
  @IsOptional()
  @IsEnum(['relevance', 'name', 'price', 'created_at', 'stock'])
  sortBy?: 'relevance' | 'name' | 'price' | 'created_at' | 'stock' =
    'relevance';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Highlight kết quả',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  highlight?: boolean = true;

  @ApiProperty({
    description: 'Chỉ sản phẩm đang hoạt động',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean = true;

  @ApiProperty({
    description: 'Chỉ sản phẩm có tồn kho',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  inStockOnly?: boolean = false;

  // Filters
  @ApiProperty({
    description: 'Danh sách ID danh mục',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    description: 'Danh sách thương hiệu',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @ApiProperty({ description: 'Giá tối thiểu', required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Giá tối đa', required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Tồn kho tối thiểu',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({
    description: 'Danh sách ID nhà cung cấp',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supplierIds?: string[];
}

export class SearchResultDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  productId!: string;

  @ApiProperty({ description: 'Mã sản phẩm', example: 'NPK-001' })
  productCode!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón NPK 16-16-8' })
  name!: string;

  @ApiProperty({
    description: 'Slug sản phẩm',
    example: 'phan-bon-npk-16-16-8',
  })
  slug!: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Phân bón NPK chất lượng cao',
  })
  description!: string;

  @ApiProperty({ description: 'ID danh mục', example: 'cat-001' })
  categoryId!: string;

  @ApiProperty({ description: 'Thương hiệu', example: 'NPK Pro' })
  brand?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 125000 })
  priceRetail!: number;

  @ApiProperty({ description: 'Mã vạch', example: '1234567890123' })
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', example: 150 })
  stock!: number;

  @ApiProperty({ description: 'Hình ảnh', example: '{"url": "image.jpg"}' })
  images?: string;

  @ApiProperty({ description: 'Điểm liên quan', example: 0.95 })
  relevanceScore!: number;

  @ApiProperty({ description: 'Rank tìm kiếm', example: 1 })
  searchRank!: number;

  @ApiProperty({ description: 'Nội dung được highlight' })
  highlights?: {
    name?: string;
    description?: string;
    brand?: string;
    specs?: string;
  };

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}

export class AdvancedSearchResponseDto {
  @ApiProperty({
    description: 'Danh sách kết quả tìm kiếm',
    type: [SearchResultDto],
  })
  results!: SearchResultDto[];

  @ApiProperty({ description: 'Thông tin phân trang' })
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty({ description: 'Thông tin tìm kiếm' })
  searchInfo!: {
    query: string;
    searchType: string;
    searchFields: string[];
    language: string;
    totalResults: number;
    searchTime: number;
    suggestions?: string[];
  };

  @ApiProperty({ description: 'Facets/Filters' })
  facets?: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    stockStatus: Array<{ status: string; count: number }>;
  };

  @ApiProperty({
    description: 'Thời gian tạo kết quả',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt!: Date;
}

export class SearchSuggestionDto {
  @ApiProperty({ description: 'Từ khóa gợi ý', example: 'phân bón' })
  suggestion!: string;

  @ApiProperty({ description: 'Loại gợi ý', example: 'autocomplete' })
  type!: 'autocomplete' | 'spelling' | 'related';

  @ApiProperty({ description: 'Điểm số gợi ý', example: 0.85 })
  score!: number;

  @ApiProperty({ description: 'Số lượng kết quả', example: 25 })
  resultCount!: number;
}

export class SearchSuggestionsResponseDto {
  @ApiProperty({ description: 'Từ khóa tìm kiếm', example: 'phan bon' })
  query!: string;

  @ApiProperty({ description: 'Danh sách gợi ý', type: [SearchSuggestionDto] })
  suggestions!: SearchSuggestionDto[];

  @ApiProperty({
    description: 'Thời gian tạo gợi ý',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt!: Date;
}

export class SearchAnalyticsDto {
  @ApiProperty({ description: 'Từ khóa phổ biến' })
  popularQueries!: Array<{
    query: string;
    count: number;
    avgResultCount: number;
    lastSearched: Date;
  }>;

  @ApiProperty({ description: 'Từ khóa không có kết quả' })
  noResultQueries!: Array<{
    query: string;
    count: number;
    lastSearched: Date;
  }>;

  @ApiProperty({ description: 'Thống kê theo loại tìm kiếm' })
  searchTypeStats!: Record<
    string,
    {
      count: number;
      avgResultCount: number;
      avgSearchTime: number;
    }
  >;

  @ApiProperty({ description: 'Thống kê theo trường tìm kiếm' })
  searchFieldStats!: Record<
    string,
    {
      count: number;
      avgResultCount: number;
    }
  >;

  @ApiProperty({ description: 'Hiệu suất tìm kiếm' })
  performance!: {
    totalSearches: number;
    avgSearchTime: number;
    avgResultCount: number;
    successRate: number;
  };

  @ApiProperty({
    description: 'Thời gian tạo báo cáo',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt!: Date;
}

export class SearchConfigDto {
  @ApiProperty({ description: 'Cấu hình full-text search' })
  fullTextConfig!: {
    defaultLanguage: string;
    enableStemming: boolean;
    enableStopWords: boolean;
    customStopWords: string[];
    synonyms: Record<string, string[]>;
  };

  @ApiProperty({ description: 'Cấu hình scoring' })
  scoringConfig!: {
    nameWeight: number;
    descriptionWeight: number;
    brandWeight: number;
    specsWeight: number;
    barcodeWeight: number;
  };

  @ApiProperty({ description: 'Cấu hình highlight' })
  highlightConfig!: {
    enabled: boolean;
    maxFragments: number;
    fragmentSize: number;
    preTag: string;
    postTag: string;
  };
}
