import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TagService } from 'src/modules/tag/service/tag.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { CreateTagDto } from 'src/modules/tag/dto/create-tag.dto';
import { UpdateTagDto } from 'src/modules/tag/dto/update-tag.dto';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitModerate } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Lấy danh sách nhãn' })
  @ApiResponse({ status: 200, description: 'Danh sách nhãn' })
  @ApiQuery({ name: 'storeId', required: true })
  @ApiQuery({ name: 'active', required: false })
  async findAll(
    @Query('storeId') storeId: string,
    @Query('active') active?: boolean,
  ) {
    if (active) {
      return await this.tagService.findActive(storeId);
    }
    return await this.tagService.findAll(storeId);
  }

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Tạo nhãn mới' })
  @ApiResponse({ status: 201, description: 'Nhãn đã tạo' })
  @ApiQuery({ name: 'storeId', required: true })
  async create(@Query('storeId') storeId: string, @Body() dto: CreateTagDto) {
    return await this.tagService.create(storeId, dto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Lấy chi tiết nhãn' })
  @ApiResponse({ status: 200, description: 'Chi tiết nhãn' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findOne(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.tagService.findOne(storeId, id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Cập nhật nhãn' })
  @ApiResponse({ status: 200, description: 'Nhãn đã cập nhật' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async update(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return await this.tagService.update(storeId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Xóa nhãn' })
  @ApiResponse({ status: 200, description: 'Nhãn đã xóa' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async remove(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.tagService.remove(storeId, id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Khôi phục nhãn' })
  @ApiResponse({ status: 200, description: 'Nhãn đã khôi phục' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async restore(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.tagService.restore(storeId, id);
  }
}
