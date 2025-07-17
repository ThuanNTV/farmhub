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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateExternalSystemLogDto } from 'src/modules/external-system-logs/dto/create-externalSystemLog.dto';
import { UpdateExternalSystemLogDto } from 'src/modules/external-system-logs/dto/update-externalSystemLog.dto';
import { ExternalSystemLogsService } from 'src/modules/external-system-logs/service/external-system-logs.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

@ApiTags('External System Logs')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/external-system-logs')
@UseGuards(EnhancedAuthGuard)
@UseInterceptors(AuditInterceptor)
@RateLimitAPI()
export class ExternalSystemLogsController {
  constructor(private readonly service: ExternalSystemLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new external system log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateExternalSystemLogDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all external system logs' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get external system log by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'External System Log ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update external system log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'External System Log ID' })
  @Roles(UserRole.ADMIN_GLOBAL)
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExternalSystemLogDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete external system log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'External System Log ID' })
  @Roles(UserRole.ADMIN_GLOBAL)
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
