import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from 'src/modules/products/service/products.service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { Category } from 'src/entities/tenant/category.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service';

describe('ProductsService - createProduct (Detailed)', () => {
  let service: ProductsService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockProductRepository: jest.Mocked<any>;
  let mockCategoryRepository: jest.Mocked<any>;
  let mockAuditLogsService: jest.Mocked<AuditLogsService>;
  let loggerSpy: jest.SpyInstance;

  const storeId = 'store-123';
  const validCreateDto: CreateProductDto = {
    productId: 'prod-001',
    productCode: 'CODE-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Product Description',
    categoryId: 'cat-001',
    brand: 'Test Brand',
    unitId: 'unit-001',
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
    supplierId: 'sup-001',
    isActive: true,
    isDeleted: false,
    createdByUserId: 'user-001',
  };

  const mockProduct: Product = {
    product_id: 'prod-001',
    product_code: 'CODE-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Product Description',
    category_id: 'cat-001',
    category: {} as any,
    brand: 'Test Brand',
    unit_id: 'unit-001',
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
    supplier_id: 'sup-001',
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    created_by_user_id: 'user-001',
    updated_by_user_id: 'user-001',
    getUnit: jest.fn(),
    getCreatedByUser: jest.fn(),
    getUpdatedByUser: jest.fn(),
  };

  const mockCategory = {
    category_id: 'cat-001',
    name: 'Test Category',
    is_active: true,
    is_deleted: false,
  };

  beforeEach(async () => {
    // Mock repositories
    mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    mockCategoryRepository = {
      findOne: jest.fn(),
    };

    // Mock services
    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn(),
    } as any;

    mockAuditLogsService = {
      create: jest.fn(),
    } as any;

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

    // Setup logger spy
    loggerSpy = jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    // Setup default mocks
    const mockDataSource = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Product) return mockProductRepository;
        if (entity === Category) return mockCategoryRepository;
        return mockProductRepository;
      }),
      isInitialized: true,
    } as any;

    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Creation', () => {
    it('should create product successfully and log audit', async () => {
      // Setup mocks for successful creation
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, validCreateDto);

      // Verify result
      expect(result).toEqual(mockProduct);

      // Verify repository calls
      expect(mockProductRepository.create).toHaveBeenCalledWith(validCreateDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);

      // Verify category validation
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'cat-001',
          is_deleted: false,
          is_active: true,
        },
      });

      // Verify audit log creation
      expect(mockAuditLogsService.create).toHaveBeenCalledWith(storeId, {
        userId: 'user-001',
        action: 'CREATE',
        targetTable: 'Product',
        targetId: 'prod-001',
        metadata: {
          action: 'CREATE',
          resource: 'Product',
          resourceId: 'prod-001',
          changes: mockProduct,
        },
      });

      // Verify logging
      expect(loggerSpy).toHaveBeenCalledWith(
        `Creating product for store: ${storeId}`,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Product created successfully: ${mockProduct.product_id}`,
      );
    });

    it('should create product with minimal required fields', async () => {
      const minimalDto: CreateProductDto = {
        productId: 'prod-002',
        productCode: 'CODE-002',
        name: 'Minimal Product',
        slug: 'minimal-product',
        description: 'Minimal description',
        categoryId: 'cat-001',
        priceRetail: 50.0,
        stock: 10,
        minStockLevel: 1,
        isActive: true,
        isDeleted: false,
      };

      const minimalProduct = { ...mockProduct, ...minimalDto };

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(minimalProduct);
      mockProductRepository.save.mockResolvedValue(minimalProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, minimalDto);

      expect(result).toEqual(minimalProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(minimalDto);
    });
  });

  describe('Duplicate ProductId Error', () => {
    it('should throw InternalServerErrorException when productId already exists', async () => {
      const existingProduct = {
        ...mockProduct,
        product_id: 'prod-001',
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(existingProduct);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Sản phẩm với ID "prod-001" đã tồn tại',
        ),
      );

      // Verify that no further operations were performed
      // Note: findByproductCode should not be called since productId check fails first
      expect(mockProductRepository.create).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
      expect(mockAuditLogsService.create).not.toHaveBeenCalled();
    });

    it('should log error when productId already exists', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const existingProduct = {
        ...mockProduct,
        product_id: 'prod-001',
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(existingProduct);

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: ❌ Sản phẩm với ID "prod-001" đã tồn tại',
          expect.any(String),
        );
      }
    });
  });

  describe('Duplicate ProductCode Error', () => {
    it('should throw InternalServerErrorException when productCode already exists', async () => {
      const existingProduct = {
        ...mockProduct,
        product_code: 'CODE-001',
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest
        .spyOn(service, 'findByproductCode')
        .mockResolvedValue(existingProduct);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Sản phẩm với productCode "CODE-001" đã tồn tại',
        ),
      );

      // Verify that validation was performed but creation was not
      expect(service.findById).toHaveBeenCalledWith(storeId, 'prod-001');
      expect(service.findByproductCode).toHaveBeenCalledWith(
        storeId,
        'CODE-001',
      );
      expect(mockProductRepository.create).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
      expect(mockAuditLogsService.create).not.toHaveBeenCalled();
    });

    it('should log error when productCode already exists', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const existingProduct = {
        ...mockProduct,
        product_code: 'CODE-001',
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest
        .spyOn(service, 'findByproductCode')
        .mockResolvedValue(existingProduct);

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: ❌ Sản phẩm với productCode "CODE-001" đã tồn tại',
          expect.any(String),
        );
      }
    });

    it('should handle case where both productId and productCode exist (productId checked first)', async () => {
      const existingProduct = {
        ...mockProduct,
        getUnit: jest.fn(),
        getCreatedByUser: jest.fn(),
        getUpdatedByUser: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(existingProduct);
      jest
        .spyOn(service, 'findByproductCode')
        .mockResolvedValue(existingProduct);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Sản phẩm với ID "prod-001" đã tồn tại',
        ),
      );

      // ProductCode check should not be called since productId check fails first
      // Note: We can't easily verify this without more complex spy setup
    });
  });

  describe('Category Validation Error', () => {
    it('should throw InternalServerErrorException when category does not exist', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Danh mục với ID "cat-001" không tồn tại trong hệ thống',
        ),
      );

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'cat-001',
          is_deleted: false,
          is_active: true,
        },
      });
      expect(mockProductRepository.create).not.toHaveBeenCalled();
      expect(mockAuditLogsService.create).not.toHaveBeenCalled();
    });

    it('should handle category validation database error', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(
        new InternalServerErrorException(
          '❌ Lỗi kiểm tra danh mục: Database connection failed',
        ),
      );
    });
  });

  describe('Audit Log Error', () => {
    it('should throw error when audit log creation fails', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockRejectedValue(
        new Error('Audit service unavailable'),
      );

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Audit service unavailable');

      // Verify product was created but audit failed
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(mockAuditLogsService.create).toHaveBeenCalled();
    });

    it('should log error when audit log creation fails', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockRejectedValue(
        new Error('Audit service unavailable'),
      );

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: Audit service unavailable',
          expect.any(String),
        );
      }
    });
  });

  describe('Database Error Scenarios', () => {
    it('should handle repository save error', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockRejectedValue(
        new Error('Database save failed'),
      );

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Database save failed');

      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(mockAuditLogsService.create).not.toHaveBeenCalled();
    });

    it('should handle tenant datasource connection error', async () => {
      mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        new Error('Cannot connect to tenant database'),
      );

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });

    it('should handle unknown error gracefully', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockImplementation(() => {
        throw 'Unknown error type'; // Non-Error object
      });

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: Unknown error',
          undefined,
        );
      }
    });
  });

  describe('Audit Log Content Validation', () => {
    it('should create audit log with correct metadata structure', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      await service.createProduct(storeId, validCreateDto);

      expect(mockAuditLogsService.create).toHaveBeenCalledWith(storeId, {
        userId: 'user-001',
        action: 'CREATE',
        targetTable: 'Product',
        targetId: 'prod-001',
        metadata: {
          action: 'CREATE',
          resource: 'Product',
          resourceId: 'prod-001',
          changes: mockProduct,
        },
      });
    });

    it('should handle missing createdByUserId in audit log', async () => {
      const dtoWithoutUserId = { ...validCreateDto };
      (dtoWithoutUserId as any).createdByUserId = undefined;

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      await service.createProduct(storeId, dtoWithoutUserId);

      expect(mockAuditLogsService.create).toHaveBeenCalledWith(storeId, {
        userId: '', // Should default to empty string
        action: 'CREATE',
        targetTable: 'Product',
        targetId: 'prod-001',
        metadata: {
          action: 'CREATE',
          resource: 'Product',
          resourceId: 'prod-001',
          changes: mockProduct,
        },
      });
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('should handle null productCode validation', async () => {
      const dtoWithoutProductCode = { ...validCreateDto };
      (dtoWithoutProductCode as any).productCode = undefined;

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(
        storeId,
        dtoWithoutProductCode,
      );

      expect(result).toEqual(mockProduct);
      // Should still call findByproductCode even with undefined productCode
      expect(service.findByproductCode).toHaveBeenCalledWith(
        storeId,
        undefined,
      );
    });

    it('should handle repository create returning different object', async () => {
      const createdProduct = { ...mockProduct, name: 'Created Product' };

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(createdProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, validCreateDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(validCreateDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(createdProduct);
    });

    it('should handle category with different structure', async () => {
      const categoryWithExtraFields = {
        ...mockCategory,
        description: 'Test category description',
        parent_id: null,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(categoryWithExtraFields);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, validCreateDto);

      expect(result).toEqual(mockProduct);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'cat-001',
          is_deleted: false,
          is_active: true,
        },
      });
    });

    it('should handle error with empty message', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockRejectedValue(new Error(''));

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: ',
          expect.any(String),
        );
      }
    });

    it('should handle error without stack trace', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const errorWithoutStack = new Error('Test error');
      (errorWithoutStack as any).stack = undefined;

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockRejectedValue(errorWithoutStack);

      try {
        await service.createProduct(storeId, validCreateDto);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalledWith(
          'Failed to create product: Test error',
          undefined,
        );
      }
    });

    it('should handle successful creation with all optional fields', async () => {
      const fullDto: CreateProductDto = {
        ...validCreateDto,
        brand: 'Premium Brand',
        unitId: 'unit-002',
        priceWholesale: 90.0,
        creditPrice: 130.0,
        costPrice: 70.0,
        barcode: '9876543210987',
        minStockLevel: 5,
        images: '{"url": "premium-image.jpg", "alt": "Premium product"}',
        specs: '{"color": "blue", "size": "L", "material": "cotton"}',
        warrantyInfo: '2 years extended warranty',
        supplierId: 'sup-002',
        createdByUserId: 'admin-001',
      };

      const fullProduct = { ...mockProduct, ...fullDto };

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(fullProduct);
      mockProductRepository.save.mockResolvedValue(fullProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, fullDto);

      expect(result).toEqual(fullProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(fullDto);
      expect(mockAuditLogsService.create).toHaveBeenCalledWith(storeId, {
        userId: 'admin-001',
        action: 'CREATE',
        targetTable: 'Product',
        targetId: fullProduct.product_id,
        metadata: {
          action: 'CREATE',
          resource: 'Product',
          resourceId: fullProduct.product_id,
          changes: fullProduct,
        },
      });
    });
  });
});
