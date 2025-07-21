import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductSeoService } from '../service/product-seo.service';
import {
  ProductSeoDto,
  ProductSeoResponseDto,
  SitemapEntryDto,
} from '../dto/product-seo.dto';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RequireProductPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';

@ApiTags('Product SEO')
@Controller('tenant/:storeId/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductSeoController {
  constructor(private readonly productSeoService: ProductSeoService) {}

  @Get(':storeId/:productId/seo')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin SEO của sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin SEO sản phẩm',
    type: ProductSeoResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  getProductSeo(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.productSeoService.getProductSeo(storeId, productId);
  }

  @Get(':storeId/seo/slug/:slug')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin SEO theo slug' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin SEO sản phẩm',
    type: ProductSeoResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  getProductSeoBySlug(
    @Param('storeId') storeId: string,
    @Param('slug') slug: string,
  ) {
    return this.productSeoService.getProductSeoBySlug(storeId, slug);
  }

  @Put(':storeId/:productId/seo')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật thông tin SEO của sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin SEO được cập nhật thành công',
    type: ProductSeoResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  updateProductSeo(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() seoDto: ProductSeoDto,
  ) {
    return this.productSeoService.updateProductSeo(storeId, productId, seoDto);
  }

  @Post(':storeId/seo/bulk')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật SEO hàng loạt' })
  @ApiResponse({
    status: 200,
    description: 'SEO được cập nhật thành công',
    type: [ProductSeoResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  bulkUpdateSeo(
    @Param('storeId') storeId: string,
    @Body() updates: Array<{ productId: string; seoData: ProductSeoDto }>,
  ) {
    return this.productSeoService.bulkUpdateSeo(storeId, updates);
  }

  @Get(':storeId/sitemap')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo sitemap cho tất cả sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Sitemap entries',
    type: [SitemapEntryDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  generateSitemap(@Param('storeId') storeId: string) {
    return this.productSeoService.generateSitemap(storeId);
  }

  @Get(':storeId/sitemap.xml')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo sitemap XML cho tất cả sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Sitemap XML',
    schema: {
      type: 'string',
      example: '<?xml version="1.0" encoding="UTF-8"?>...',
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  async generateSitemapXml(@Param('storeId') storeId: string) {
    const sitemapEntries =
      await this.productSeoService.generateSitemap(storeId);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const entry of sitemapEntries) {
      xml += '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${entry.changeFreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;

      if (entry.images && entry.images.length > 0) {
        for (const image of entry.images) {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${image.url}</image:loc>\n`;
          if (image.caption) {
            xml += `      <image:caption>${image.caption}</image:caption>\n`;
          }
          if (image.title) {
            xml += `      <image:title>${image.title}</image:title>\n`;
          }
          xml += '    </image:image>\n';
        }
      }

      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
  }

  @Post(':storeId/:productId/seo/analyze')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích SEO cho sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả phân tích SEO',
    schema: {
      type: 'object',
      properties: {
        analysis: {
          type: 'object',
          description: 'Kết quả phân tích SEO chi tiết',
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Gợi ý cải thiện SEO',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  async analyzeSeo(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    const seoData = await this.productSeoService.getProductSeo(
      storeId,
      productId,
    );
    return {
      analysis: seoData.seoAnalysis,
      recommendations: seoData.seoAnalysis?.recommendations || [],
    };
  }

  @Post(':storeId/seo/auto-generate')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tự động tạo SEO cho tất cả sản phẩm chưa có SEO' })
  @ApiResponse({
    status: 200,
    description: 'SEO được tạo tự động thành công',
    schema: {
      type: 'object',
      properties: {
        processed: { type: 'number', example: 25 },
        created: { type: 'number', example: 20 },
        updated: { type: 'number', example: 5 },
        message: {
          type: 'string',
          example: 'Auto-generated SEO for 25 products',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async autoGenerateSeo(
    @Param('storeId') storeId: string,
    @Query('force') force?: boolean,
  ) {
    // This would implement auto-generation logic for all products
    // For now, return a placeholder
    return {
      processed: 0,
      created: 0,
      updated: 0,
      message: 'Auto-generation not implemented yet',
    };
  }

  @Get(':storeId/seo/robots.txt')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo robots.txt cho store' })
  @ApiResponse({
    status: 200,
    description: 'Robots.txt content',
    schema: {
      type: 'string',
      example:
        'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml',
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  generateRobotsTxt(@Param('storeId') storeId: string) {
    let robotsTxt = 'User-agent: *\n';
    robotsTxt += 'Allow: /\n';
    robotsTxt += 'Disallow: /admin/\n';
    robotsTxt += 'Disallow: /api/\n';
    robotsTxt += 'Disallow: /private/\n';
    robotsTxt += '\n';
    robotsTxt += `Sitemap: https://farmhub.com/stores/${storeId}/sitemap.xml\n`;

    return robotsTxt;
  }

  @Get(':storeId/seo/meta-tags/:productId')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy meta tags HTML cho sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Meta tags HTML',
    schema: {
      type: 'object',
      properties: {
        metaTags: { type: 'string', description: 'HTML meta tags' },
        structuredData: {
          type: 'string',
          description: 'JSON-LD structured data',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  async getMetaTags(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    const seoData = await this.productSeoService.getProductSeo(
      storeId,
      productId,
    );

    let metaTags = '';

    // Basic meta tags
    if (seoData.seoData.seoTitle) {
      metaTags += `<title>${seoData.seoData.seoTitle}</title>\n`;
    }

    if (seoData.seoData.seoDescription) {
      metaTags += `<meta name="description" content="${seoData.seoData.seoDescription}">\n`;
    }

    if (seoData.seoData.seoKeywords && seoData.seoData.seoKeywords.length > 0) {
      metaTags += `<meta name="keywords" content="${seoData.seoData.seoKeywords.join(', ')}">\n`;
    }

    if (seoData.seoData.canonicalUrl) {
      metaTags += `<link rel="canonical" href="${seoData.seoData.canonicalUrl}">\n`;
    }

    if (seoData.seoData.metaRobots) {
      metaTags += `<meta name="robots" content="${seoData.seoData.metaRobots}">\n`;
    }

    // Open Graph tags
    if (seoData.seoData.openGraph) {
      const og = seoData.seoData.openGraph;
      metaTags += `<meta property="og:title" content="${og.title}">\n`;
      metaTags += `<meta property="og:description" content="${og.description}">\n`;
      metaTags += `<meta property="og:type" content="${og.type}">\n`;
      metaTags += `<meta property="og:image" content="${og.image}">\n`;
      metaTags += `<meta property="og:url" content="${og.url}">\n`;
      if (og.siteName) {
        metaTags += `<meta property="og:site_name" content="${og.siteName}">\n`;
      }
      if (og.locale) {
        metaTags += `<meta property="og:locale" content="${og.locale}">\n`;
      }
    }

    // Twitter Card tags
    if (seoData.seoData.twitterCard) {
      const twitter = seoData.seoData.twitterCard;
      metaTags += `<meta name="twitter:card" content="${twitter.card}">\n`;
      metaTags += `<meta name="twitter:title" content="${twitter.title}">\n`;
      metaTags += `<meta name="twitter:description" content="${twitter.description}">\n`;
      metaTags += `<meta name="twitter:image" content="${twitter.image}">\n`;
      if (twitter.site) {
        metaTags += `<meta name="twitter:site" content="${twitter.site}">\n`;
      }
      if (twitter.creator) {
        metaTags += `<meta name="twitter:creator" content="${twitter.creator}">\n`;
      }
    }

    // Custom meta tags
    if (seoData.seoData.customMetaTags) {
      for (const tag of seoData.seoData.customMetaTags) {
        if (tag.property) {
          metaTags += `<meta property="${tag.property}" content="${tag.content}">\n`;
        } else {
          metaTags += `<meta name="${tag.name}" content="${tag.content}">\n`;
        }
      }
    }

    // Structured data
    let structuredData = '';
    if (seoData.seoData.schemaMarkup) {
      structuredData = `<script type="application/ld+json">\n${JSON.stringify(seoData.seoData.schemaMarkup, null, 2)}\n</script>`;
    }

    return {
      metaTags: metaTags.trim(),
      structuredData: structuredData.trim(),
    };
  }
}
