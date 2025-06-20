import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/dtoCategories/create-category.dto';
import { UpdateCategoryDto } from '../dto/dtoCategories/update-category.dto';
import { CategorysService } from 'src/service/categorys.service';

@Controller('/tenant/:storeId/categories')
export class CategorysController {
  constructor(private readonly categorysService: CategorysService) {}

  @Post()
  create(
    @Param('storeId') storeId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categorysService.createCategory(storeId, createCategoryDto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.categorysService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('storeId') storeId: string) {
    return this.categorysService.findOne(storeId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('storeId') storeId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categorysService.update(storeId, id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categorysService.remove(storeId, id);
  }
}
