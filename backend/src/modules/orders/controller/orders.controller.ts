import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { CreateOrderAtomicDto } from 'src/modules/orders/dto/create-order-atomic.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { OrderResponseDto } from 'src/modules/orders/dto/order-response.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequestWithUser } from 'src/common/types/common.types';
import { RequireOrderPermission } from 'src/core/rbac/permission/permissions.decorator';
import { OrderStatus } from 'src/entities/tenant/order.entity';

@ApiTags('Orders')
@Controller('tenant/:storeId/orders')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class OrdersController {
  recreateOrder(orderId: string, arg1: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':storeId')
  @RequireOrderPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng thành công',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo đơn hàng' })
  create(
    @Param('storeId') storeId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(storeId, createOrderDto);
  }

  @Post(':storeId/atomic')
  @RequireOrderPermission('create')
  @RateLimitAPI()
  @ApiOperation({
    summary:
      'Tạo đơn hàng với atomic transaction (trừ kho, tạo đơn hàng, thanh toán, audit log)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng thành công với transaction',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc kho không đủ',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo đơn hàng' })
  @ApiResponse({ status: 500, description: 'Lỗi transaction hoặc thanh toán' })
  async createOrderAtomic(
    @Param('storeId') storeId: string,
    @Body() createOrderDto: CreateOrderAtomicDto,
    _req: RequestWithUser,
  ) {
    const { paymentMethodId, ...orderData } = createOrderDto;

    return this.ordersService.createOrderAtomic(
      storeId,
      orderData,
      _req.user.id,
      paymentMethodId,
    );
  }

  @Get(':storeId')
  @RequireOrderPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  async findAll(@Param('storeId') storeId: string) {
    return this.ordersService.findAllOrder(storeId);
  }

  @Get(':storeId/:id')
  @RequireOrderPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin đơn hàng',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Đơn hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem đơn hàng' })
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.ordersService.findOne(storeId, id);
  }

  @Patch(':storeId/:id')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Đơn hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(storeId, id, updateOrderDto);
  }

  @Delete(':storeId/:id')
  @RequireOrderPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Đơn hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.ordersService.remove(storeId, id);
  }

  @Patch(':storeId/:id/restore')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục đơn hàng đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Đơn hàng không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  async restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.ordersService.restore(storeId, id);
  }

  @Patch(':storeId/:id/confirm')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xác nhận đơn hàng' })
  @ApiResponse({ status: 200, description: 'Xác nhận thành công' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền xác nhận' })
  async confirmOrder(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.confirmOrder(storeId, id);
  }

  @Patch(':storeId/:id/ship')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Giao hàng' })
  @ApiResponse({ status: 200, description: 'Giao hàng thành công' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền giao hàng' })
  async shipOrder(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.ordersService.shipOrder(storeId, id);
  }

  @Patch(':storeId/:id/complete')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Hoàn thành đơn hàng' })
  @ApiResponse({ status: 200, description: 'Hoàn thành thành công' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoàn thành' })
  async completeOrder(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.completeOrder(storeId, id);
  }

  @Patch(':storeId/:id/cancel')
  @RequireOrderPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiResponse({ status: 200, description: 'Hủy thành công' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy' })
  async cancelOrder(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancelOrder(storeId, id);
  }

  @Get(':storeId/status/:status')
  @RequireOrderPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy đơn hàng theo trạng thái' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng theo trạng thái',
    type: [OrderResponseDto],
  })
  async findByStatus(
    @Param('storeId') storeId: string,
    @Param('status') status: string,
  ) {
    if (!(status in OrderStatus)) {
      throw new BadRequestException(
        `Trạng thái đơn hàng không hợp lệ: ${status}`,
      );
    }
    return this.ordersService.findByStatus(
      storeId,
      OrderStatus[status as keyof typeof OrderStatus],
    );
  }

  @Get(':storeId/customer/:customerId')
  @RequireOrderPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy đơn hàng theo khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của khách hàng',
    type: [OrderResponseDto],
  })
  async findByCustomer(
    @Param('storeId') storeId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.ordersService.findByCustomer(storeId, customerId);
  }
}
