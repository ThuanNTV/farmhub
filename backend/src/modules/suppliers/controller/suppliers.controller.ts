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
import { CreateSupplierDto } from 'src/modules/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from 'src/modules/suppliers/dto/update-supplier.dto';
import { SuppliersService } from 'src/modules/suppliers/service/suppliers.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequirePermissions } from 'src/core/rbac/permission/permissions.decorator';

@ApiTags('Suppliers')
@Controller('tenant/:storeId/suppliers')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Post()
  @RequirePermissions({ resource: 'suppliers', action: 'create' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  create(@Param('storeId') storeId: string, @Body() dto: CreateSupplierDto) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'suppliers', action: 'list' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'suppliers', action: 'read' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'suppliers', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update supplier' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'suppliers', action: 'delete' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }

  @Patch(':id/restore')
  @RequirePermissions({ resource: 'suppliers', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft-deleted supplier' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }
}
