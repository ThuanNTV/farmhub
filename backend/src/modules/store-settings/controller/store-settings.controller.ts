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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateStoreSettingDto } from 'src/modules/store-settings/dto/create-storeSetting.dto';
import { UpdateStoreSettingDto } from 'src/modules/store-settings/dto/update-storeSetting.dto';
import { StoreSettingsService } from 'src/modules/store-settings/service/store-settings.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequestWithUser } from 'src/common/types/common.types';

@ApiTags('Store Settings')
@Controller('tenant/:storeId/store-settings')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class StoreSettingsController {
  constructor(private readonly service: StoreSettingsService) {}

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new store setting' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'Store setting created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - setting key already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateStoreSettingDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.createStoreSetting(storeId, dto, req.user.id);
  }

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all store settings' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Store settings retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get('key/:key')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get store setting by key' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Store setting found' })
  @ApiResponse({ status: 404, description: 'Store setting not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findByKey(@Param('storeId') storeId: string, @Param('key') key: string) {
    return this.service.findByKey(storeId, key);
  }

  @Get('value/:key')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get store setting value by key' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting value retrieved' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getSettingValue(
    @Param('storeId') storeId: string,
    @Param('key') key: string,
  ) {
    return this.service.getSettingValue(storeId, key);
  }

  @Get('category/:category')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get store settings by category' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({
    name: 'category',
    description: 'Setting category (e.g., email, payment, ui)',
  })
  @ApiResponse({
    status: 200,
    description: 'Store settings by category retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getByCategory(
    @Param('storeId') storeId: string,
    @Param('category') category: string,
  ) {
    return this.service.getSettingsByCategory(storeId, category);
  }

  @Get(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get store setting by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Store Setting ID' })
  @ApiResponse({ status: 200, description: 'Store setting found' })
  @ApiResponse({ status: 404, description: 'Store setting not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update store setting' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Store Setting ID' })
  @ApiResponse({
    status: 200,
    description: 'Store setting updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Store setting not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - setting key already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStoreSettingDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.update(storeId, id, dto, req.user.id);
  }

  @Patch('key/:key')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update store setting by key' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({
    status: 200,
    description: 'Store setting updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  updateByKey(
    @Param('storeId') storeId: string,
    @Param('key') key: string,
    @Body() body: { value: string },
    @Request() req: RequestWithUser,
  ) {
    return this.service.updateByKey(storeId, key, body.value, req.user.id);
  }

  @Delete(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete store setting' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Store Setting ID' })
  @ApiResponse({
    status: 200,
    description: 'Store setting soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Store setting not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }

  @Delete('key/:key')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Delete store setting by key' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({
    status: 200,
    description: 'Store setting deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Store setting not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  deleteByKey(@Param('storeId') storeId: string, @Param('key') key: string) {
    return this.service.deleteByKey(storeId, key);
  }

  @Patch(':id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft deleted store setting' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Store Setting ID' })
  @ApiResponse({
    status: 200,
    description: 'Store setting restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Store setting not found or not deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }
}
