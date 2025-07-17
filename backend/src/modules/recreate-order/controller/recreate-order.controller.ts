import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';

@ApiTags('RecreateOrder')
@Controller('orders/recreate')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
export class RecreateOrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':storeId')
  @ApiOperation({ summary: 'Tạo lại đơn hàng từ đơn cũ (clone)' })
  @ApiResponse({ status: 201, description: 'Đơn hàng mới được tạo lại' })
  recreateOrder(
    @Param('storeId') storeId: string,
    @Body('orderId') orderId: string,
  ) {
    return this.ordersService.recreateOrder(storeId, orderId);
  }
}
