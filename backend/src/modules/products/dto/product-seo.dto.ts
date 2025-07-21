import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StructuredDataType {
  PRODUCT = 'Product',
  OFFER = 'Offer',
  ORGANIZATION = 'Organization',
  BREADCRUMB_LIST = 'BreadcrumbList',
  REVIEW = 'Review',
  AGGREGATE_RATING = 'AggregateRating',
}

export enum OpenGraphType {
  PRODUCT = 'product',
  WEBSITE = 'website',
  ARTICLE = 'article',
}

export class MetaTagDto {
  @ApiProperty({ description: 'Tên meta tag', example: 'description' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Nội dung meta tag',
    example: 'Phân bón hữu cơ chất lượng cao',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Thuộc tính meta tag',
    required: false,
    example: 'property',
  })
  @IsOptional()
  @IsString()
  property?: string;
}

export class OpenGraphDto {
  @ApiProperty({
    description: 'Tiêu đề OG',
    example: 'Phân bón hữu cơ NPK 16-16-8',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Mô tả OG',
    example: 'Phân bón hữu cơ chất lượng cao cho cây trồng',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Loại OG',
    enum: OpenGraphType,
    example: OpenGraphType.PRODUCT,
  })
  @IsEnum(OpenGraphType)
  type!: OpenGraphType;

