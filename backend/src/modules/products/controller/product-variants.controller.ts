import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { ProductVariantsService } from '../service/product-variants.service';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductAttributeDto,
  ProductVariantResponseDto,
  ProductAttributeResponseDto,
  ProductWithVariantsResponseDto,
  VariantFilterDto,
} from '../dto/product-variants.dto';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RequireProductPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';

@ApiTags('Product Variants')
@Controller('tenant/:storeId/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  // Product Attributes endpoints
  @Post('attributes')
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo thuộc tính sản phẩm mới' })
  @ApiResponse({
    status: 201,
    description: 'Thuộc tính được tạo thành công',
    type: ProductAttributeResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo' })
  @ApiResponse({ status: 409, description: 'Thuộc tính đã tồn tại' })
  createAttribute(
    @Param('storeId') storeId: string,
    @Body() createDto: CreateProductAttributeDto,
  ) {
    return this.productVariantsService.createAttribute(storeId, createDto);
  }

  @Get('attributes')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách thuộc tính sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thuộc tính',
    type: [ProductAttributeResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getAttributes(@Param('storeId') storeId: string) {
    return this.productVariantsService.getAttributes(storeId);
  }

  // Product Variants endpoints
  @Post(':productId/variants')
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo biến thể sản phẩm mới' })
  @ApiResponse({
    status: 201,
    description: 'Biến thể được tạo thành công',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 409, description: 'SKU đã tồn tại' })
  createVariant(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() createDto: CreateProductVariantDto,
  ) {
    // Ensure productId matches the one in the DTO
    createDto.productId = productId;
    return this.productVariantsService.createVariant(storeId, createDto);
  }

  @Get(':productId/variants')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm với tất cả biến thể' })
  @ApiResponse({
    status: 200,
    description: 'Sản phẩm với danh sách biến thể',
    type: ProductWithVariantsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  getProductWithVariants(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.productVariantsService.getProductWithVariants(
      storeId,
      productId,
    );
  }

  @Get('variants')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách biến thể với bộ lọc' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách biến thể đã lọc',
    schema: {
      type: 'object',
      properties: {
        variants: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductVariantResponseDto' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getVariants(
    @Param('storeId') storeId: string,
    @Query() filterDto: VariantFilterDto,
  ) {
    return this.productVariantsService.getVariants(storeId, filterDto);
  }

  @Get('variants/:variantId')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết biến thể' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết biến thể',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Biến thể không tồn tại' })
  getVariantById(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productVariantsService.getVariantById(storeId, variantId);
  }

  @Put('variants/:variantId')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật biến thể sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Biến thể được cập nhật thành công',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  @ApiResponse({ status: 404, description: 'Biến thể không tồn tại' })
  updateVariant(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.updateVariant(
      storeId,
      variantId,
      updateDto,
    );
  }

  @Delete('variants/:variantId')
  @RequireProductPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa biến thể sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Biến thể được xóa thành công',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Biến thể không tồn tại' })
  deleteVariant(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productVariantsService.deleteVariant(storeId, variantId);
  }

  // Bulk operations
  @Post(':productId/variants/bulk')
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo nhiều biến thể cùng lúc' })
  @ApiResponse({
    status: 201,
    description: 'Biến thể được tạo thành công',
    type: [ProductVariantResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo' })
  async createVariantsBulk(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() createDtos: CreateProductVariantDto[],
  ) {
    const results: ProductVariantResponseDto[] = [];
    for (const createDto of createDtos) {
      createDto.productId = productId;
      const variant = await this.productVariantsService.createVariant(
        storeId,
        createDto,
      );
      results.push(variant);
    }
    return results;
  }

  @Put('variants/bulk')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật nhiều biến thể cùng lúc' })
  @ApiResponse({
    status: 200,
    description: 'Biến thể được cập nhật thành công',
    type: [ProductVariantResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async updateVariantsBulk(
    @Param('storeId') storeId: string,
    @Body()
    updates: Array<{ variantId: string; data: UpdateProductVariantDto }>,
  ) {
    const results: ProductVariantResponseDto[] = [];
    for (const update of updates) {
      const variant = await this.productVariantsService.updateVariant(
        storeId,
        update.variantId,
        update.data,
      );
      results.push(variant);
    }
    return results;
  }

  @Delete('variants/bulk')
  @RequireProductPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa nhiều biến thể cùng lúc' })
  @ApiResponse({
    status: 200,
    description: 'Biến thể được xóa thành công',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async deleteVariantsBulk(
    @Param('storeId') storeId: string,
    @Body() variantIds: string[],
  ) {
    for (const variantId of variantIds) {
      await this.productVariantsService.deleteVariant(storeId, variantId);
    }
    return { message: `Deleted ${variantIds.length} variants successfully` };
  }

  // Utility endpoints
  @Post(':productId/variants/generate')
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tự động tạo biến thể từ thuộc tính' })
  @ApiResponse({
    status: 201,
    description: 'Biến thể được tạo tự động',
    type: [ProductVariantResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo' })
  generateVariants(
    @Param('storeId') _storeId: string,
    @Param('productId') _productId: string,
    @Body()
    _generateDto: {
      attributes: Array<{
        attributeId: string;
        values: Array<{ value: string; displayValue?: string }>;
      }>;
      baseVariant: Omit<
        CreateProductVariantDto,
        'productId' | 'attributes' | 'sku' | 'name'
      >;
    },
  ) {
    // This would implement automatic variant generation logic
    // For now, return a placeholder
    return { message: 'Variant generation not implemented yet' };
  }
}
