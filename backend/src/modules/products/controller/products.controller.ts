import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from 'src/modules/products/service/products.service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import { ProductResponseDto } from 'src/modules/products/dto/product-response.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import {
  RequireProductPermission,
  RequirePermissions,
} from 'src/core/rbac/permission/permissions.decorator';

@ApiTags('Products')
@Controller('tenant/:storeId/products')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':storeId')
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo sản phẩm' })
  create(
    @Param('storeId') storeId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(storeId, createProductDto);
  }

  @Get(':storeId')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm',
    type: [ProductResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  findAll(@Param('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }

  @Get(':storeId/:id')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin sản phẩm',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem sản phẩm' })
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.findOne(storeId, id);
  }

  @Patch(':storeId/:id')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(storeId, id, updateProductDto);
  }

  @Delete(':storeId/:id')
  @RequireProductPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.remove(storeId, id);
  }

  @Patch(':storeId/:id/restore')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục sản phẩm đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.restore(storeId, id);
  }

  // Ví dụ về permission với điều kiện phức tạp
  @Get('store/:storeId')
  @RequirePermissions({
    resource: 'products',
    action: 'list',
    conditions: [
      {
        field: 'params.storeId',
        operator: 'in',
        value: 'user.associatedStoreIds',
      },
    ],
  })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm theo store (với kiểm tra quyền)' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm của store' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập store này',
  })
  findByStore(@Param('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }
}
