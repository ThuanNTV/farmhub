import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from 'src/modules/products/service/products.service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Product } from 'src/entities/tenant/product.entity';
import { Category } from 'src/entities/tenant/category.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service';
import { PriceHistoriesService } from 'src/modules/price-histories/service/price-histories.service';

describe('ProductsService - createProduct Coverage Test', () => {
  let service: ProductsService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockProductRepository: jest.Mocked<any>;
  let mockCategoryRepository: jest.Mocked<any>;
  let mockAuditLogsService: jest.Mocked<AuditLogsService>;

  const storeId = 'store-123';
  const validCreateDto: CreateProductDto = {
    productId: 'prod-001',
    productCode: 'CODE-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Product Description',
    categoryId: 'cat-001',
    priceRetail: 100.0,
    stock: 50,
    minStockLevel: 10,
    isActive: true,
    isDeleted: false,
  };

  const mockProduct: Product = {
    product_id: 'prod-001',
    product_code: 'CODE-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Product Description',
    category_id: 'cat-001',
    category: {} as any,
    brand: undefined,
    unit_id: undefined,
    price_retail: 100.0,
    price_wholesale: undefined,
    credit_price: undefined,
    cost_price: undefined,
    barcode: undefined,
    stock: 50,
    min_stock_level: 10,
    images: undefined,
    specs: undefined,
    warranty_info: undefined,
    supplier_id: undefined,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    created_by_user_id: undefined,
    updated_by_user_id: undefined,
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
    mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    mockCategoryRepository = {
      findOne: jest.fn(),
    };

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
        {
          provide: PriceHistoriesService,
          useValue: { createPriceHistories: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

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

  describe('createProduct - Full Coverage', () => {
    it('should successfully create product and cover all success paths', async () => {
      // Mock all dependencies for successful creation
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, validCreateDto);

      expect(result).toEqual(mockProduct);
      expect(service.findById).toHaveBeenCalledWith(storeId, 'prod-001');
      expect(service.findByproductCode).toHaveBeenCalledWith(
        storeId,
        'CODE-001',
      );
      expect(mockCategoryRepository.findOne).toHaveBeenCalled();
      expect(mockProductRepository.create).toHaveBeenCalledWith(validCreateDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(mockAuditLogsService.create).toHaveBeenCalled();
    });

    it('should throw error when productId exists', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockProduct);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when productCode exists', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(mockProduct);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when category does not exist', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle database connection error', async () => {
      mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Lỗi khi kết nối tới CSDL chi nhánh');
    });

    it('should handle repository save error', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Save failed');
    });

    it('should handle audit log creation error', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockRejectedValue(new Error('Audit failed'));

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Audit failed');
    });

    it('should handle unknown error type', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockImplementation(() => {
        throw 'String error'; // Non-Error object
      });

      try {
        await service.createProduct(storeId, validCreateDto);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBe('String error');
      }
    });

    it('should handle error without stack trace', async () => {
      const errorWithoutStack = new Error('Test error');
      (errorWithoutStack as any).stack = undefined;

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockRejectedValue(errorWithoutStack);

      await expect(
        service.createProduct(storeId, validCreateDto),
      ).rejects.toThrow('Test error');
    });

    it('should handle missing createdByUserId', async () => {
      const dtoWithoutUserId = { ...validCreateDto };
      (dtoWithoutUserId as any).createdByUserId = undefined;

      jest.spyOn(service, 'findById').mockResolvedValue(null);
      jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockAuditLogsService.create.mockResolvedValue({} as any);

      const result = await service.createProduct(storeId, dtoWithoutUserId);

      expect(result).toEqual(mockProduct);
      expect(mockAuditLogsService.create).toHaveBeenCalledWith(storeId, {
        userId: '',
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

    it('should handle undefined productCode', async () => {
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
      expect(service.findByproductCode).toHaveBeenCalledWith(
        storeId,
        undefined,
      );
    });
  });
});
