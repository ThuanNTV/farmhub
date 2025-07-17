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
import { CreateWebhookLogDto } from 'src/modules/webhook-logs/dto/create-webhookLog.dto';
import { UpdateWebhookLogDto } from 'src/modules/webhook-logs/dto/update-webhookLog.dto';
import { WebhookLogsService } from 'src/modules/webhook-logs/service/webhook-logs.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';

@ApiTags('Webhook Logs')
@Controller('tenant/:storeId/webhook-logs')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class WebhookLogsController {
  constructor(private readonly service: WebhookLogsService) {}

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new webhook log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 201, description: 'Webhook log created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  create(@Param('storeId') storeId: string, @Body() dto: CreateWebhookLogDto) {
    return this.service.createWebhookLogs(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all webhook logs' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook logs retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get('stats')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get webhook statistics' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getStats(@Param('storeId') storeId: string) {
    return this.service.getWebhookStats(storeId);
  }

  @Get('event-type/:eventType')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get webhook logs by event type' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({
    name: 'eventType',
    description: 'Event type (e.g., order.created, payment.completed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook logs by event type retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findByEventType(
    @Param('storeId') storeId: string,
    @Param('eventType') eventType: string,
  ) {
    return this.service.findByEventType(storeId, eventType);
  }

  @Get('type/:type')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get webhook logs by type' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({
    name: 'type',
    description: 'Webhook type (outgoing or incoming)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook logs by type retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findByType(@Param('storeId') storeId: string, @Param('type') type: string) {
    return this.service.findByType(storeId, type);
  }

  @Get(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get webhook log by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Webhook Log ID' })
  @ApiResponse({ status: 200, description: 'Webhook log found' })
  @ApiResponse({ status: 404, description: 'Webhook log not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update webhook log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Webhook Log ID' })
  @ApiResponse({ status: 200, description: 'Webhook log updated successfully' })
  @ApiResponse({ status: 404, description: 'Webhook log not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookLogDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete webhook log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Webhook Log ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook log soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Webhook log not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }

  @Patch(':id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft deleted webhook log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Webhook Log ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook log restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook log not found or not deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }
}
