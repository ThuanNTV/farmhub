import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-orderItem.dto';
import { UpdateOrderItemDto } from 'src/modules/order-items/dto/update-orderItem.dto';
import { OrderItemResponseDto } from 'src/modules/order-items/dto/orderItem-response.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequestWithUser } from 'src/common/types/common.types';
import { OrderItemsService } from '../service';

@ApiTags('Order Items')
@Controller('tenant/:storeId/order-items')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new order item' })
  @ApiResponse({
    status: 201,
    description: 'Order item created successfully',
    type: OrderItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - order item already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(
    @Param('storeId') storeId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
    @Request() req: RequestWithUser,
  ): Promise<OrderItemResponseDto> {
    return this.orderItemsService.createOrderItem(
      storeId,
      createOrderItemDto,
      req.user.id,
    );
  }

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all order items' })
  @ApiResponse({
    status: 200,
    description: 'Return all order items',
    type: [OrderItemResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<OrderItemResponseDto[]> {
    return this.orderItemsService.findAllOrderItems(storeId);
  }

  @Get('order/:orderId')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all order items for a specific order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Return order items for the order',
    type: [OrderItemResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findByOrder(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ): Promise<OrderItemResponseDto[]> {
    return this.orderItemsService.findByOrder(storeId, orderId);
  }

  @Get(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get order item by ID' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Order item found',
    type: OrderItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findOne(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<OrderItemResponseDto> {
    return this.orderItemsService.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update order item' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Order item updated successfully',
    type: OrderItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - order item already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @Request() req: RequestWithUser,
  ): Promise<OrderItemResponseDto> {
    return this.orderItemsService.update(
      storeId,
      id,
      updateOrderItemDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete order item' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Order item soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.orderItemsService.remove(storeId, id, req.user.id);
  }

  @Patch(':id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted order item' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Order item restored successfully',
    type: OrderItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found or not deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async restore(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<OrderItemResponseDto> {
    return this.orderItemsService.restore(storeId, id, req.user.id);
  }
}
