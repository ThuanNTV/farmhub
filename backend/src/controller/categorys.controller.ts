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

@Controller('/tenant/:storeId/categorys')
export class CategorysController {
  constructor(private readonly categorysService: CategorysService) {}

  // @Post()
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categorysService.create(createCategoryDto);
  // }

  // @Get()
  // findAll() {
  //   return this.categorysService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categorysService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return this.categorysService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categorysService.remove(+id);
  // }
}
