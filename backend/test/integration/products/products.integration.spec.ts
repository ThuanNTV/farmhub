import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductsService } from '../../../src/modules/products/service/products.service';
import { Product } from '../../../src/entities/tenant/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantDatabaseModule } from '../../../src/config/db/dbtenant/tenant-database.module';
import { ProductsModule } from '../../../src/modules/products.module';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ProductsService Integration', () => {
  let app: INestApplication;
  let productsService: ProductsService;
  let tenantDataSourceService: TenantDataSourceService;
  let productRepository: Repository<Product>;

  const testStoreId = 'test-store-123';
  const testProductData = {
    productId: '123e4567-e89b-12d3-a456-426614174000',
    productName: 'Integration Test Product',
    productCode: 'INTEGRATION001',
    description: 'Integration Test Product Description',
    price: 100.0,
    costPrice: 80.0,
    categoryId: '123e4567-e89b-12d3-a456-426614174001',
    unitId: '123e4567-e89b-12d3-a456-426614174002',
    supplierId: '123e4567-e89b-12d3-a456-426614174003',
    sku: 'SKU001',
    barcode: '1234567890123',
    weight: 1.5,
    dimensions: '10x5x2',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantDatabaseModule, ProductsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productsService = moduleFixture.get<ProductsService>(ProductsService);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    // Get repository for the test store
    const dataSource =
      await tenantDataSourceService.getTenantDataSource(testStoreId);
    productRepository = dataSource.getRepository(Product);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await productRepository.delete({ product_id: testProductData.productId });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Create new product
      const result = await productsService.createProduct(
        testStoreId,
        testProductData,
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.product_id).toBe(testProductData.productId);
      expect(result.product_name).toBe(testProductData.productName);
      expect(result.product_code).toBe(testProductData.productCode);
      expect(result.description).toBe(testProductData.description);
      expect(result.price).toBe(testProductData.price);
      expect(result.cost_price).toBe(testProductData.costPrice);

      // Verify product exists in database
      const dbProduct = await productRepository.findOneBy({
        product_id: testProductData.productId,
      });
      expect(dbProduct).not.toBeNull();
      expect(dbProduct!.product_name).toBe(testProductData.productName);
      expect(dbProduct!.product_code).toBe(testProductData.productCode);
      expect(dbProduct!.is_active).toBe(true);
      expect(dbProduct!.is_deleted).toBe(false);
    });

    it('should fail to create product with duplicate ID', async () => {
      // Create first product
      await productsService.createProduct(testStoreId, testProductData);

      // Try to create with same ID
      await expect(
        productsService.createProduct(testStoreId, testProductData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create product with duplicate product code', async () => {
      // Create first product
      await productsService.createProduct(testStoreId, testProductData);

      // Try to create with same product code but different ID
      const duplicateCodeData = {
        ...testProductData,
        productId: '123e4567-e89b-12d3-a456-426614174002',
      };

      await expect(
        productsService.createProduct(testStoreId, duplicateCodeData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test product
      await productsService.createProduct(testStoreId, testProductData);
    });

    it('should return all active products', async () => {
      const products = await productsService.findAll(testStoreId);

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);

      // Check if our test product is in the list
      const testProduct = products.find(
        (p) => p.product_id === testProductData.productId,
      );
      expect(testProduct).toBeDefined();
      expect(testProduct!.product_name).toBe(testProductData.productName);
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      // Create test product
      await productsService.createProduct(testStoreId, testProductData);
    });

    it('should return product by ID', async () => {
      const product = await productsService.findOne(
        testStoreId,
        testProductData.productId,
      );

      expect(product).toBeDefined();
      expect(product.product_id).toBe(testProductData.productId);
      expect(product.product_name).toBe(testProductData.productName);
      expect(product.product_code).toBe(testProductData.productCode);
      expect(product.price).toBe(testProductData.price);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        productsService.findOne(testStoreId, nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      // Create test product
      await productsService.createProduct(testStoreId, testProductData);
    });

    it('should return product by ID', async () => {
      const product = await productsService.findById(
        testStoreId,
        testProductData.productId,
      );

      expect(product).toBeDefined();
      expect(product!.product_id).toBe(testProductData.productId);
      expect(product!.product_name).toBe(testProductData.productName);
    });

    it('should return null for non-existent product', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const product = await productsService.findById(
        testStoreId,
        nonExistentId,
      );

      expect(product).toBeNull();
    });
  });

  describe('findByproductCode', () => {
    beforeEach(async () => {
      // Create test product
      await productsService.createProduct(testStoreId, testProductData);
    });

    it('should return product by product code', async () => {
      const product = await productsService.findByproductCode(
        testStoreId,
        testProductData.productCode,
      );

      expect(product).toBeDefined();
      expect(product!.product_id).toBe(testProductData.productId);
      expect(product!.product_code).toBe(testProductData.productCode);
    });

    it('should return null for non-existent product code', async () => {
      const nonExistentCode = 'NONEXISTENT';

      const product = await productsService.findByproductCode(
        testStoreId,
        nonExistentCode,
      );

      expect(product).toBeNull();
    });
  });

  describe('update', () => {
    let productId: string;

    beforeEach(async () => {
      // Create test product
      const result = await productsService.createProduct(
        testStoreId,
        testProductData,
      );
      productId = result.product_id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        productName: 'Updated Integration Test Product',
        price: 150.0,
        description: 'Updated Integration Test Product Description',
        sku: 'SKU002',
      };

      const result = await productsService.update(
        testStoreId,
        productId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.product_id).toBe(productId);
      expect(result.product_name).toBe(updateData.productName);
      expect(result.price).toBe(updateData.price);
      expect(result.description).toBe(updateData.description);
      expect(result.sku).toBe(updateData.sku);

      // Verify in database
      const updatedProduct = await productRepository.findOneBy({
        product_id: productId,
      });
      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct!.product_name).toBe(updateData.productName);
      expect(updatedProduct!.price).toBe(updateData.price);
    });

    it('should fail to update with duplicate product code', async () => {
      // Create another product with different product code
      const secondProductData = {
        ...testProductData,
        productId: '123e4567-e89b-12d3-a456-426614174002',
        productCode: 'INTEGRATION002',
      };
      await productsService.createProduct(testStoreId, secondProductData);

      // Try to update first product with second product's code
      const updateData = {
        productCode: 'INTEGRATION002',
      };

      await expect(
        productsService.update(testStoreId, productId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should allow update with same product code for same product', async () => {
      const updateData = {
        productCode: testProductData.productCode, // Same code
        productName: 'Updated Product',
      };

      const result = await productsService.update(
        testStoreId,
        productId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.product_id).toBe(productId);
      expect(result.product_code).toBe(testProductData.productCode);
    });
  });

  describe('remove', () => {
    let productId: string;

    beforeEach(async () => {
      // Create test product
      const result = await productsService.createProduct(
        testStoreId,
        testProductData,
      );
      productId = result.product_id;
    });

    it('should soft delete product successfully', async () => {
      const result = await productsService.remove(testStoreId, productId);

      expect(result).toBeDefined();
      expect(result.message).toBe(
        `✅ Sản phẩm với ID "${productId}" đã được xóa`,
      );
      expect(result.data).toBeNull();

      // Verify product is soft deleted in database
      const deletedProduct = await productRepository.findOneBy({
        product_id: productId,
      });
      expect(deletedProduct).not.toBeNull();
      expect(deletedProduct!.is_deleted).toBe(true);

      // Verify product is not returned by findOne (active only)
      await expect(
        productsService.findOne(testStoreId, productId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    let productId: string;

    beforeEach(async () => {
      // Create and delete test product
      const result = await productsService.createProduct(
        testStoreId,
        testProductData,
      );
      productId = result.product_id;
      await productsService.remove(testStoreId, productId);
    });

    it('should restore product successfully', async () => {
      const result = await productsService.restore(testStoreId, productId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Khôi phục sản phẩm thành công');
      expect(result.data).toBeDefined();

      // Verify product is restored in database
      const restoredProduct = await productRepository.findOneBy({
        product_id: productId,
      });
      expect(restoredProduct).not.toBeNull();
      expect(restoredProduct!.is_deleted).toBe(false);

      // Verify product can be found again
      const foundProduct = await productsService.findOne(
        testStoreId,
        productId,
      );
      expect(foundProduct).toBeDefined();
      expect(foundProduct.product_id).toBe(productId);
    });

    it('should throw error if product not found or not deleted', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        productsService.restore(testStoreId, nonExistentId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('product code uniqueness', () => {
    it('should enforce unique product codes across different products', async () => {
      // Create first product
      await productsService.createProduct(testStoreId, testProductData);

      // Try to create second product with same code
      const secondProductData = {
        ...testProductData,
        productId: '123e4567-e89b-12d3-a456-426614174002',
      };

      await expect(
        productsService.createProduct(testStoreId, secondProductData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should allow same product code after original product is deleted', async () => {
      // Create first product
      const firstProduct = await productsService.createProduct(
        testStoreId,
        testProductData,
      );

      // Delete first product
      await productsService.remove(testStoreId, firstProduct.product_id);

      // Create second product with same code
      const secondProductData = {
        ...testProductData,
        productId: '123e4567-e89b-12d3-a456-426614174002',
      };

      const secondProduct = await productsService.createProduct(
        testStoreId,
        secondProductData,
      );

      expect(secondProduct).toBeDefined();
      expect(secondProduct.product_code).toBe(testProductData.productCode);
    });
  });

  describe('product data integrity', () => {
    it('should maintain data integrity during updates', async () => {
      // Create product
      const product = await productsService.createProduct(
        testStoreId,
        testProductData,
      );

      // Update multiple fields
      const updateData = {
        productName: 'Updated Name',
        price: 200.0,
        costPrice: 150.0,
        description: 'Updated description',
        sku: 'NEW-SKU',
        barcode: '9876543210987',
      };

      const updatedProduct = await productsService.update(
        testStoreId,
        product.product_id,
        updateData,
      );

      // Verify all fields are updated correctly
      expect(updatedProduct.product_name).toBe(updateData.productName);
      expect(updatedProduct.price).toBe(updateData.price);
      expect(updatedProduct.cost_price).toBe(updateData.costPrice);
      expect(updatedProduct.description).toBe(updateData.description);
      expect(updatedProduct.sku).toBe(updateData.sku);
      expect(updatedProduct.barcode).toBe(updateData.barcode);

      // Verify original fields that weren't updated remain unchanged
      expect(updatedProduct.product_id).toBe(testProductData.productId);
      expect(updatedProduct.product_code).toBe(testProductData.productCode);
      expect(updatedProduct.category_id).toBe(testProductData.categoryId);
    });
  });
});
