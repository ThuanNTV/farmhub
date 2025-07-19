import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from 'src/modules/categories/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
