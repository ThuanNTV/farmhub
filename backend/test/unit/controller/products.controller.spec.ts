import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../src/modules/products/controller/products.controller';
import { ProductsService } from '../../../src/modules/products/service/products.service';
import { CreateProductDto } from '../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../src/modules/products/dto/update-product.dto';
import { Product } from '../../../src/entities/tenant/product.entity';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: jest.Mocked<ProductsService>;

  const mockProduct: Product = {
    product_id: '123e4567-e89b-12d3-a456-426614174000',
    product_code: 'SP001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product',
    category_id: '123e4567-e89b-12d3-a456-426614174001',
    category: undefined as any,
    brand: 'Test Brand',
    unit_id: '123e4567-e89b-12d3-a456-426614174002',
    price_retail: 100.0,
    price_wholesale: 80.0,
    credit_price: 110.0,
    cost_price: 60.0,
    barcode: '123456789012',
    stock: 50,
    min_stock_level: 10,
    images: 'image1.jpg,image2.jpg',
    specs: 'Specifications',
    warranty_info: '12 months',
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

  const storeId = 'store-123';

  beforeEach(async () => {
    mockProductsService = {
      createProduct: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      findById: jest.fn(),
      findByCategory: jest.fn(),
      findByBarcode: jest.fn(),
      updateStock: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      productCode: 'SP001',
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      brand: 'Test Brand',
      unitId: '123e4567-e89b-12d3-a456-426614174002',
      priceRetail: 100.0,
      priceWholesale: 80.0,
      creditPrice: 110.0,
      costPrice: 60.0,
      barcode: '123456789012',
      stock: 50,
      minStockLevel: 10,
      images: 'image1.jpg,image2.jpg',
      specs: 'Specifications',
      warrantyInfo: '12 months',
      supplierId: '123e4567-e89b-12d3-a456-426614174003',
      isActive: true,
      isDeleted: false,
    };

    it('should create a product successfully', async () => {
      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.create(storeId, createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.createProduct).toHaveBeenCalledWith(
        storeId,
        createProductDto,
      );
    });

    it('should handle service errors during creation', async () => {
      mockProductsService.createProduct.mockRejectedValue(
        new BadRequestException('Product code already exists'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle internal server errors', async () => {
      mockProductsService.createProduct.mockRejectedValue(
        new InternalServerErrorException('Database error'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(products);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty product list', async () => {
      mockProductsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle service errors', async () => {
      mockProductsService.findAll.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a product by ID', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(storeId, productId);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(
        storeId,
        productId,
      );
    });

    it('should handle product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.findOne(storeId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle invalid product ID format', async () => {
      const invalidId = 'invalid-id';
      mockProductsService.findOne.mockRejectedValue(
        new BadRequestException('Invalid product ID format'),
      );

      await expect(controller.findOne(storeId, invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      description: 'Updated description',
      priceRetail: 120.0,
      stock: 75,
    };

    it('should update a product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(
        storeId,
        productId,
        updateProductDto,
      );

      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        storeId,
        productId,
        updateProductDto,
      );
    });

    it('should handle product not found during update', async () => {
      mockProductsService.update.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(
        controller.update(storeId, productId, updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { priceRetail: -10 } as UpdateProductDto;
      mockProductsService.update.mockRejectedValue(
        new BadRequestException('Price must be positive'),
      );

      await expect(
        controller.update(storeId, productId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle empty update data', async () => {
      const emptyDto = {};
      mockProductsService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(storeId, productId, emptyDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        storeId,
        productId,
        emptyDto,
      );
    });
  });

  describe('remove', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a product successfully', async () => {
      const expectedResponse = {
        message: 'Product deleted successfully',
        data: null,
      };
      mockProductsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(storeId, productId);

      expect(result).toEqual(expectedResponse);
      expect(mockProductsService.remove).toHaveBeenCalledWith(
        storeId,
        productId,
      );
    });

    it('should handle product not found during removal', async () => {
      mockProductsService.remove.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.remove(storeId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle products that cannot be deleted', async () => {
      mockProductsService.remove.mockRejectedValue(
        new BadRequestException('Cannot delete product with active orders'),
      );

      await expect(controller.remove(storeId, productId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('restore', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    it('should restore a product successfully', async () => {
      const expectedResponse = {
        message: 'Product restored successfully',
        data: mockProduct,
      };
      mockProductsService.restore.mockResolvedValue(expectedResponse);

      const result = await controller.restore(storeId, productId);

      expect(result).toEqual(expectedResponse);
      expect(mockProductsService.restore).toHaveBeenCalledWith(
        storeId,
        productId,
      );
    });

    it('should handle product not found during restore', async () => {
      mockProductsService.restore.mockRejectedValue(
        new NotFoundException('Product not found or not deleted'),
      );

      await expect(controller.restore(storeId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle products that are not deleted', async () => {
      mockProductsService.restore.mockRejectedValue(
        new BadRequestException('Product is not deleted'),
      );

      await expect(controller.restore(storeId, productId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByStore', () => {
    it('should return products by store ID', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findByStore(storeId);

      expect(result).toEqual(products);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty store products', async () => {
      mockProductsService.findAll.mockResolvedValue([]);

      const result = await controller.findByStore(storeId);

      expect(result).toEqual([]);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle invalid store ID', async () => {
      const invalidStoreId = 'invalid-store';
      mockProductsService.findAll.mockRejectedValue(
        new BadRequestException('Invalid store ID'),
      );

      await expect(controller.findByStore(invalidStoreId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('parameter validation', () => {
    it('should handle invalid store ID format', async () => {
      const invalidStoreId = '';
      mockProductsService.findAll.mockRejectedValue(
        new BadRequestException('Store ID is required'),
      );

      await expect(controller.findAll(invalidStoreId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid product ID format', async () => {
      const invalidProductId = '';
      mockProductsService.findOne.mockRejectedValue(
        new BadRequestException('Product ID is required'),
      );

      await expect(
        controller.findOne(storeId, invalidProductId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('business logic validation', () => {
    it('should handle duplicate product codes', async () => {
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'DUPLICATE_CODE',
        name: 'Test Product',
        slug: 'test-product',
        description: 'This is a test product',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      mockProductsService.createProduct.mockRejectedValue(
        new BadRequestException('❌ Mã sản phẩm đã tồn tại'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid category during creation', async () => {
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'SP001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'This is a test product',
        categoryId: 'invalid-category-id',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      mockProductsService.createProduct.mockRejectedValue(
        new BadRequestException('❌ Danh mục không tồn tại'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative stock levels', async () => {
      const updateProductDto: UpdateProductDto = {
        stock: -5,
      };

      mockProductsService.update.mockRejectedValue(
        new BadRequestException('❌ Số lượng tồn kho không thể âm'),
      );

      await expect(
        controller.update(storeId, mockProduct.product_id, updateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle price validation errors', async () => {
      const updateProductDto: UpdateProductDto = {
        priceRetail: 0,
      };

      mockProductsService.update.mockRejectedValue(
        new BadRequestException('❌ Giá bán lẻ phải lớn hơn 0'),
      );

      await expect(
        controller.update(storeId, mockProduct.product_id, updateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid barcode format', async () => {
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'SP001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'This is a test product',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        barcode: 'invalid-barcode',
        isActive: true,
        isDeleted: false,
      };

      mockProductsService.createProduct.mockRejectedValue(
        new BadRequestException('❌ Mã vạch không hợp lệ'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('should handle very long product names', async () => {
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'SP001',
        name: 'A'.repeat(300), // Exceeds max length
        slug: 'test-product',
        description: 'This is a test product',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      mockProductsService.createProduct.mockRejectedValue(
        new BadRequestException('❌ Tên sản phẩm tối đa 255 ký tự'),
      );

      await expect(
        controller.create(storeId, createProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle null values in optional fields', async () => {
      const createProductDto: CreateProductDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productCode: 'SP001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'This is a test product',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
        // All optional fields are undefined
      };

      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.create(storeId, createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.createProduct).toHaveBeenCalledWith(
        storeId,
        createProductDto,
      );
    });
  });
});
