import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomersService } from '../service/customers.service';
import { CreateCustomerDto } from '../dto/dtoCustomers/create-customer.dto';
import { UpdateCustomerDto } from '../dto/dtoCustomers/update-customer.dto';

@Controller('tenant/:storeId/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Param('storeId') storeId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(storeId, createCustomerDto);
  }

  @Get()
  async findAll(@Param('storeId') storeId: string) {
    return this.customersService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.customersService.findOne(storeId, id);
  }

  @Patch(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(storeId, id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.customersService.remove(storeId, id);
  }
}
