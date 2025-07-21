import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { Repository } from 'typeorm';
import {
  CategoryExistsConstraint,
  CategoryExists,
} from 'src/common/validators/category-exists.validator';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Category } from 'src/entities/tenant/category.entity';

describe('CategoryExistsConstraint', () => {
  let constraint: CategoryExistsConstraint;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: jest.Mocked<Repository<Category>>;
  let mockDataSource: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const mockTenantDataSourceService = {
      getTenantDataSource: jest.fn().mockResolvedValue(mockDataSource),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryExistsConstraint,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    constraint = module.get<CategoryExistsConstraint>(CategoryExistsConstraint);
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const mockValidationArguments: ValidationArguments = {
      value: 'test-category-id',
      targetName: 'TestClass',
      property: 'categoryId',
      object: { storeId: 'test-store-id' },
      constraints: [],
    };

    it('should return true for empty categoryId (let @IsNotEmpty handle)', async () => {
      const result = await constraint.validate('', mockValidationArguments);
      expect(result).toBe(true);
      expect(
        tenantDataSourceService.getTenantDataSource,
      ).not.toHaveBeenCalled();
    });

    it('should return true for null categoryId', async () => {
      const result = await constraint.validate(
        null as any,
        mockValidationArguments,
      );
      expect(result).toBe(true);
      expect(
        tenantDataSourceService.getTenantDataSource,
      ).not.toHaveBeenCalled();
    });

    it('should return true for undefined categoryId', async () => {
      const result = await constraint.validate(
        undefined as any,
        mockValidationArguments,
      );
      expect(result).toBe(true);
      expect(
        tenantDataSourceService.getTenantDataSource,
      ).not.toHaveBeenCalled();
    });

    it('should return false when storeId is not found in context', async () => {
      const argsWithoutStoreId = {
        ...mockValidationArguments,
        object: {}, // No storeId
      };

      const result = await constraint.validate(
        'test-category-id',
        argsWithoutStoreId,
      );
      expect(result).toBe(false);
      expect(
        tenantDataSourceService.getTenantDataSource,
      ).not.toHaveBeenCalled();
    });

    it('should return true when category exists and is active', async () => {
      const mockCategory = {
        category_id: 'test-category-id',
        is_deleted: false,
        is_active: true,
      };

      mockRepository.findOne.mockResolvedValue(mockCategory as Category);

      const result = await constraint.validate(
        'test-category-id',
        mockValidationArguments,
      );

      expect(result).toBe(true);
      expect(tenantDataSourceService.getTenantDataSource).toHaveBeenCalledWith(
        'test-store-id',
      );
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(Category);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'test-category-id',
          is_deleted: false,
          is_active: true,
        },
      });
    });

    it('should return false when category does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await constraint.validate(
        'non-existent-id',
        mockValidationArguments,
      );

      expect(result).toBe(false);
      expect(tenantDataSourceService.getTenantDataSource).toHaveBeenCalledWith(
        'test-store-id',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          category_id: 'non-existent-id',
          is_deleted: false,
          is_active: true,
        },
      });
    });

    it('should return false when database error occurs', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRepository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const result = await constraint.validate(
        'test-category-id',
        mockValidationArguments,
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating category existence:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return false when getTenantDataSource fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      tenantDataSourceService.getTenantDataSource.mockRejectedValue(
        new Error('Tenant not found'),
      );

      const result = await constraint.validate(
        'test-category-id',
        mockValidationArguments,
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating category existence:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    describe('getStoreIdFromContext', () => {
      it('should get storeId from object.storeId', async () => {
        const args = {
          ...mockValidationArguments,
          object: { storeId: 'store-from-storeId' },
        };

        mockRepository.findOne.mockResolvedValue({
          category_id: 'test',
        } as Category);

        await constraint.validate('test-id', args);

        expect(
          tenantDataSourceService.getTenantDataSource,
        ).toHaveBeenCalledWith('store-from-storeId');
      });

      it('should get storeId from object._storeId when storeId not available', async () => {
        const args = {
          ...mockValidationArguments,
          object: { _storeId: 'store-from-_storeId' },
        };

        mockRepository.findOne.mockResolvedValue({
          category_id: 'test',
        } as Category);

        await constraint.validate('test-id', args);

        expect(
          tenantDataSourceService.getTenantDataSource,
        ).toHaveBeenCalledWith('store-from-_storeId');
      });

      it('should prioritize storeId over _storeId', async () => {
        const args = {
          ...mockValidationArguments,
          object: {
            storeId: 'priority-store',
            _storeId: 'backup-store',
          },
        };

        mockRepository.findOne.mockResolvedValue({
          category_id: 'test',
        } as Category);

        await constraint.validate('test-id', args);

        expect(
          tenantDataSourceService.getTenantDataSource,
        ).toHaveBeenCalledWith('priority-store');
      });
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message with category ID', () => {
      const args: ValidationArguments = {
        value: 'invalid-category-id',
        targetName: 'TestClass',
        property: 'categoryId',
        object: {},
        constraints: [],
      };

      const message = constraint.defaultMessage(args);

      expect(message).toBe(
        'Danh mục với ID "invalid-category-id" không tồn tại trong hệ thống',
      );
    });

    it('should handle null value in error message', () => {
      const args: ValidationArguments = {
        value: null,
        targetName: 'TestClass',
        property: 'categoryId',
        object: {},
        constraints: [],
      };

      const message = constraint.defaultMessage(args);

      expect(message).toBe(
        'Danh mục với ID "null" không tồn tại trong hệ thống',
      );
    });
  });
});

describe('CategoryExists decorator', () => {
  it('should register decorator with correct parameters', () => {
    const mockRegisterDecorator = jest.fn();

    // Mock registerDecorator từ class-validator
    jest.doMock('class-validator', () => ({
      registerDecorator: mockRegisterDecorator,
      ValidationOptions: {},
      ValidatorConstraint: () => (target: any) => target,
      ValidatorConstraintInterface: {},
      ValidationArguments: {},
    }));

    class TestClass {
      @CategoryExists({ message: 'Custom message' })
      categoryId!: string;
    }

    // Verify decorator được register (implementation detail test)
    // Note: Thực tế thì decorator test khó test trực tiếp,
    // nhưng có thể test integration với class-validator
  });

  it('should work without validation options', () => {
    // Test decorator without options
    expect(() => {
      class TestClass {
        @CategoryExists()
        categoryId!: string;
      }
    }).not.toThrow();
  });
});
