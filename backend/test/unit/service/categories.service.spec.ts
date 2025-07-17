import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../../../src/modules/categories/service/categories.service';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { Category } from '../../../src/entities/tenant/category.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../../../src/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../../../src/modules/categories/dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockRepo: any;
  let mockTenantDS: any;
  const storeId = 'store-123';
  const categoryId = 'cat-001';
  const parentId = 'parent-001';

  const mockCategory: Category = {
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

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn().mockReturnValue(mockCategory),
      save: jest.fn().mockResolvedValue(mockCategory),
    };
    mockTenantDS = {
      getRepo: jest.fn().mockResolvedValue(mockRepo),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: TenantDataSourceService, useValue: mockTenantDS },
      ],
    }).compile();
    service = module.get<CategoriesService>(CategoriesService);
    // Gán lại getRepo cho service (vì extends TenantBaseService)
    jest
      .spyOn(service as any, 'getRepo')
      .mockImplementation(() => Promise.resolve(mockRepo));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createCategory thành công', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    mockRepo.create.mockReturnValueOnce(mockCategory);
    mockRepo.save.mockResolvedValueOnce(mockCategory);
    const dto: CreateCategoryDto = {
      categoryId,
      name: 'Test',
      slug: 'slug',
    } as any;
    const result = await service.createCategory(storeId, dto);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('data');
  });

  it('createCategory conflict categoryId', async () => {
    mockRepo.findOne.mockResolvedValueOnce(mockCategory); // findById
    await expect(
      service.createCategory(storeId, {
        categoryId,
        name: 'Test',
        slug: 'slug',
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('createCategory conflict slug', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(mockCategory); // slug
    await expect(
      service.createCategory(storeId, {
        categoryId,
        name: 'Test',
        slug: 'slug',
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('createCategory parentId không tồn tại', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    mockRepo.findOne.mockResolvedValueOnce(null); // parentId
    const dto = {
      categoryId,
      name: 'Test',
      slug: 'slug',
      parentId: 'p1',
    } as any;
    await expect(service.createCategory(storeId, dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('createCategory parentId vòng lặp cha-con', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    mockRepo.findOne.mockResolvedValueOnce({ parent_id: categoryId }); // parent
    const dto = {
      categoryId,
      name: 'Test',
      slug: 'slug',
      parentId: 'p1',
    } as any;
    await expect(service.createCategory(storeId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('createCategory image không hợp lệ', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    const dto = {
      categoryId,
      name: 'Test',
      slug: 'slug',
      image: 'not-json',
    } as any;
    await expect(service.createCategory(storeId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('createCategory createdByUserId không phải string', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // findById
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    const dto = {
      categoryId,
      name: 'Test',
      slug: 'slug',
      createdByUserId: 123,
    } as any;
    await expect(service.createCategory(storeId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('findAll trả về danh sách', async () => {
    mockRepo.find.mockResolvedValue([mockCategory]);
    const result = await service.findAll(storeId);
    expect(Array.isArray(result)).toBe(true);
  });

  it('findOne trả về category', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockCategory);
    const result = await service.findOne(storeId, categoryId);
    expect(result).toHaveProperty('category_id');
  });

  it('update thành công', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    mockRepo.save.mockResolvedValueOnce(mockCategory);
    const dto: UpdateCategoryDto = { name: 'Updated' } as any;
    const result = await service.update(storeId, categoryId, dto);
    expect(result).toHaveProperty('message');
  });

  it('update conflict slug', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce({}); // slug đã tồn tại
    const dto = { slug: 'slug' } as any;
    await expect(service.update(storeId, categoryId, dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('update parentId không tồn tại', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    mockRepo.findOne.mockResolvedValueOnce(null); // parentId
    const dto = { parentId: 'p1' } as any;
    await expect(service.update(storeId, categoryId, dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  const makeLoop = () => {
    mockRepo.findOne
      .mockReset()
      .mockImplementationOnce(() => ({ parent_id: categoryId })) // parent (tạo vòng lặp)
      .mockImplementationOnce(() => null); // kết thúc loop
  };

  it('update parentId vòng lặp cha-con', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue({
      ...mockCategory,
      parent_id: 'old-parent',
      slug: 'slug', // giữ nguyên slug để không check slug
    });
    makeLoop();
    const dto = { parentId: 'p1', slug: 'slug' } as any;
    await expect(service.update(storeId, categoryId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('update image không hợp lệ', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    const dto = { image: 'not-json' } as any;
    await expect(service.update(storeId, categoryId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('update createdByUserId không phải string', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce(null); // slug
    const dto = { createdByUserId: 123 } as any;
    await expect(service.update(storeId, categoryId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('remove thành công', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce(null); // child
    mockRepo.save.mockResolvedValueOnce(mockCategory);
    const result = await service.remove(storeId, categoryId);
    expect(result).toHaveProperty('message');
  });

  it('remove còn danh mục con', async () => {
    (service as any).findByIdOrFail = jest.fn().mockResolvedValue(mockCategory);
    mockRepo.findOne.mockResolvedValueOnce({}); // child tồn tại
    await expect(service.remove(storeId, categoryId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('restore thành công', async () => {
    mockRepo.findOne.mockResolvedValueOnce(mockCategory);
    mockRepo.save.mockResolvedValueOnce(mockCategory);
    const result = await service.restore(storeId, categoryId);
    expect(result).toHaveProperty('message');
  });

  it('findByParent trả về danh sách', async () => {
    mockRepo.find.mockResolvedValue([mockCategory]);
    const result = await service.findByParent(storeId, parentId);
    expect(Array.isArray(result)).toBe(true);
  });

  it('getCategoryTree trả về tree', async () => {
    mockRepo.find.mockResolvedValue([mockCategory]);
    const result = await service.getCategoryTree(storeId);
    expect(Array.isArray(result)).toBe(true);
  });
});
