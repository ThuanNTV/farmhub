import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { ScheduledTaskService } from '../service/scheduled-task.service';

@ApiTags('ScheduledTasks')
@Controller('tenant/:storeId/scheduled-tasks')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(AuditInterceptor)
export class ScheduledTaskController {
  constructor(private readonly scheduledTaskService: ScheduledTaskService) {}

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách tác vụ định kỳ' })
  @ApiResponse({ status: 200, description: 'Danh sách tác vụ' })
  getAll(@Param('storeId') storeId: string) {
    return this.scheduledTaskService.getAll(storeId);
  }

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo tác vụ định kỳ mới' })
  @ApiResponse({ status: 201, description: 'Đã tạo tác vụ' })
  create(
    @Param('storeId') storeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scheduledTaskService.create(storeId, body);
  }

  @Post('get')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết tác vụ' })
  @ApiResponse({ status: 200, description: 'Chi tiết tác vụ' })
  getTask(@Param('storeId') storeId: string, @Body() body: { taskId: string }) {
    return this.scheduledTaskService.getTask(storeId, body.taskId);
  }

  @Post('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật tác vụ' })
  @ApiResponse({ status: 200, description: 'Tác vụ đã cập nhật' })
  updateTask(
    @Param('storeId') storeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scheduledTaskService.updateTask(
      storeId,
      body.taskId as string,
      body,
    );
  }

  @Post('remove')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa tác vụ' })
  @ApiResponse({ status: 200, description: 'Tác vụ đã xóa' })
  removeTask(
    @Param('storeId') storeId: string,
    @Body() body: { taskId: string },
  ) {
    return this.scheduledTaskService.removeTask(storeId, body.taskId);
  }
}
