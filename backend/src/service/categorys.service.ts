import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async createCategory(storeId: string, dto: CreateCategoryDto) {
    const repo = await this.getRepo(storeId);

    // Kiểm tra sản phẩm có ID đã tồn tại
    const existing = await this.findById(storeId, dto.id);
    if (existing) {
      throw new InternalServerErrorException(
        `❌ Danh mục với ID "${dto.id}" đã tồn tại`,
      );
    }

    const product = repo.create(dto);
    const saveEntity = await repo.save(product);
    return {
      message: 'Thêm danh mục mới thành công',
      data: saveEntity,
    };
  }

  async findById(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      id,
      isDeleted: false,
      isActive: true,
    });
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { isDeleted: false, isActive: true },
    });
  }

  async findOne(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      id,
      isDeleted: false,
      isActive: true,
    });
  }

  async update(storeId: string, id: string, dto: UpdateCategoryDto) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, id);

    // Cập nhật các trường cần thiết
    Object.assign(entity, dto);
    const updatedEntity = await repo.save(entity);
    return {
      message: 'Cập nhật danh mục thành công',
      data: updatedEntity,
    };
  }

  async remove(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, id);

    // Đánh dấu là đã xóa thay vì xóa thực sự
    entity.isDeleted = true;
    await repo.save(entity);
    return {
      message: 'Xóa danh mục thành công',
      data: null,
    };
  }
}
