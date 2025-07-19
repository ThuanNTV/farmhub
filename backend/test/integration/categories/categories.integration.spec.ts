import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../../../src/entities/tenant/category.entity';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { InternalServerErrorException } from '@nestjs/common';
import { CategoriesService } from '../../../src/modules/categories/service/categories.service';
import { CategoriesModule } from '../../../src/modules/categories/categories.module';
import { TenantDatabaseModule } from '../../../src/config/db/dbtenant/tenant-database.module';

describe('CategoriesService Integration', () => {
  let app: INestApplication;
  let categoriesService: CategoriesService;
  let tenantDataSourceService: TenantDataSourceService;
  let categoryRepository: Repository<Category>;

  const testStoreId = 'test-store-123';
  const testCategoryData = {
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    categoryName: 'Integration Test Category',
    slug: 'integration-test-category',
    description: 'Integration Test Category Description',
    parentId: null,
    image: '{"url": "test.jpg"}',
    sortOrder: 1,
    createdByUserId: '123e4567-e89b-12d3-a456-426614174001',
    updatedByUserId: '123e4567-e89b-12d3-a456-426614174001',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantDatabaseModule, CategoriesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    categoriesService = moduleFixture.get<CategoriesService>(CategoriesService);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    // Get repository for the test store
    const dataSource =
      await tenantDataSourceService.getTenantDataSource(testStoreId);
    categoryRepository = dataSource.getRepository(Category);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await categoryRepository.delete({
      category_id: testCategoryData.categoryId,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      // Create new category
      const result = await categoriesService.createCategory(
        testStoreId,
        testCategoryData,
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.message).toBe('Thêm danh mục mới thành công');
      expect(result.data).toBeDefined();
      expect(result.data.category_id).toBe(testCategoryData.categoryId);
      expect(result.data.category_name).toBe(testCategoryData.categoryName);
      expect(result.data.slug).toBe(testCategoryData.slug);
      expect(result.data.description).toBe(testCategoryData.description);

      // Verify category exists in database
      const dbCategory = await categoryRepository.findOneBy({
        category_id: testCategoryData.categoryId,
      });
      expect(dbCategory).not.toBeNull();
      expect(dbCategory!.category_name).toBe(testCategoryData.categoryName);
      expect(dbCategory!.slug).toBe(testCategoryData.slug);
      expect(dbCategory!.is_active).toBe(true);
      expect(dbCategory!.is_deleted).toBe(false);
    });

    it('should fail to create category with duplicate ID', async () => {
      // Create first category
      await categoriesService.createCategory(testStoreId, testCategoryData);

      // Try to create with same ID
      await expect(
        categoriesService.createCategory(testStoreId, testCategoryData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create category with duplicate slug', async () => {
      // Create first category
      await categoriesService.createCategory(testStoreId, testCategoryData);

      // Try to create with same slug but different ID
      const duplicateSlugData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
      };

      await expect(
        categoriesService.createCategory(testStoreId, duplicateSlugData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create category with invalid parent ID', async () => {
      const invalidParentData = {
        ...testCategoryData,
        parentId: 'invalid-parent-id',
      };

      await expect(
        categoriesService.createCategory(testStoreId, invalidParentData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create category with invalid JSON image', async () => {
      const invalidImageData = {
        ...testCategoryData,
        image: 'invalid-json',
      };

      await expect(
        categoriesService.createCategory(testStoreId, invalidImageData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should create category with valid parent ID', async () => {
      // Create parent category first
      const parentCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Parent Category',
        slug: 'parent-category',
      };
      await categoriesService.createCategory(testStoreId, parentCategoryData);

      // Create child category
      const childCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Child Category',
        slug: 'child-category',
        parentId: parentCategoryData.categoryId,
      };

      const result = await categoriesService.createCategory(
        testStoreId,
        childCategoryData,
      );

      expect(result).toBeDefined();
      expect(result.data.parent_id).toBe(parentCategoryData.categoryId);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test category
      await categoriesService.createCategory(testStoreId, testCategoryData);
    });

    it('should return all active categories', async () => {
      const categories = await categoriesService.findAll(testStoreId);

      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Check if our test category is in the list
      const testCategory = categories.find(
        (c) => c.category_id === testCategoryData.categoryId,
      );
      expect(testCategory).toBeDefined();
      expect(testCategory!.category_name).toBe(testCategoryData.categoryName);
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      // Create test category
      await categoriesService.createCategory(testStoreId, testCategoryData);
    });

    it('should return category by ID', async () => {
      const category = await categoriesService.findOne(
        testStoreId,
        testCategoryData.categoryId,
      );

      expect(category).toBeDefined();
      expect(category.category_id).toBe(testCategoryData.categoryId);
      expect(category.category_name).toBe(testCategoryData.categoryName);
      expect(category.slug).toBe(testCategoryData.slug);
    });

    it('should return null for non-existent category', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const category = await categoriesService.findOne(
        testStoreId,
        nonExistentId,
      );

      expect(category).toBeNull();
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      // Create test category
      await categoriesService.createCategory(testStoreId, testCategoryData);
    });

    it('should return category by ID', async () => {
      const category = await categoriesService.findById(
        testStoreId,
        testCategoryData.categoryId,
      );

      expect(category).toBeDefined();
      expect(category!.category_id).toBe(testCategoryData.categoryId);
      expect(category!.category_name).toBe(testCategoryData.categoryName);
    });

    it('should return null for non-existent category', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const category = await categoriesService.findById(
        testStoreId,
        nonExistentId,
      );

      expect(category).toBeNull();
    });
  });

  describe('update', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Create test category
      const result = await categoriesService.createCategory(
        testStoreId,
        testCategoryData,
      );
      categoryId = result.data.category_id;
    });

    it('should update category successfully', async () => {
      const updateData = {
        categoryName: 'Updated Integration Test Category',
        description: 'Updated Integration Test Category Description',
        sortOrder: 2,
        slug: 'updated-integration-test-category',
      };

      const result = await categoriesService.update(
        testStoreId,
        categoryId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Cập nhật danh mục thành công');

      // Verify in database
      const updatedCategory = await categoryRepository.findOneBy({
        category_id: categoryId,
      });
      expect(updatedCategory).not.toBeNull();
      expect(updatedCategory!.category_name).toBe(updateData.categoryName);
      expect(updatedCategory!.description).toBe(updateData.description);
      expect(updatedCategory!.sort_order).toBe(updateData.sortOrder);
      expect(updatedCategory!.slug).toBe(updateData.slug);
    });

    it('should fail to update with duplicate slug', async () => {
      // Create another category with different slug
      const secondCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Second Category',
        slug: 'second-category',
      };
      await categoriesService.createCategory(testStoreId, secondCategoryData);

      // Try to update first category with second category's slug
      const updateData = {
        slug: 'second-category',
      };

      await expect(
        categoriesService.update(testStoreId, categoryId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should allow update with same slug for same category', async () => {
      const updateData = {
        slug: testCategoryData.slug, // Same slug
        categoryName: 'Updated Category',
      };

      const result = await categoriesService.update(
        testStoreId,
        categoryId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Cập nhật danh mục thành công');
    });

    it('should fail to update with invalid parent ID', async () => {
      const updateData = {
        parentId: 'invalid-parent-id',
      };

      await expect(
        categoriesService.update(testStoreId, categoryId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to update with invalid JSON image', async () => {
      const updateData = {
        image: 'invalid-json',
      };

      await expect(
        categoriesService.update(testStoreId, categoryId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Create test category
      const result = await categoriesService.createCategory(
        testStoreId,
        testCategoryData,
      );
      categoryId = result.data.category_id;
    });

    it('should soft delete category successfully', async () => {
      const result = await categoriesService.remove(testStoreId, categoryId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Xóa danh mục thành công');
      expect(result.data).toBeNull();

      // Verify category is soft deleted in database
      const deletedCategory = await categoryRepository.findOneBy({
        category_id: categoryId,
      });
      expect(deletedCategory).not.toBeNull();
      expect(deletedCategory!.is_deleted).toBe(true);

      // Verify category is not returned by findOne (active only)
      const foundCategory = await categoriesService.findOne(
        testStoreId,
        categoryId,
      );
      expect(foundCategory).toBeNull();
    });

    it('should fail to delete category with children', async () => {
      // Create child category
      const childCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Child Category',
        slug: 'child-category',
        parentId: categoryId,
      };
      await categoriesService.createCategory(testStoreId, childCategoryData);

      // Try to delete parent category
      await expect(
        categoriesService.remove(testStoreId, categoryId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('restore', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Create and delete test category
      const result = await categoriesService.createCategory(
        testStoreId,
        testCategoryData,
      );
      categoryId = result.data.category_id;
      await categoriesService.remove(testStoreId, categoryId);
    });

    it('should restore category successfully', async () => {
      const result = await categoriesService.restore(testStoreId, categoryId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Khôi phục danh mục thành công');
      expect(result.data).toBeDefined();

      // Verify category is restored in database
      const restoredCategory = await categoryRepository.findOneBy({
        category_id: categoryId,
      });
      expect(restoredCategory).not.toBeNull();
      expect(restoredCategory!.is_deleted).toBe(false);

      // Verify category can be found again
      const foundCategory = await categoriesService.findOne(
        testStoreId,
        categoryId,
      );
      expect(foundCategory).toBeDefined();
      expect(foundCategory!.category_id).toBe(categoryId);
    });

    it('should throw error if category not found or not deleted', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        categoriesService.restore(testStoreId, nonExistentId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByParent', () => {
    let parentCategoryId: string;

    beforeEach(async () => {
      // Create parent category
      const parentCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Parent Category',
        slug: 'parent-category',
      };
      const parentResult = await categoriesService.createCategory(
        testStoreId,
        parentCategoryData,
      );
      parentCategoryId = parentResult.data.category_id;

      // Create child categories
      const childCategoryData1 = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Child Category 1',
        slug: 'child-category-1',
        parentId: parentCategoryId,
      };
      const childCategoryData2 = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174003',
        categoryName: 'Child Category 2',
        slug: 'child-category-2',
        parentId: parentCategoryId,
      };
      await categoriesService.createCategory(testStoreId, childCategoryData1);
      await categoriesService.createCategory(testStoreId, childCategoryData2);
    });

    it('should return categories by parent ID', async () => {
      const childCategories = await categoriesService.findByParent(
        testStoreId,
        parentCategoryId,
      );

      expect(childCategories).toBeDefined();
      expect(Array.isArray(childCategories)).toBe(true);
      expect(childCategories.length).toBe(2);

      // All returned categories should have the correct parent ID
      childCategories.forEach((category) => {
        expect(category.parent_id).toBe(parentCategoryId);
      });
    });

    it('should return empty array for parent with no children', async () => {
      const childCategories = await categoriesService.findByParent(
        testStoreId,
        '123e4567-e89b-12d3-a456-426614174999',
      );

      expect(childCategories).toBeDefined();
      expect(Array.isArray(childCategories)).toBe(true);
      expect(childCategories.length).toBe(0);
    });
  });

  describe('getCategoryTree', () => {
    beforeEach(async () => {
      // Create parent category
      const parentCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Parent Category',
        slug: 'parent-category',
      };
      await categoriesService.createCategory(testStoreId, parentCategoryData);

      // Create child categories
      const childCategoryData1 = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Child Category 1',
        slug: 'child-category-1',
        parentId: parentCategoryData.categoryId,
      };
      const childCategoryData2 = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174003',
        categoryName: 'Child Category 2',
        slug: 'child-category-2',
        parentId: parentCategoryData.categoryId,
      };
      await categoriesService.createCategory(testStoreId, childCategoryData1);
      await categoriesService.createCategory(testStoreId, childCategoryData2);
    });

    it('should return category tree structure', async () => {
      const categoryTree = await categoriesService.getCategoryTree(testStoreId);

      expect(categoryTree).toBeDefined();
      expect(Array.isArray(categoryTree)).toBe(true);
      expect(categoryTree.length).toBeGreaterThan(0);

      // Check if tree structure is correct
      const parentCategory = categoryTree.find(
        (c) => c.category_id === '123e4567-e89b-12d3-a456-426614174001',
      );
      expect(parentCategory).toBeDefined();
      expect(parentCategory!.children).toBeDefined();
      expect(parentCategory!.children.length).toBe(2);
    });
  });

  describe('slug uniqueness', () => {
    it('should enforce unique slugs across different categories', async () => {
      // Create first category
      await categoriesService.createCategory(testStoreId, testCategoryData);

      // Try to create second category with same slug
      const secondCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
      };

      await expect(
        categoriesService.createCategory(testStoreId, secondCategoryData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should allow same slug after original category is deleted', async () => {
      // Create first category
      const firstCategory = await categoriesService.createCategory(
        testStoreId,
        testCategoryData,
      );

      // Delete first category
      await categoriesService.remove(
        testStoreId,
        firstCategory.data.category_id,
      );

      // Create second category with same slug
      const secondCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
      };

      const secondCategory = await categoriesService.createCategory(
        testStoreId,
        secondCategoryData,
      );

      expect(secondCategory).toBeDefined();
      expect(secondCategory.data.slug).toBe(testCategoryData.slug);
    });
  });

  describe('parent-child relationships', () => {
    it('should prevent circular parent references', async () => {
      // Create parent category
      const parentCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Parent Category',
        slug: 'parent-category',
      };
      await categoriesService.createCategory(testStoreId, parentCategoryData);

      // Create child category
      const childCategoryData = {
        ...testCategoryData,
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        categoryName: 'Child Category',
        slug: 'child-category',
        parentId: parentCategoryData.categoryId,
      };
      await categoriesService.createCategory(testStoreId, childCategoryData);

      // Try to make parent a child of its child (circular reference)
      const updateData = {
        parentId: childCategoryData.categoryId,
      };

      await expect(
        categoriesService.update(
          testStoreId,
          parentCategoryData.categoryId,
          updateData,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
