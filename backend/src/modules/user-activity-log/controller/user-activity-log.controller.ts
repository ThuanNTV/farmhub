import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserActivityLogService } from 'src/modules/user-activity-log/service/user-activity-log.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { RequestWithUser } from 'src/common/types/common.types';
import { UserActivityLogResponseDto } from 'src/modules/user-activity-log/dto/userActivityLog-response.dto';

@ApiTags('UserActivityLogs')
@Controller('user-activity-logs')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class UserActivityLogController {
  constructor(
    private readonly userActivityLogService: UserActivityLogService,
  ) {}

  @Get(':storeId')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử hoạt động người dùng' })
  @ApiResponse({ status: 200, description: 'Lịch sử hoạt động' })
  getAll(@Param('storeId') storeId: string) {
    return this.userActivityLogService.getAll(storeId);
  }

  @Post(':storeId')
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Ghi nhận hoạt động người dùng' })
  @ApiResponse({ status: 201, description: 'Đã ghi nhận hoạt động' })
  create(
    @Param('storeId') storeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.userActivityLogService.create(storeId, body);
  }

  @Post(':storeId/get')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết hoạt động' })
  @ApiResponse({ status: 200, description: 'Chi tiết hoạt động' })
  getLog(@Param('storeId') storeId: string, @Body('id') id: string) {
    return this.userActivityLogService.getLog(storeId, id);
  }

  @Post('filter')
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lọc user activity logs' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách user activity logs đã lọc',
    type: [UserActivityLogResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền lọc' })
  async filter(@Request() req: RequestWithUser) {
    // Lấy storeId từ req.user hoặc req.body tuỳ hệ thống
    const storeId = req.user.storeId ?? '';
    // Nếu muốn lọc theo userId, lấy từ req.user.id hoặc req.body.userId
    // const userId = req.user.id;
    return this.userActivityLogService.filter(storeId);
  }
}
