import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '@modules/products/controller/products.controller';
import { ProductsService } from '@modules/products/service/products.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
// Simple mock data without helpers
const createMockProduct = () => ({
  productId: '123e4567-e89b-12d3-a456-426614174000',
  product_code: 'SP001',
  name: 'Test Product',
  slug: 'test-product',
  description: 'This is a test product',
  category_id: '123e4567-e89b-12d3-a456-426614174001',
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
  created_at: new Date('2024-01-15T10:00:00Z'),
  updated_at: new Date('2024-01-15T10:30:00Z'),
  created_by_user_id: '123e4567-e89b-12d3-a456-426614174004',
  updated_by_user_id: '123e4567-e89b-12d3-a456-426614174004',
});

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;
  let module: TestingModule;

  // Mock data
  const mockProduct = createMockProduct();
  const storeId = 'store-123';

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      createProduct: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<jest.Mocked<ProductsService>>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('create', () => {
    const createDto = {
      productCode: 'SP001',
      name: 'Test Product',
      priceRetail: 100,
      stock: 50,
    };

    it('should create a product successfully', async () => {
      service.createProduct.mockResolvedValue(mockProduct as any);

      const result = await controller.create(storeId, createDto as any);

      expect(result).toEqual(mockProduct);
      expect(service.createProduct).toHaveBeenCalledWith(storeId, createDto);
    });

    it('should handle creation errors', async () => {
      service.createProduct.mockRejectedValue(
        new BadRequestException('Product creation failed'),
      );

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct];
      service.findAll.mockResolvedValue(mockProducts as any);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty results', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return product by ID', async () => {
      service.findOne.mockResolvedValue(mockProduct as any);

      const result = await controller.findOne(storeId, 'product-123');

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(storeId, 'product-123');
    });

    it('should handle product not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.findOne(storeId, 'product-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Product',
      priceRetail: 120,
    };

    it('should update product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      service.update.mockResolvedValue(updatedProduct as any);

      const result = await controller.update(
        storeId,
        'product-123',
        updateDto as any,
      );

      expect(result).toEqual(updatedProduct);
      expect(service.update).toHaveBeenCalledWith(
        storeId,
        'product-123',
        updateDto,
      );
    });

    it('should handle update errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Update failed'),
      );

      await expect(
        controller.update(storeId, 'product-123', updateDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove product successfully', async () => {
      const removeResponse = {
        message: '✅ Sản phẩm với ID "product-123" đã được xóa',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse as any);

      const result = await controller.remove(storeId, 'product-123');

      expect(result).toEqual(removeResponse);
      expect(service.remove).toHaveBeenCalledWith(storeId, 'product-123');
    });

    it('should handle remove errors', async () => {
      service.remove.mockRejectedValue(
        new InternalServerErrorException('Remove failed'),
      );

      await expect(controller.remove(storeId, 'product-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('restore', () => {
    it('should restore product successfully', async () => {
      const restoreResponse = {
        message: '✅ Sản phẩm với ID "product-123" đã được khôi phục',
        data: mockProduct,
      };
      service.restore.mockResolvedValue(restoreResponse as any);

      const result = await controller.restore(storeId, 'product-123');

      expect(result).toEqual(restoreResponse);
      expect(service.restore).toHaveBeenCalledWith(storeId, 'product-123');
    });

    it('should handle restore errors', async () => {
      service.restore.mockRejectedValue(
        new InternalServerErrorException('Restore failed'),
      );

      await expect(controller.restore(storeId, 'product-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('business logic validation', () => {
    it('should handle duplicate product code', async () => {
      const duplicateDto = {
        productCode: 'EXISTING_CODE',
        name: 'Test Product',
      };

      service.createProduct.mockRejectedValue(
        new BadRequestException('❌ Mã sản phẩm đã tồn tại'),
      );

      await expect(
        controller.create(storeId, duplicateDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid price values', async () => {
      const invalidDto = {
        productCode: 'SP001',
        name: 'Test Product',
        priceRetail: -100,
      };

      service.createProduct.mockRejectedValue(
        new BadRequestException('❌ Giá bán phải lớn hơn 0'),
      );

      await expect(
        controller.create(storeId, invalidDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative stock values', async () => {
      const invalidDto = {
        productCode: 'SP001',
        name: 'Test Product',
        stock: -10,
      };

      service.createProduct.mockRejectedValue(
        new BadRequestException('❌ Tồn kho không được nhỏ hơn 0'),
      );

      await expect(
        controller.create(storeId, invalidDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('should handle service unavailable', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Service temporarily unavailable'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle malformed store ID', async () => {
      service.findAll.mockRejectedValue(
        new BadRequestException('Invalid store ID'),
      );

      await expect(controller.findAll('invalid-store-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
