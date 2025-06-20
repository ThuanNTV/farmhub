// src/tenant/product/tenant-products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreateProductDto } from 'src/dto/dtoProducts/create-product.dto';
import { UpdateProductDto } from 'src/dto/dtoProducts/update-product.dto';
import { ProductsService } from 'src/service/products.service';

@Controller('tenant/:storeId/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  create(@Param('storeId') storeId: string, @Body() dto: CreateProductDto) {
    return this.service.create(storeId, dto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
