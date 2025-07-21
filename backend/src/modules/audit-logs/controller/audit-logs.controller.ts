import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { AuditLogResponseDto } from 'src/modules/audit-logs/dto/audit-log-response.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';
import {
  AuditLogFilterDto,
  AuditLogStatsDto,
  PaginatedAuditLogResponseDto,
  DateRangeDto,
} from '../dto/audit-log-filter.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@Controller('tenant/:storeId/audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new audit log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    const entity = await this.service.create(storeId, dto);
    return this.service.mapToResponseDto(entity);
  }

  @Get()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<AuditLogResponseDto[]> {
    const entities = await this.service.findAll(storeId);
    return entities.map((e) => this.service.mapToResponseDto(e));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Audit Log ID' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<AuditLogResponseDto> {
    const entity = await this.service.findOne(storeId, id);
    return this.service.mapToResponseDto(entity);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update audit log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Audit Log ID' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    const entity = await this.service.update(storeId, id, dto);
    return this.service.mapToResponseDto(entity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Delete audit log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Audit Log ID' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.service.remove(storeId, id);
  }

  @Get(':storeId/search')
  @RequireUserPermission('read')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm audit logs với bộ lọc nâng cao' })
  @ApiParam({ name: 'storeId', description: 'ID của store' })
  async searchLogs(
    @Param('storeId') storeId: string,
    @Query() filters: AuditLogFilterDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    return this.service.findWithFilters(storeId, filters);
  }

  @Get(':storeId/statistics')
  @RequireUserPermission('read')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thống kê audit logs' })
  @ApiParam({ name: 'storeId', description: 'ID của store' })
  async getStatistics(
    @Param('storeId') storeId: string,
    @Query() dateRange?: DateRangeDto,
  ): Promise<AuditLogStatsDto> {
    return this.service.getStatistics(storeId, dateRange);
  }

  @Get(':storeId/history/:targetTable/:targetId')
  @RequireUserPermission('read')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi của một record' })
  @ApiParam({ name: 'storeId', description: 'ID của store' })
  @ApiParam({ name: 'targetTable', description: 'Tên bảng' })
  @ApiParam({ name: 'targetId', description: 'ID của record' })
  async getChangeHistory(
    @Param('storeId') storeId: string,
    @Param('targetTable') targetTable: string,
    @Param('targetId') targetId: string,
  ): Promise<AuditLogResponseDto[]> {
    return this.service.getChangeHistory(storeId, targetTable, targetId);
  }
}
