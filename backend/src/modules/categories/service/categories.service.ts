import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Category } from 'src/entities/tenant/category.entity';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { CreateCategoryDto } from 'src/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/categories/dto/update-category.dto';

@Injectable()
export class CategoriesService extends TenantBaseService<Category> {
  protected primaryKey!: string;
  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Category);
    this.primaryKey = 'categoryId';
  }

  async createCategory(storeId: string, dto: CreateCategoryDto) {
    const repo = await this.getRepo(storeId);

    // Kiểm tra sản phẩm có ID đã tồn tại
    const existing = await this.findById(storeId, dto.categoryId);
    if (existing) {
      throw new ConflictException(
        `❌ Danh mục với ID "${dto.categoryId}" đã tồn tại`,
      );
    }

    // Kiểm tra slug đã tồn tại chưa (unique)
    const existingSlug = await repo.findOne({
      where: { slug: dto.slug, is_deleted: false },
    });
    if (existingSlug) {
      throw new ConflictException(
        `❌ Slug "${dto.slug}" đã tồn tại, vui lòng chọn slug khác!`,
      );
    }

    // Kiểm tra parentId tồn tại (nếu có)
    if (dto.parentId) {
      const parent = await repo.findOne({
        where: { category_id: dto.parentId, is_deleted: false },
      });
      if (!parent) {
        throw new NotFoundException(
          `❌ parentId "${dto.parentId}" không tồn tại hoặc đã bị xóa!`,
        );
      }
      // Kiểm tra vòng lặp parent (prevent circular reference)
      let currentParent: Category | null = parent;
      while (currentParent?.parent_id) {
        if (currentParent.parent_id === dto.categoryId) {
          throw new BadRequestException('Không thể tạo vòng lặp cha-con!');
        }
        currentParent = await repo.findOne({
          where: { category_id: currentParent.parent_id, is_deleted: false },
        });
      }
    }

    // Validate image là JSON hợp lệ (nếu có)
    if (dto.image) {
      try {
        JSON.parse(dto.image);
      } catch {
        throw new BadRequestException('Trường image phải là JSON hợp lệ!');
      }
    }

    // Validate/mapping createdByUserId, updatedByUserId
    if (dto.createdByUserId && typeof dto.createdByUserId !== 'string') {
      throw new BadRequestException('createdByUserId phải là string');
    }
    if (dto.updatedByUserId && typeof dto.updatedByUserId !== 'string') {
      throw new BadRequestException('updatedByUserId phải là string');
    }

    const product = repo.create(dto);
    const saveEntity = await repo.save(product);
    return {
      message: 'Thêm danh mục mới thành công',
      data: saveEntity,
    };
  }

  async findById(storeId: string, categoryId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({
      where: {
        category_id: categoryId,
        is_deleted: false,
        is_active: true,
      },
    });
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false, is_active: true },
    });
  }

  async findOne(storeId: string, categoryId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.findOneBy({
      category_id: categoryId,
      is_deleted: false,
      is_active: true,
    });
  }

  async update(storeId: string, categoryId: string, dto: UpdateCategoryDto) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, categoryId);

    // Kiểm tra slug đã tồn tại chưa (unique, trừ chính nó)
    if (dto.slug && dto.slug !== entity.slug) {
      const existingSlug = await repo.findOne({
        where: { slug: dto.slug, is_deleted: false },
      });
      if (existingSlug) {
        throw new ConflictException(
          `❌ Slug "${dto.slug}" đã tồn tại, vui lòng chọn slug khác!`,
        );
      }
    }

    // Kiểm tra parentId tồn tại (nếu có và thay đổi)
    if (dto.parentId && dto.parentId !== entity.parent_id) {
      const parent = await repo.findOne({
        where: { category_id: dto.parentId, is_deleted: false },
      });
      if (!parent) {
        throw new NotFoundException(
          `❌ parentId "${dto.parentId}" không tồn tại hoặc đã bị xóa!`,
        );
      }
      // Kiểm tra vòng lặp parent (prevent circular reference)
      let currentParent: Category | null = parent;
      while (currentParent?.parent_id) {
        if (currentParent.parent_id === categoryId) {
          throw new BadRequestException('Không thể tạo vòng lặp cha-con!');
        }
        currentParent = await repo.findOne({
          where: { category_id: currentParent.parent_id, is_deleted: false },
        });
      }
    }

    // Validate image là JSON hợp lệ (nếu có)
    if (dto.image) {
      try {
        JSON.parse(dto.image);
      } catch {
        throw new BadRequestException('Trường image phải là JSON hợp lệ!');
      }
    }

    // Validate/mapping createdByUserId, updatedByUserId
    if (dto.createdByUserId && typeof dto.createdByUserId !== 'string') {
      throw new BadRequestException('createdByUserId phải là string');
    }
    if (dto.updatedByUserId && typeof dto.updatedByUserId !== 'string') {
      throw new BadRequestException('updatedByUserId phải là string');
    }

    // Cập nhật các trường cần thiết
    Object.assign(entity, dto);
    const updatedEntity = await repo.save(entity);
    return {
      message: 'Cập nhật danh mục thành công',
      data: updatedEntity,
    };
  }

  async remove(storeId: string, categoryId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, categoryId);

    // Không cho xóa nếu còn danh mục con
    const child = await repo.findOne({
      where: { parent_id: categoryId, is_deleted: false },
    });
    if (child) {
      throw new BadRequestException(
        'Không thể xóa danh mục cha khi còn danh mục con!',
      );
    }

    // Đánh dấu là đã xóa thay vì xóa thực sự
    entity.is_deleted = true;
    await repo.save(entity);
    return {
      message: 'Xóa danh mục thành công',
      data: null,
    };
  }

  async restore(storeId: string, categoryId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({
      where: { category_id: categoryId, is_deleted: true },
    });
    if (!entity) {
      throw new NotFoundException(
        'Danh mục không tồn tại hoặc chưa bị xóa mềm',
      );
    }
    entity.is_deleted = false;
    await repo.save(entity);
    return {
      message: 'Khôi phục danh mục thành công',
      data: entity,
    };
  }

  async findByParent(storeId: string, parentId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { parent_id: parentId, is_deleted: false, is_active: true },
    });
  }

  async getCategoryTree(storeId: string) {
    const repo = await this.getRepo(storeId);
    const categories = await repo.find({
      where: { is_deleted: false, is_active: true },
    });
    // Xây dựng cây danh mục lồng nhau
    type CategoryWithChildren = Category & { children: CategoryWithChildren[] };
    const map = new Map<string, CategoryWithChildren>();
    categories.forEach((cat) =>
      map.set(cat.category_id, { ...cat, children: [] }),
    );
    const tree: CategoryWithChildren[] = [];
    map.forEach((cat) => {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(cat);
      } else {
        tree.push(cat);
      }
    });
    return tree;
  }
}
