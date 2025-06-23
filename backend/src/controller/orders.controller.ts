import { Controller, Post, Body, Param } from '@nestjs/common';
import { CreateOrderDto } from '../dto/dtoOders/create-order.dto';
// import { UpdateOrderDto } from '../dto/dtoOders/update-order.dto';
import { OrdersService } from 'src/service/orders.service';

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

  // @Get()
  // findAll() {
  //   return this.ordersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ordersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
