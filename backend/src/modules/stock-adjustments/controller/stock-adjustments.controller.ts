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
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateStockAdjustmentDto } from 'src/modules/stock-adjustments/dto/create-stockAdjustment.dto';
import { UpdateStockAdjustmentDto } from 'src/modules/stock-adjustments/dto/update-stockAdjustment.dto';
import { StockAdjustmentsService } from 'src/modules/stock-adjustments/service/stock-adjustments.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequirePermissions } from 'src/core/rbac/permission/permissions.decorator';

@ApiTags('Stock Adjustments')
@Controller('tenant/:storeId/stock-adjustments')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
export class StockAdjustmentsController {
  constructor(private readonly service: StockAdjustmentsService) {}

  @Post()
  @RequirePermissions({ resource: 'stock-adjustments', action: 'create' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new stock adjustment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateStockAdjustmentDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'stock-adjustments', action: 'list' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all stock adjustments' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'stock-adjustments', action: 'read' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get stock adjustment by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Stock Adjustment ID' })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'stock-adjustments', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update stock adjustment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Stock Adjustment ID' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStockAdjustmentDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'stock-adjustments', action: 'delete' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete stock adjustment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Stock Adjustment ID' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }

  @Patch(':id/restore')
  @RequirePermissions({ resource: 'stock-adjustments', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft deleted stock adjustment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Stock Adjustment ID' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }
}
