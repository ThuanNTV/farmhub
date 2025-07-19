/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from '@modules/stores/controller/stores.controller';
import { StoresService } from '@modules/stores/service/stores.service';
import {
  CreateStoreDto,
  PaperSize,
} from '@modules/stores/dto/create-store.dto';
import { UpdateStoreDto } from '@modules/stores/dto/update-store.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';
import { PermissionGuard } from '@core/rbac/permission/permission.guard';
import { AuditInterceptor } from '@common/auth/audit.interceptor';
import { Store } from 'src/entities/global/store.entity';

describe('StoresController', () => {
  let controller: StoresController;
  let storesService: jest.Mocked<StoresService>;

  const mockStore: Store = {
    store_id: 'store-001',
    name: 'Test Store',
    address: '123 Test St',
    phone: '0123456789',
    email: 'test@store.com',
    schema_name: 'store_001',
    manager_user_id: 'user-001',
    bank_id: 'bank-001',
    account_no: '123456789',
    account_name: 'Test Account',
    is_vat_enabled: false,
    vat_rate: 8,
    invoice_footer: 'Thank you',
    default_paper_size: PaperSize.k80,
    backup_schedule: 'daily',
    default_unit_id: 'unit-001',
    default_discount: 0,
    default_shipping_fee: 0,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: {
            createStore: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateStore: jest.fn(),
            removeStore: jest.fn(),
            restore: jest.fn(),
            findByUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AuditInterceptor)
      .useValue({ intercept: (ctx, next) => next.handle() })
      .compile();

    controller = module.get<StoresController>(StoresController);
    storesService = module.get(StoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a store successfully', async () => {
      const createStoreDto: CreateStoreDto = {
        managerUserId: 'user-001',
        bankId: 'bank-001',
        schemaName: 'store-001',
        name: 'Test Store',
        address: '123 Test St',
        phone: '0123456789',
        email: 'test@store.com',
        accountNo: '123456789',
        accountName: 'Test Account',
        isVatEnabled: false,
        vatRate: 8,
        invoiceFooter: 'Thank you',
        defaultPaperSize: PaperSize.k80,
        backupSchedule: 'daily',
        defaultUnitId: 'unit-001',
        defaultDiscount: 0,
        defaultShippingFee: 0,
      };

      const expectedResult = {
        message: '✅ Tạo Store thành công',
        data: mockStore,
      };

      storesService.createStore.mockResolvedValue(expectedResult);

      const result = await controller.create(createStoreDto);

      expect(storesService.createStore).toHaveBeenCalledWith(createStoreDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle validation errors', async () => {
      const createStoreDto: CreateStoreDto = {
        managerUserId: 'invalid-user',
        bankId: 'bank-001',
        schemaName: 'store-001',
        name: 'Test Store',
        address: '123 Test St',
        phone: '0123456789',
      };

      storesService.createStore.mockRejectedValue(
        new BadRequestException('Invalid user'),
      );

      await expect(controller.create(createStoreDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      storesService.findAll.mockResolvedValue(stores);

      const result = await controller.findAll();

      expect(storesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });

    it('should handle service errors', async () => {
      storesService.findAll.mockRejectedValue(
        new InternalServerErrorException('Database error'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      storesService.findOne.mockResolvedValue(mockStore);

      const result = await controller.findOne('store-001');

      expect(storesService.findOne).toHaveBeenCalledWith('store-001');
      expect(result).toEqual(mockStore);
    });

    it('should handle store not found', async () => {
      storesService.findOne.mockRejectedValue(
        new NotFoundException('Store not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a store successfully', async () => {
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
        address: '456 Updated St',
        phone: '0987654321',
      };

      const expectedResult = {
        message: '✅ Store "Updated Store" đã được cập nhật',
        data: { ...mockStore, ...updateStoreDto },
      };

      storesService.updateStore.mockResolvedValue(expectedResult);

      const result = await controller.update('store-001', updateStoreDto);

      expect(storesService.updateStore).toHaveBeenCalledWith(
        'store-001',
        updateStoreDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle update conflicts', async () => {
      const updateStoreDto: UpdateStoreDto = {
        schemaName: 'different-schema',
        name: 'Updated Store',
      };

      storesService.updateStore.mockRejectedValue(
        new ConflictException('Cannot change schema name'),
      );

      await expect(
        controller.update('store-001', updateStoreDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a store successfully', async () => {
      const expectedResult = {
        message: '✅ Store với ID "store-001" đã được xóa mềm',
        data: null,
      };

      storesService.removeStore.mockResolvedValue(expectedResult);

      const result = await controller.remove('store-001');

      expect(storesService.removeStore).toHaveBeenCalledWith('store-001');
      expect(result).toEqual(expectedResult);
    });

    it('should handle store not found during removal', async () => {
      storesService.removeStore.mockRejectedValue(
        new NotFoundException('Store not found'),
      );

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted store successfully', async () => {
      const expectedResult = {
        message: 'Khôi phục store thành công',
        data: mockStore,
      };

      storesService.restore.mockResolvedValue(expectedResult);

      const result = await controller.restore('store-001');

      expect(storesService.restore).toHaveBeenCalledWith('store-001');
      expect(result).toEqual(expectedResult);
    });

    it('should handle restore errors', async () => {
      storesService.restore.mockRejectedValue(
        new InternalServerErrorException('Store not found or not deleted'),
      );

      await expect(controller.restore('invalid-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return stores for a user', async () => {
      const stores = [mockStore];
      storesService.findByUser.mockResolvedValue(stores);

      const result = await controller.findByUser('user-001');

      expect(storesService.findByUser).toHaveBeenCalledWith('user-001');
      expect(result).toEqual(stores);
    });

    it('should handle user not found', async () => {
      storesService.findByUser.mockResolvedValue([]);

      const result = await controller.findByUser('invalid-user');

      expect(result).toEqual([]);
    });
  });
});
