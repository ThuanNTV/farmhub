import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreatePaymentDto } from 'src/modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from 'src/modules/payments/dto/update-payment.dto';
import { PaymentsService } from 'src/modules/payments/service/payments.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';

@ApiTags('Payments')
@Controller('tenant/:storeId/payments')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  create(@Param('storeId') storeId: string, @Body() dto: CreatePaymentDto) {
    return this.service.createPayment(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all payments with advanced filtering' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by payment status',
  })
  @ApiQuery({
    name: 'payment_method_id',
    required: false,
    description: 'Filter by payment method',
  })
  @ApiQuery({
    name: 'paid_by_user_id',
    required: false,
    description: 'Filter by user who made payment',
  })
  @ApiQuery({
    name: 'order_id',
    required: false,
    description: 'Filter by order ID',
  })
  @ApiQuery({
    name: 'min_amount',
    required: false,
    description: 'Minimum amount filter',
  })
  @ApiQuery({
    name: 'max_amount',
    required: false,
    description: 'Maximum amount filter',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date filter (ISO string)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date filter (ISO string)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order (ASC or DESC)',
  })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findAll(
    @Param('storeId') storeId: string,
    @Query()
    query: {
      status?: string;
      payment_method_id?: string;
      paid_by_user_id?: string;
      order_id?: string;
      min_amount?: number;
      max_amount?: number;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'ASC' | 'DESC';
    },
  ) {
    const filters = {
      ...query,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
    };
    return this.service.findWithFilters(storeId, filters);
  }

  @Get('stats')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date filter (ISO string)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date filter (ISO string)',
  })
  @ApiQuery({
    name: 'payment_method_id',
    required: false,
    description: 'Filter by payment method',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  getStats(
    @Param('storeId') storeId: string,
    @Query()
    query: {
      start_date?: string;
      end_date?: string;
      payment_method_id?: string;
    },
  ) {
    const filters = {
      ...query,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
    };
    return this.service.getPaymentStats(storeId, filters);
  }

  @Get(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.service.updatePayment(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete payment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.removePayment(storeId, id);
  }

  @Patch(':id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore soft-deleted payment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment restored successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found or not deleted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restorePayment(storeId, id);
  }
}
