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
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateVoucherDto } from 'src/modules/vouchers/dto/create-voucher.dto';
import { UpdateVoucherDto } from 'src/modules/vouchers/dto/update-voucher.dto';
import { VoucherResponseDto } from 'src/modules/vouchers/dto/voucher-response.dto';
import { VouchersService } from 'src/modules/vouchers/service/vouchers.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { VoucherType } from 'src/entities/tenant/voucher.entity';

@ApiTags('Vouchers')
@Controller('tenant/:storeId/vouchers')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class VouchersController {
  constructor(private readonly service: VouchersService) {}

  @Post()
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new voucher' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 201, type: VoucherResponseDto })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    const entityData = {
      ...dto,
      type: VoucherType[dto.type.toUpperCase() as keyof typeof VoucherType],
      points_cost: dto.pointsCost,
      created_by_user_id: dto.createdByUserId,
      updated_by_user_id: dto.updatedByUserId,
    };
    return this.service.create(storeId, entityData);
  }

  @Get()
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all vouchers' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 200, type: [VoucherResponseDto] })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get voucher by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Voucher ID' })
  @ApiResponse({ status: 200, type: VoucherResponseDto })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update voucher' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Voucher ID' })
  @ApiResponse({ status: 200, type: VoucherResponseDto })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVoucherDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete voucher' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Voucher ID' })
  @ApiResponse({ status: 200, description: 'Voucher deleted successfully' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }

  @Patch(':id/restore')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft deleted voucher' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Voucher ID' })
  @ApiResponse({ status: 200, type: VoucherResponseDto })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }
}
