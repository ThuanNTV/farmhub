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
import { CreatePromotionDto } from 'src/modules/promotions/dto/create-promotion.dto';
import { UpdatePromotionDto } from 'src/modules/promotions/dto/update-promotion.dto';
import { PromotionsService } from 'src/modules/promotions/service/promotions.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequirePermissions } from 'src/core/rbac/permission/permissions.decorator';
import { PromotionType } from 'src/entities/tenant/promotion.entity';

@ApiTags('Promotions')
@Controller('tenant/:storeId/promotions')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Post()
  @RequirePermissions({ resource: 'promotions', action: 'create' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    const entityData = {
      ...dto,
      type: PromotionType[dto.type.toUpperCase() as keyof typeof PromotionType],
      applies_to: dto.appliesTo,
      start_date: dto.startDate,
      end_date: dto.endDate,
      is_active: dto.isActive,
      created_by_user_id: dto.createdByUserId,
      updated_by_user_id: dto.updatedByUserId,
    };
    return this.service.create(storeId, entityData);
  }

  @Get()
  @RequirePermissions({ resource: 'promotions', action: 'list' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'promotions', action: 'read' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'promotions', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update promotion' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Patch(':id/restore')
  @RequirePermissions({ resource: 'promotions', action: 'update' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted promotion' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  async restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'promotions', action: 'delete' })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
