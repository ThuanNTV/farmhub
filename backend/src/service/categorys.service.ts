import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/dtoCategories/create-category.dto';
import { UpdateCategoryDto } from '../dto/dtoCategories/update-category.dto';
import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { Category } from 'src/entities/tenant/category.entity';
import { TenantBaseService } from 'src/common/helpers/tenant-base.service';

@Injectable()
export class CategorysService extends TenantBaseService<Category> {
  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Category);
  }
}