  @ApiProperty({
    description: 'URL hình ảnh OG',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl()
  image!: string;

  @ApiProperty({
    description: 'URL trang',
    example: 'https://example.com/product/phan-bon-npk',
  })
  @IsUrl()
  url!: string;

  @ApiProperty({ description: 'Tên site', required: false, example: 'FarmHub' })
  @IsOptional()
  @IsString()
  siteName?: string;

  @ApiProperty({ description: 'Locale', required: false, example: 'vi_VN' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class TwitterCardDto {
  @ApiProperty({
    description: 'Loại Twitter card',
    example: 'summary_large_image',
  })
  @IsString()
  card!: string;

  @ApiProperty({
    description: 'Tiêu đề Twitter',
    example: 'Phân bón hữu cơ NPK 16-16-8',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Mô tả Twitter',
    example: 'Phân bón hữu cơ chất lượng cao',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'URL hình ảnh Twitter',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl()
  image!: string;

  @ApiProperty({
    description: 'Twitter site',
    required: false,
    example: '@farmhub',
  })
  @IsOptional()
  @IsString()
  site?: string;

  @ApiProperty({
    description: 'Twitter creator',
    required: false,
    example: '@farmhub',
  })
  @IsOptional()
  @IsString()
  creator?: string;
}

export class StructuredDataDto {
  @ApiProperty({
    description: 'Loại structured data',
    enum: StructuredDataType,
  })
  @IsEnum(StructuredDataType)
  '@type'!: StructuredDataType;

  @ApiProperty({
    description: 'Context schema.org',
    example: 'https://schema.org',
  })
  @IsString()
  '@context'!: string;

  @ApiProperty({ description: 'Dữ liệu structured data' })
  data!: Record<string, any>;
}

export class ProductSeoDto {
  @ApiProperty({
    description: 'Tiêu đề SEO',
    example: 'Phân bón hữu cơ NPK 16-16-8 - Chất lượng cao',
  })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({
    description: 'Mô tả SEO',
    example:
      'Phân bón hữu cơ NPK 16-16-8 chất lượng cao, giúp cây trồng phát triển mạnh mẽ',
  })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({
    description: 'Từ khóa SEO',
    example: ['phân bón', 'hữu cơ', 'NPK', 'cây trồng'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiProperty({
    description: 'Canonical URL',
    example: 'https://farmhub.com/products/phan-bon-npk-16-16-8',
  })
  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @ApiProperty({ description: 'Meta robots', example: 'index,follow' })
  @IsOptional()
  @IsString()
  metaRobots?: string;

  @ApiProperty({ description: 'Hreflang tags', required: false })
  @IsOptional()
  hreflangTags?: Record<string, string>;

  @ApiProperty({
    description: 'Custom meta tags',
    type: [MetaTagDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaTagDto)
  customMetaTags?: MetaTagDto[];

  @ApiProperty({
    description: 'Open Graph data',
    type: OpenGraphDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OpenGraphDto)
  openGraph?: OpenGraphDto;

  @ApiProperty({
    description: 'Twitter Card data',
    type: TwitterCardDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TwitterCardDto)
  twitterCard?: TwitterCardDto;

  @ApiProperty({
    description: 'Structured data',
    type: [StructuredDataDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StructuredDataDto)
  structuredData?: StructuredDataDto[];

  @ApiProperty({ description: 'Schema markup JSON-LD', required: false })
  @IsOptional()
  schemaMarkup?: Record<string, any>;
}

export class SeoAnalysisDto {
  @ApiProperty({ description: 'Điểm SEO tổng thể', example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore!: number;

  @ApiProperty({ description: 'Phân tích tiêu đề' })
  titleAnalysis!: {
    score: number;
    length: number;
    hasKeywords: boolean;
    suggestions: string[];
  };

  @ApiProperty({ description: 'Phân tích mô tả' })
  descriptionAnalysis!: {
    score: number;
    length: number;
    hasKeywords: boolean;
    suggestions: string[];
  };

  @ApiProperty({ description: 'Phân tích từ khóa' })
  keywordAnalysis!: {
    score: number;
    density: number;
    distribution: Record<string, number>;
    suggestions: string[];
  };

  @ApiProperty({ description: 'Phân tích hình ảnh' })
  imageAnalysis!: {
    score: number;
    hasAltText: boolean;
    optimizedSize: boolean;
    suggestions: string[];
  };

  @ApiProperty({ description: 'Phân tích structured data' })
  structuredDataAnalysis!: {
    score: number;
    hasProductSchema: boolean;
    hasOfferSchema: boolean;
    suggestions: string[];
  };

  @ApiProperty({ description: 'Gợi ý cải thiện' })
  recommendations!: string[];

  @ApiProperty({
    description: 'Ngày phân tích',
    example: '2024-01-15T10:30:00Z',
  })
  analyzedAt!: Date;
}

export class SeoConfigDto {
  @ApiProperty({ description: 'Cấu hình meta tags mặc định' })
  defaultMetaTags!: {
    titleTemplate: string;
    descriptionTemplate: string;
    keywordsTemplate: string[];
    robotsDefault: string;
  };

  @ApiProperty({ description: 'Cấu hình Open Graph' })
  openGraphConfig!: {
    defaultImage: string;
    siteName: string;
    locale: string;
    type: OpenGraphType;
  };

  @ApiProperty({ description: 'Cấu hình Twitter Card' })
  twitterConfig!: {
    defaultCard: string;
    site: string;
    creator: string;
  };

  @ApiProperty({ description: 'Cấu hình structured data' })
  structuredDataConfig!: {
    enableProductSchema: boolean;
    enableOfferSchema: boolean;
    enableReviewSchema: boolean;
    enableBreadcrumbSchema: boolean;
    organizationData: Record<string, any>;
  };

  @ApiProperty({ description: 'Cấu hình sitemap' })
  sitemapConfig!: {
    enabled: boolean;
    changeFreq: string;
    priority: number;
    lastModified: boolean;
  };
}

export class SitemapEntryDto {
  @ApiProperty({
    description: 'URL',
    example: 'https://farmhub.com/products/phan-bon-npk',
  })
  @IsUrl()
  url!: string;

  @ApiProperty({
    description: 'Ngày sửa đổi cuối',
    example: '2024-01-15T10:30:00Z',
  })
  lastModified!: Date;

  @ApiProperty({ description: 'Tần suất thay đổi', example: 'weekly' })
  @IsString()
  changeFreq!: string;

  @ApiProperty({ description: 'Độ ưu tiên', example: 0.8 })
  @IsNumber()
  @Min(0)
  @Max(1)
  priority!: number;

  @ApiProperty({ description: 'Hình ảnh liên quan', required: false })
  @IsOptional()
  @IsArray()
  images?: Array<{
    url: string;
    caption?: string;
    title?: string;
  }>;
}

export class ProductSeoResponseDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  productId!: string;

  @ApiProperty({
    description: 'Slug sản phẩm',
    example: 'phan-bon-npk-16-16-8',
  })
  slug!: string;

  @ApiProperty({ description: 'Thông tin SEO', type: ProductSeoDto })
  seoData!: ProductSeoDto;

  @ApiProperty({ description: 'Phân tích SEO', type: SeoAnalysisDto })
  seoAnalysis!: SeoAnalysisDto;

  @ApiProperty({
    description: 'URL canonical',
    example: 'https://farmhub.com/products/phan-bon-npk-16-16-8',
  })
  canonicalUrl!: string;

  @ApiProperty({ description: 'Sitemap entry', type: SitemapEntryDto })
  sitemapEntry!: SitemapEntryDto;

  @ApiProperty({
    description: 'Ngày cập nhật SEO',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt!: Date;
}
