import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../../src/modules/products/service/products.service';
import { Product } from '../../../src/entities/tenant/product.entity';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { CreateProductDto } from '../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../src/modules/products/dto/update-product.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: jest.Mocked<any>;

  const mockProduct: Product = {
    product_id: '123e4567-e89b-12d3-a456-426614174000',
    product_code: 'TEST001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Product Description',
    category_id: '123e4567-e89b-12d3-a456-426614174001',
    brand: 'Test Brand',
    unit_id: '123e4567-e89b-12d3-a456-426614174002',
    price_retail: 100.0,
    price_wholesale: 80.0,
    credit_price: 120.0,
    cost_price: 60.0,
    barcode: '1234567890123',
    stock: 50,
    min_stock_level: 10,
    images: '{"url": "test-image.jpg"}',
    specs: '{"color": "red", "size": "M"}',
    warranty_info: '1 year warranty',
    supplier_id: '123e4567-e89b-12d3-a456-426614174003',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by_user_id: '123e4567-e89b-12d3-a456-426614174004',
    updated_by_user_id: '123e4567-e89b-12d3-a456-426614174004',
    getUnit: async () => null,
    getCreatedByUser: async () => null,
    getUpdatedByUser: async () => null,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    // Setup default mocks
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      isInitialized: true,
    } as any;
    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource as DataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      productCode: 'TEST001',
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test Product Description',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      brand: 'Test Brand',
      unitId: '123e4567-e89b-12d3-a456-426614174002',
      priceRetail: 100.0,
      priceWholesale: 80.0,
      creditPrice: 120.0,
      costPrice: 60.0,
      barcode: '1234567890123',
      stock: 50,
      minStockLevel: 10,
      images: '{"url": "test-image.jpg"}',
      specs: '{"color": "red", "size": "M"}',
      warrantyInfo: '1 year warranty',
      supplierId: '123e4567-e89b-12d3-a456-426614174003',
      isActive: true,
      isDeleted: false,
    };

    it('should create a product successfully', async () => {
      const storeId = 'store-123';

      // Mock findById to return null (product doesn't exist)
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      // Mock findByproductCode to return null (product code doesn't exist)
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock repository methods
      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(storeId, createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw error if product with same ID already exists', async () => {
      const storeId = 'store-123';

      jest.spyOn(service, 'findById').mockResolvedValue(mockProduct);

      await expect(
        service.createProduct(storeId, createProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if product with same product code already exists', async () => {
      const storeId = 'store-123';

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(mockProduct);

      await expect(
        service.createProduct(storeId, createProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findById', () => {
    it('should return product by ID', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findById(storeId, productId);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        product_id: productId,
        is_deleted: false,
        is_active: true,
      });
    });

    it('should return null if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findById(storeId, productId);

      expect(result).toBeNull();
    });
  });

  describe('findByproductCode', () => {
    it('should return product by product code', async () => {
      const storeId = 'store-123';
      const productCode = 'TEST001';

      mockRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findByproductCode(storeId, productCode);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        product_code: productCode,
        is_deleted: false,
        is_active: true,
      });
    });

    it('should return null if product code not found', async () => {
      const storeId = 'store-123';
      const productCode = 'NONEXISTENT';

      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findByproductCode(storeId, productCode);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return product by ID', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findOne(storeId, productId);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        product_id: productId,
        is_deleted: false,
        is_active: true,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(storeId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active products', async () => {
      const storeId = 'store-123';
      const products = [mockProduct];

      mockRepository.find.mockResolvedValue(products);

      const result = await service.findAll(storeId);

      expect(result).toEqual(products);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false, is_active: true },
      });
    });

    it('should return empty array when no products exist', async () => {
      const storeId = 'store-123';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should soft delete product successfully', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      jest.spyOn(service, 'findOneProduc').mockResolvedValue({
        repo: mockRepository,
        product: mockProduct,
      });
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.remove(storeId, productId);

      expect(result).toEqual({
        message: `✅ Sản phẩm với ID "${productId}" đã được xóa`,
        data: null,
      });
      expect(mockProduct.is_deleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      jest
        .spyOn(service, 'findOneProduc')
        .mockRejectedValue(
          new NotFoundException(
            `❌ Không tìm thấy sản phẩm với ID "${productId}"`,
          ),
        );

      await expect(service.remove(storeId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore deleted product successfully', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedProduct = { ...mockProduct, is_deleted: true };

      mockRepository.findOne.mockResolvedValue(deletedProduct);
      mockRepository.save.mockResolvedValue(deletedProduct);

      const result = await service.restore(storeId, productId);

      expect(result).toEqual({
        message: 'Khôi phục sản phẩm thành công',
        data: deletedProduct,
      });
      expect(deletedProduct.is_deleted).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith(deletedProduct);
    });

    it('should throw error if product not found or not deleted', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(storeId, productId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update product successfully with productCode validation', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        productCode: 'UPDATED001',
      };

      const updatedProduct = { ...mockProduct, ...updateProductDto };

      jest.spyOn(service, 'findOneProduc').mockResolvedValue({
        repo: mockRepository,
        product: mockProduct,
      });
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockRepository.merge.mockReturnValue(updatedProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(storeId, productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockProduct,
        updateProductDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProduct);
    });

    it('should throw error if productCode already exists for different product', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        productCode: 'EXISTING001',
      };

      const existingProduct = { ...mockProduct, product_id: 'different-id' };

      jest.spyOn(service, 'findOneProduc').mockResolvedValue({
        repo: mockRepository,
        product: mockProduct,
      });
      jest
        .spyOn(service, 'findByproductCode')
        .mockResolvedValue(existingProduct);

      await expect(
        service.update(storeId, productId, updateProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      const storeId = 'store-123';
      mockRepository.findOneBy.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findById(storeId, 'test-id')).rejects.toThrow();
    });

    it('should handle repository save errors', async () => {
      const storeId = 'store-123';
      mockRepository.findOneBy.mockResolvedValue(mockProduct);
      mockRepository.save.mockRejectedValue(new Error('Save operation failed'));

      await expect(service.remove(storeId, 'test-id')).rejects.toThrow();
    });
  });

  describe('validation scenarios', () => {
    it('should handle duplicate product code during creation', async () => {
      const storeId = 'store-123';
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'DUPLICATE001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Product Description',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(mockProduct);

      await expect(
        service.createProduct(storeId, createProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle invalid product ID format', async () => {
      const storeId = 'store-123';
      const invalidId = 'invalid-id';
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(storeId, invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('product management scenarios', () => {
    it('should handle product activation/deactivation', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateProductDto = {
        isActive: false,
      };

      const deactivatedProduct = { ...mockProduct, is_active: false };

      mockRepository.findOneBy.mockResolvedValue(mockProduct);
      mockRepository.merge.mockReturnValue(deactivatedProduct);
      mockRepository.save.mockResolvedValue(deactivatedProduct);

      const result = await service.update(storeId, productId, updateDto);

      expect(result.is_active).toBe(false);
    });

    it('should handle stock updates', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateProductDto = {
        stock: 100,
        minStockLevel: 20,
      };

      const updatedProduct = {
        ...mockProduct,
        stock: 100,
        min_stock_level: 20,
      };

      mockRepository.findOneBy.mockResolvedValue(mockProduct);
      mockRepository.merge.mockReturnValue(updatedProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(storeId, productId, updateDto);

      expect(result.stock).toBe(100);
      expect(result.min_stock_level).toBe(20);
    });

    it('should handle price updates', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateProductDto = {
        priceRetail: 150.0,
        priceWholesale: 120.0,
        creditPrice: 180.0,
        costPrice: 90.0,
      };

      const updatedProduct = {
        ...mockProduct,
        price_retail: 150.0,
        price_wholesale: 120.0,
        credit_price: 180.0,
        cost_price: 90.0,
      };

      mockRepository.findOneBy.mockResolvedValue(mockProduct);
      mockRepository.merge.mockReturnValue(updatedProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(storeId, productId, updateDto);

      expect(result.price_retail).toBe(150.0);
      expect(result.price_wholesale).toBe(120.0);
      expect(result.credit_price).toBe(180.0);
      expect(result.cost_price).toBe(90.0);
    });
  });
});
