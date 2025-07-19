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
import { StoresService } from 'src/modules/stores/service/stores.service';
import { CreateStoreDto } from 'src/modules/stores/dto/create-store.dto';
import { UpdateStoreDto } from 'src/modules/stores/dto/update-store.dto';
import { StoreResponseDto } from 'src/modules/stores/dto/store-response.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { RequireStorePermission } from 'src/core/rbac/permission/permissions.decorator';

@ApiTags('Stores')
@Controller('tenant/stores')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @RequireStorePermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo cửa hàng mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo cửa hàng thành công',
    type: StoreResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo cửa hàng' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.createStore(createStoreDto);
  }

  @Get()
  @RequireStorePermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách cửa hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cửa hàng',
    type: [StoreResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @RequireStorePermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin cửa hàng theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin cửa hàng',
    type: StoreResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cửa hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem cửa hàng' })
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @RequireStorePermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật cửa hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: StoreResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cửa hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(id, updateStoreDto);
  }

  @Delete(':id')
  @RequireStorePermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa cửa hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Cửa hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async remove(@Param('id') id: string) {
    return this.storesService.removeStore(id);
  }

  @Patch(':id/restore')
  @RequireStorePermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục cửa hàng đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Cửa hàng không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  async restore(@Param('id') id: string) {
    return this.storesService.restore(id);
  }

  @Get('user/:userId')
  @RequireStorePermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy cửa hàng theo user' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách cửa hàng của user',
    type: [StoreResponseDto],
  })
  async findByUser(@Param('userId') userId: string) {
    return this.storesService.findByUser(userId);
  }
}
