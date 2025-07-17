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
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequireCategoryPermission } from 'src/core/rbac/permission/permissions.decorator';
import { CategoriesService } from 'src/modules/categories/service/categories.service';
import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';
import { CreateCategoryDto } from 'src/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/categories/dto/update-category.dto';

@ApiTags('Categories')
@Controller('tenant/:storeId/categories')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post(':storeId')
  @RequireCategoryPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo danh mục thành công',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo danh mục' })
  create(
    @Param('storeId') storeId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(storeId, createCategoryDto);
  }

  @Get(':storeId')
  @RequireCategoryPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách danh mục',
    type: [CategoryResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  findAll(@Param('storeId') storeId: string) {
    return this.categoriesService.findAll(storeId);
  }

  @Get(':storeId/:id')
  @RequireCategoryPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin danh mục theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin danh mục',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh mục' })
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(storeId, id);
  }

  @Patch(':storeId/:id')
  @RequireCategoryPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(storeId, id, updateCategoryDto);
  }

  @Delete(':storeId/:id')
  @RequireCategoryPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoriesService.remove(storeId, id);
  }

  @Patch(':storeId/:id/restore')
  @RequireCategoryPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục danh mục đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Danh mục không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoriesService.restore(storeId, id);
  }

  @Get(':storeId/parent/:parentId')
  @RequireCategoryPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh mục con theo danh mục cha' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách danh mục con',
    type: [CategoryResponseDto],
  })
  findByParent(
    @Param('storeId') storeId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.categoriesService.findByParent(storeId, parentId);
  }

  @Get(':storeId/tree')
  @RequireCategoryPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy cây danh mục lồng nhau' })
  @ApiResponse({
    status: 200,
    description: 'Cây danh mục',
    type: [CategoryResponseDto],
  })
  getCategoryTree(@Param('storeId') storeId: string) {
    return this.categoriesService.getCategoryTree(storeId);
  }
}
