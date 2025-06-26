import { Controller, Post, Body, Param, Get, Patch } from '@nestjs/common';
import { CreateOrderDto } from '../dto/dtoOders/create-order.dto';
// import { UpdateOrderDto } from '../dto/dtoOders/update-order.dto';
import { OrdersService } from 'src/service/orders.service';
import { UpdateOrderDto } from 'src/dto/dtoOders/update-order.dto';

@Controller('tenant/:storeId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Param('storeId') storeId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(storeId, createOrderDto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.ordersService.findAllOrder(storeId);
  }

  @Get(':orderId')
  findOne(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findOne(storeId, orderId);
  }

  @Patch(':orderId')
  update(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(storeId, orderId, updateOrderDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
