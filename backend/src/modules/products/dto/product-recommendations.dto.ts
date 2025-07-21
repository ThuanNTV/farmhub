import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductRecommendationFilterDto {
  @ApiProperty({ description: 'ID sản phẩm gốc', example: 'prod-001' })
  @IsString()
  productId!: string;

  @ApiProperty({ 
    description: 'Loại gợi ý', 
    enum: ['similar', 'related', 'frequently_bought_together', 'price_based', 'category_based', 'brand_based'],
    required: false,
    default: 'similar'
  })
  @IsOptional()
  @IsEnum(['similar', 'related', 'frequently_bought_together', 'price_based', 'category_based', 'brand_based'])
  recommendationType?: 'similar' | 'related' | 'frequently_bought_together' | 'price_based' | 'category_based' | 'brand_based' = 'similar';

  @ApiProperty({ description: 'Số lượng gợi ý', required: false, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({ description: 'Khoảng giá tối thiểu', required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Khoảng giá tối đa', required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Chỉ sản phẩm có sẵn', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  inStockOnly?: boolean = true;

  @ApiProperty({ description: 'Chỉ sản phẩm đang hoạt động', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean = true;

  @ApiProperty({ description: 'Loại trừ sản phẩm gốc', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  excludeOriginal?: boolean = true;

  @ApiProperty({ description: 'Danh sách ID danh mục để lọc', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({ description: 'Danh sách thương hiệu để lọc', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];
}

export class RecommendedProductDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-002' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón NPK 16-16-8' })
  productName!: string;

  @ApiProperty({ description: 'Mã sản phẩm', example: 'NPK-002' })
  productCode!: string;

  @ApiProperty({ description: 'Slug sản phẩm', example: 'phan-bon-npk-16-16-8' })
  slug!: string;

  @ApiProperty({ description: 'Mô tả sản phẩm', example: 'Phân bón NPK chất lượng cao' })
  description!: string;

  @ApiProperty({ description: 'ID danh mục', example: 'cat-001' })
  categoryId!: string;

  @ApiProperty({ description: 'Tên danh mục', example: 'Phân bón' })
  categoryName?: string;

  @ApiProperty({ description: 'Thương hiệu', example: 'NPK Pro' })
  brand?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 125000 })
  priceRetail!: number;

  @ApiProperty({ description: 'Giá bán sỉ', example: 115000 })
  priceWholesale?: number;

  @ApiProperty({ description: 'Mã vạch', example: '1234567890123' })
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', example: 150 })
  stock!: number;

  @ApiProperty({ description: 'Hình ảnh', example: '{"url": "image.jpg"}' })
  images?: string;

  @ApiProperty({ description: 'Thông số kỹ thuật', example: '{"N": "16%", "P": "16%", "K": "8%"}' })
  specs?: string;

  @ApiProperty({ description: 'Điểm tương đồng', example: 0.85 })
  similarityScore!: number;

  @ApiProperty({ description: 'Lý do gợi ý', example: 'Cùng danh mục và thương hiệu' })
  recommendationReason!: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}

export class ProductRecommendationsResponseDto {
  @ApiProperty({ description: 'Thông tin sản phẩm gốc', type: RecommendedProductDto })
  originalProduct!: RecommendedProductDto;

  @ApiProperty({ description: 'Danh sách sản phẩm gợi ý', type: [RecommendedProductDto] })
  recommendations!: RecommendedProductDto[];

  @ApiProperty({ description: 'Loại gợi ý được sử dụng', example: 'similar' })
  recommendationType!: string;

  @ApiProperty({ description: 'Tổng số gợi ý', example: 8 })
  totalRecommendations!: number;

  @ApiProperty({ description: 'Thời gian tạo gợi ý', example: '2024-01-15T10:30:00Z' })
  generatedAt!: Date;

  @ApiProperty({ description: 'Metadata gợi ý' })
  metadata!: {
    algorithm: string;
    processingTime: number;
    filters: any;
    averageSimilarityScore: number;
  };
}

export class RecommendationAlgorithmDto {
  @ApiProperty({ description: 'Tên thuật toán', example: 'content_based' })
  name!: string;

  @ApiProperty({ description: 'Mô tả thuật toán', example: 'Gợi ý dựa trên nội dung sản phẩm' })
  description!: string;

  @ApiProperty({ description: 'Trọng số các yếu tố' })
  weights!: {
    category: number;
    brand: number;
    price: number;
    specs: number;
    description: number;
  };

  @ApiProperty({ description: 'Ngưỡng tương đồng tối thiểu', example: 0.3 })
  minSimilarityThreshold!: number;
}

export class BulkRecommendationRequestDto {
  @ApiProperty({ description: 'Danh sách ID sản phẩm', type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @ApiProperty({ 
    description: 'Loại gợi ý', 
    enum: ['similar', 'related', 'frequently_bought_together', 'price_based', 'category_based', 'brand_based'],
    required: false,
    default: 'similar'
  })
  @IsOptional()
  @IsEnum(['similar', 'related', 'frequently_bought_together', 'price_based', 'category_based', 'brand_based'])
  recommendationType?: 'similar' | 'related' | 'frequently_bought_together' | 'price_based' | 'category_based' | 'brand_based' = 'similar';

  @ApiProperty({ description: 'Số lượng gợi ý cho mỗi sản phẩm', required: false, minimum: 1, maximum: 20, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limitPerProduct?: number = 5;

  @ApiProperty({ description: 'Chỉ sản phẩm có sẵn', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  inStockOnly?: boolean = true;
}

export class BulkRecommendationResponseDto {
  @ApiProperty({ description: 'Gợi ý theo từng sản phẩm' })
  recommendations!: Record<string, RecommendedProductDto[]>;

  @ApiProperty({ description: 'Thống kê tổng quan' })
  summary!: {
    totalProducts: number;
    totalRecommendations: number;
    averageRecommendationsPerProduct: number;
    processingTime: number;
  };

  @ApiProperty({ description: 'Thời gian tạo', example: '2024-01-15T10:30:00Z' })
  generatedAt!: Date;
}

export class RecommendationAnalyticsDto {
  @ApiProperty({ description: 'Thống kê theo loại gợi ý' })
  byType!: Record<string, {
    count: number;
    averageScore: number;
    topProducts: string[];
  }>;

  @ApiProperty({ description: 'Thống kê theo danh mục' })
  byCategory!: Record<string, {
    count: number;
    averageScore: number;
    topBrands: string[];
  }>;

  @ApiProperty({ description: 'Hiệu suất thuật toán' })
  performance!: {
    averageProcessingTime: number;
    cacheHitRate: number;
    totalRecommendations: number;
    uniqueProducts: number;
  };

  @ApiProperty({ description: 'Thời gian tạo báo cáo', example: '2024-01-15T10:30:00Z' })
  generatedAt!: Date;
}

export class CustomRecommendationRuleDto {
  @ApiProperty({ description: 'Tên quy tắc', example: 'seasonal_products' })
  @IsString()
  ruleName!: string;

  @ApiProperty({ description: 'Mô tả quy tắc', example: 'Gợi ý sản phẩm theo mùa' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Điều kiện áp dụng' })
  conditions!: {
    categoryIds?: string[];
    brands?: string[];
    priceRange?: { min: number; max: number };
    seasonality?: string;
    tags?: string[];
  };

  @ApiProperty({ description: 'Hành động gợi ý' })
  actions!: {
    boostScore?: number;
    prioritizeCategories?: string[];
    excludeCategories?: string[];
    maxRecommendations?: number;
  };

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ description: 'Thứ tự ưu tiên', example: 1 })
  @IsNumber()
  priority!: number;
}
