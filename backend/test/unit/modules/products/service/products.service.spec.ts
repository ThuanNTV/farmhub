import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from 'src/modules/products/service/products.service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service';

describe('ProductsService', () => {
  // Tắt log error của NestJS và console.error khi chạy test
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  let service: ProductsService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: jest.Mocked<any>;
  let mockAuditLogsService: any;

  const mockCategory = {} as any;

  const mockProduct: Product = {
    product_id: 'p1',
    product_code: 'C1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'desc',
    category_id: 'cat1',
    category: mockCategory,
    brand: 'Brand',
    unit_id: 'u1',
    price_retail: 100,
    price_wholesale: 90,
    credit_price: 80,
    cost_price: 70,
    barcode: 'B1',
    stock: 10,
    min_stock_level: 1,
    images: '',
    specs: '',
    warranty_info: '',
    supplier_id: 'sup1',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by_user_id: 'u1',
    updated_by_user_id: 'u2',
    getUnit: jest.fn(),
    getCreatedByUser: jest.fn(),
    getUpdatedByUser: jest.fn(),
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

    mockAuditLogsService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
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

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock findById to return null (product doesn't exist)
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      // Mock findByproductCode to return null (product code doesn't exist)
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category repository for validation
      const mockCategoryRepo = {
        findOne: jest
          .fn()
          .mockResolvedValue({ category_id: createProductDto.categoryId }),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'Category') return mockCategoryRepo;
          return mockRepository;
        }),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

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

    it('should log and throw if repo.save throws', async () => {
      const storeId = 'store-123';

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock findById and findByproductCode to return null
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category validation to pass
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue({ category_id: 'cat1' }),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'Category') return mockCategoryRepo;
          return mockRepository;
        }),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      mockRepository.create.mockReturnValue({ product_id: 'p1' });
      mockRepository.save.mockRejectedValue(new Error('fail-save'));

      await expect(
        service.createProduct(storeId, {
          productId: 'p1',
          productCode: 'C1',
          categoryId: 'cat1',
        } as any),
      ).rejects.toThrow('fail-save');
    });
    it('should log and throw if auditLogsService.create throws', async () => {
      const storeId = 'store-123';

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock findById and findByproductCode to return null
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category validation to pass
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue({ category_id: 'cat1' }),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'Category') return mockCategoryRepo;
          return mockRepository;
        }),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      mockRepository.create.mockReturnValue({ product_id: 'p1' });
      mockRepository.save.mockResolvedValue({ product_id: 'p1' });
      mockAuditLogsService.create.mockRejectedValue(new Error('fail-audit'));

      await expect(
        service.createProduct(storeId, {
          productId: 'p1',
          productCode: 'C1',
          categoryId: 'cat1',
        } as any),
      ).rejects.toThrow('fail-audit');
    });
    it('should log and throw if getRepo throws', async () => {
      const storeId = 'store-123';
      mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        new Error('fail-getRepo'),
      );
      await expect(
        service.createProduct(storeId, {
          productId: 'p1',
          productCode: 'C1',
        } as any),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });
    it('should log and throw if unknown error', async () => {
      const storeId = 'store-123';

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock findById and findByproductCode to return null
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category validation to pass
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue({ category_id: 'cat1' }),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'Category') return mockCategoryRepo;
          return mockRepository;
        }),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      mockRepository.create.mockImplementation(() => {
        throw new Error('fail-unknown');
      });

      await expect(
        service.createProduct(storeId, {
          productId: 'p1',
          productCode: 'C1',
          categoryId: 'cat1',
        } as any),
      ).rejects.toThrow('fail-unknown');
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

    it('should log and throw if repo.find throws', async () => {
      const storeId = 'store-123';
      mockRepository.find.mockRejectedValue(new Error('fail-find'));
      await expect(service.findAll(storeId)).rejects.toThrow('fail-find');
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

    it('should throw if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(storeId, productId)).rejects.toThrow();
    });
    it('should log and throw if repo.save throws', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue({
        product_id: 'p1',
        is_deleted: false,
      });
      mockRepository.save.mockRejectedValue(new Error('fail-save'));
      await expect(service.remove(storeId, productId)).rejects.toThrow(
        'fail-save',
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

    it('should throw if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.restore(storeId, productId)).rejects.toThrow();
    });
    it('should log and throw if repo.save throws', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOneBy.mockResolvedValue({
        product_id: 'p1',
        is_deleted: true,
      });
      mockRepository.save.mockRejectedValue(
        new Error('Sản phẩm không tồn tại hoặc chưa bị xóa mềm'),
      );
      await expect(service.restore(storeId, productId)).rejects.toThrow(
        'Sản phẩm không tồn tại hoặc chưa bị xóa mềm',
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

      const existingProduct = {
        ...mockProduct,
        product_id: 'different-id',
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };

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

    it('should throw if product not found', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOneBy.mockResolvedValueOnce(null);
      await expect(
        service.update(storeId, productId, { productCode: 'C2' } as any),
      ).rejects.toThrow();
    });
    it('should log and throw if repo.save throws', async () => {
      const storeId = 'store-123';
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOneBy.mockResolvedValueOnce({
        product_id: 'p1',
        product_code: 'C1',
      });
      mockRepository.findOneBy.mockResolvedValueOnce(null);
      mockRepository.merge.mockReturnValue({
        product_id: 'p1',
        product_code: 'C2',
      });
      mockRepository.save.mockRejectedValue(new Error('fail-save'));
      await expect(
        service.update(storeId, productId, { productCode: 'C2' } as any),
      ).rejects.toThrow('fail-save');
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

    it('should validate category exists during creation', async () => {
      const storeId = 'store-123';
      const createProductDto: CreateProductDto = {
        productId: 'test-product-id',
        productCode: 'TEST-001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        categoryId: 'non-existent-category',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock no existing product/code conflicts
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category repository to return null (category doesn't exist)
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockCategoryRepo),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      await expect(
        service.createProduct(storeId, createProductDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Danh mục với ID "non-existent-category" không tồn tại trong hệ thống',
        ),
      );
    });

    it('should validate category exists during update', async () => {
      const storeId = 'store-123';
      const productId = 'existing-product-id';
      const updateDto: UpdateProductDto = {
        categoryId: 'non-existent-category',
      };

      // Mock existing product
      jest.spyOn(service, 'findOneProduc').mockResolvedValue({
        repo: mockRepository,
        product: mockProduct,
      });

      // Mock category repository to return null (category doesn't exist)
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockCategoryRepo),
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      await expect(
        service.update(storeId, productId, updateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Danh mục với ID "non-existent-category" không tồn tại trong hệ thống',
        ),
      );
    });

    it('should pass validation when category exists during creation', async () => {
      const storeId = 'store-123';
      const createProductDto: CreateProductDto = {
        productId: 'test-product-id',
        productCode: 'TEST-001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        categoryId: 'valid-category',
        priceRetail: 100.0,
        stock: 50,
        minStockLevel: 10,
        isActive: true,
        isDeleted: false,
      };

      // Mock getRepo to return mockRepository directly
      jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

      // Mock no existing product/code conflicts
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);

      // Mock category exists
      const mockCategory = {
        category_id: 'valid-category',
        name: 'Valid Category',
      };
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue(mockCategory),
      };
      const mockDataSource = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'Category') return mockCategoryRepo;
          return mockRepository;
        }),
        isInitialized: true,
      };
      mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
        mockDataSource as any,
      );

      // Mock successful creation
      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(storeId, createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'valid-category',
          is_deleted: false,
          is_active: true,
        },
      });
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
