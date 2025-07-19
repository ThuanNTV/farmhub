import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import {
  RateLimitLoose,
  RateLimitModerate,
  RateLimitStrict,
} from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { CreateNotificationDto } from 'src/modules/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from 'src/modules/notification/dto/update-notification.dto';
import { NotificationService } from 'src/service/global/notification.service';

@ApiTags('Notifications')
@Controller('tenant/:storeId/notifications')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitLoose()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo' })
  @ApiParam({ name: 'storeId', required: true })
  async findAll(@Param('storeId') storeId: string) {
    return this.notificationService.findAllNotifications(storeId);
  }

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Gửi thông báo' })
  @ApiResponse({ status: 201, description: 'Thông báo đã gửi' })
  @ApiParam({ name: 'storeId', required: true })
  async create(
    @Param('storeId') storeId: string,
    @Body() body: CreateNotificationDto,
  ) {
    return this.notificationService.createNotification(storeId, body);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Lấy chi tiết thông báo' })
  @ApiResponse({ status: 200, description: 'Chi tiết thông báo' })
  @ApiParam({ name: 'storeId', required: true })
  @ApiParam({ name: 'id', required: true })
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.notificationService.findOneNotification(storeId, id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Cập nhật thông báo' })
  @ApiResponse({ status: 200, description: 'Thông báo đã cập nhật' })
  @ApiParam({ name: 'storeId', required: true })
  @ApiParam({ name: 'id', required: true })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
  ) {
    return this.notificationService.updateNotification(storeId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiResponse({ status: 200, description: 'Thông báo đã xóa' })
  @ApiParam({ name: 'storeId', required: true })
  @ApiParam({ name: 'id', required: true })
  async remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.notificationService.removeNotification(storeId, id);
  }

  @Post(':id/mark-as-read')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Đánh dấu đã đọc thông báo' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu đã đọc' })
  @ApiParam({ name: 'storeId', required: true })
  @ApiParam({ name: 'id', required: true })
  async markAsRead(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(storeId, id);
  }

  @Post('mark-all-as-read')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu tất cả đã đọc' })
  @ApiParam({ name: 'storeId', required: true })
  async markAllAsRead(@Param('storeId') storeId: string) {
    return this.notificationService.markAllAsRead(storeId);
  }
}
