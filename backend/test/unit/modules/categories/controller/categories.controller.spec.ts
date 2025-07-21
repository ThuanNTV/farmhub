import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from 'src/modules/categories/controller/categories.controller';
import { CategoriesService } from 'src/modules/categories/service/categories.service';
import { CreateCategoryDto } from 'src/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/categories/dto/update-category.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';

const storeId = 'store-123';
const categoryId = 'cat-001';
const parentId = 'parent-001';

const mockCategory = {
  category_id: categoryId,
  name: 'Test Category',
  slug: 'test-category',
  description: 'desc',
  parent_id: parentId,
  image: '{}',
  display_order: 1,
  is_active: true,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by_user_id: 'user-1',
  updated_by_user_id: 'user-1',
};

const mockService = {
  createCategory: jest
    .fn()
    .mockResolvedValue({ message: 'ok', data: mockCategory }),
  findAll: jest.fn().mockResolvedValue([mockCategory]),
  findOne: jest.fn().mockResolvedValue(mockCategory),
  update: jest
    .fn()
    .mockResolvedValue({ message: 'updated', data: mockCategory }),
  remove: jest.fn().mockResolvedValue({ message: 'deleted', data: null }),
  restore: jest
    .fn()
    .mockResolvedValue({ message: 'restored', data: mockCategory }),
  findByParent: jest.fn().mockResolvedValue([mockCategory]),
  getCategoryTree: jest.fn().mockResolvedValue([mockCategory]),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockService },
        {
          provide: EnhancedAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: PermissionGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuditInterceptor,
          useValue: {
            intercept: jest.fn().mockImplementation((_, next) => next.handle()),
          },
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideInterceptor(AuditInterceptor)
      .useValue({
        intercept: jest.fn().mockImplementation((_, next) => next.handle()),
      })
      .compile();
    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create gọi service và trả về dữ liệu', async () => {
    const dto: CreateCategoryDto = {
      categoryId,
      name: 'Test Category',
      slug: 'test-category',
    } as any;
    // Thêm mockResolvedValue cho tất cả các phương thức được sử dụng
    mockService.createCategory.mockResolvedValue({
      message: 'ok',
      data: mockCategory,
    });
    mockService.findAll.mockResolvedValue([mockCategory]);
    mockService.findOne.mockResolvedValue(mockCategory);
    mockService.update.mockResolvedValue({ message: 'ok', data: mockCategory });
    mockService.remove.mockResolvedValue({ message: 'ok' });
    mockService.restore.mockResolvedValue({
      message: 'ok',
      data: mockCategory,
    });
    mockService.findByParent.mockResolvedValue([mockCategory]);
    mockService.getCategoryTree.mockResolvedValue([]);

    const result = await controller.create(storeId, dto);
    expect(mockService.createCategory).toHaveBeenCalledWith(storeId, dto);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('data');
  });

  it('findAll gọi service và trả về danh sách', async () => {
    const result = await controller.findAll(storeId);
    expect(mockService.findAll).toHaveBeenCalledWith(storeId);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('findOne gọi service và trả về category', async () => {
    const result = await controller.findOne(storeId, categoryId);
    expect(mockService.findOne).toHaveBeenCalledWith(storeId, categoryId);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('category_id');
  });

  it('update gọi service và trả về dữ liệu', async () => {
    const dto: UpdateCategoryDto = { name: 'Updated' } as any;
    const result = await controller.update(storeId, categoryId, dto);
    expect(mockService.update).toHaveBeenCalledWith(storeId, categoryId, dto);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
  });

  it('remove gọi service và trả về dữ liệu', async () => {
    const result = await controller.remove(storeId, categoryId);
    expect(mockService.remove).toHaveBeenCalledWith(storeId, categoryId);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
  });

  it('restore gọi service và trả về dữ liệu', async () => {
    const result = await controller.restore(storeId, categoryId);
    expect(mockService.restore).toHaveBeenCalledWith(storeId, categoryId);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
  });

  it('findByParent gọi service và trả về danh sách', async () => {
    const result = await controller.findByParent(storeId, parentId);
    expect(mockService.findByParent).toHaveBeenCalledWith(storeId, parentId);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getCategoryTree gọi service và trả về tree', async () => {
    mockService.getCategoryTree.mockResolvedValue([]);
    const result = await controller.getCategoryTree(storeId);
    expect(mockService.getCategoryTree).toHaveBeenCalledWith(storeId);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
