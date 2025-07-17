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
import { CreateReturnOrderDto } from 'src/modules/return-orders/dto/create-returnOrder.dto';
import { UpdateReturnOrderDto } from 'src/modules/return-orders/dto/update-returnOrder.dto';
import { ReturnOrdersService } from 'src/modules/return-orders/service/return-orders.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequirePermissions } from 'src/core/rbac/permission/permissions.decorator';

@ApiTags('Return Orders')
@Controller('tenant/:storeId/return-orders')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class ReturnOrdersController {
  constructor(private readonly service: ReturnOrdersService) {}

  @Post()
  @RequirePermissions({ resource: 'return-orders', action: 'create' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new return order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  create(@Param('storeId') storeId: string, @Body() dto: CreateReturnOrderDto) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'return-orders', action: 'list' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all return orders' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'return-orders', action: 'read' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get return order by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Return Order ID' })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'return-orders', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update return order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Return Order ID' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReturnOrderDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Patch(':id/restore')
  @RequirePermissions({ resource: 'return-orders', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted return order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Return Order ID' })
  async restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'return-orders', action: 'delete' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Delete return order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Return Order ID' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
