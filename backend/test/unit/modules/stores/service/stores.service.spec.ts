/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from '@modules/stores/service/stores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlobalEntityService } from 'src/service/global-entity.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Store } from 'src/entities/global/store.entity';
import { PaperSize } from 'src/modules/stores/dto/create-store.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

describe('StoresService', () => {
  let service: StoresService;
  let storesRepo: jest.Mocked<Repository<Store>>;
  let globalEntityService: jest.Mocked<GlobalEntityService>;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;

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
    const mockQuery = jest.fn();
    const mockRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      manager: { query: mockQuery },
      delete: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      merge: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const mockGlobalEntityService = {
      validateReferences: jest.fn(),
    };

    const mockTenantDataSourceService = {
      dropObsoleteIndexesWithGlobalConnection: jest.fn(),
      getTenantDataSource: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getRepositoryToken(Store, 'globalConnection'),
          useValue: mockRepository,
        },
        {
          provide: GlobalEntityService,
          useValue: mockGlobalEntityService,
        },
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    storesRepo = module.get(getRepositoryToken(Store, 'globalConnection'));
    globalEntityService = module.get(GlobalEntityService);
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  describe('createStore', () => {
    const baseStoreDto = {
      managerUserId: 'user-001',
      bankId: 'bank-001',
      schemaName: 'store-001',
      name: 'Store 1',
      address: '123 Test St',
      phone: '0123456789',
    };

    it('should throw BadRequestException if managerUserId is invalid', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: false,
        errors: ['User not found: user-001'],
        data: {},
      });

      await expect(service.createStore(baseStoreDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if bankId is invalid', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: false,
        errors: ['Bank not found: bank-001'],
        data: {},
      });

      await expect(service.createStore(baseStoreDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if store already exists', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: true,
        errors: [],
        data: {},
      });
      storesRepo.findOneBy.mockResolvedValue({
        ...mockStore,
        is_deleted: false,
      });

      await expect(service.createStore(baseStoreDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create store if references are valid', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: true,
        errors: [],
        data: {},
      });
      storesRepo.findOneBy.mockResolvedValue(null);
      storesRepo.create.mockReturnValue(mockStore);
      storesRepo.save.mockResolvedValue(mockStore);
      storesRepo.findOne.mockResolvedValue(mockStore);
      (storesRepo.manager.query as jest.Mock).mockResolvedValue(undefined);
      tenantDataSourceService.dropObsoleteIndexesWithGlobalConnection.mockResolvedValue(
        undefined,
      );
      tenantDataSourceService.getTenantDataSource.mockResolvedValue({
        synchronize: jest.fn().mockResolvedValue(undefined),
      } as unknown as DataSource);

      const result = await service.createStore(baseStoreDto);

      expect(result.data.name).toBe('Test Store');
      expect(result.message).toBe('✅ Tạo Store thành công');
    });

    it('should handle database creation failure', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: true,
        errors: [],
        data: {},
      });
      storesRepo.findOneBy.mockResolvedValue(null);
      storesRepo.create.mockReturnValue(mockStore);
      (storesRepo.manager.query as jest.Mock).mockRejectedValue(
        new Error('Database creation failed'),
      );

      await expect(service.createStore(baseStoreDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle tenant datasource creation failure', async () => {
      globalEntityService.validateReferences.mockResolvedValue({
        valid: true,
        errors: [],
        data: {},
      });
      storesRepo.findOneBy.mockResolvedValue(null);
      storesRepo.create.mockReturnValue(mockStore);
      storesRepo.save.mockResolvedValue(mockStore);
      (storesRepo.manager.query as jest.Mock).mockResolvedValue(undefined);
      tenantDataSourceService.dropObsoleteIndexesWithGlobalConnection.mockRejectedValue(
        new Error('Datasource creation failed'),
      );

      await expect(service.createStore(baseStoreDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active stores', async () => {
      const stores = [mockStore];
      storesRepo.find.mockResolvedValue(stores);

      const result = await service.findAll();

      expect(storesRepo.find).toHaveBeenCalledWith({
        where: { is_active: true, is_deleted: false },
      });
      expect(result).toEqual(stores);
    });

    it('should return empty array when no stores found', async () => {
      storesRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return store by schema name', async () => {
      storesRepo.findOne.mockResolvedValue(mockStore);

      const result = await service.findOne('store-001');

      expect(storesRepo.findOne).toHaveBeenCalledWith({
        where: { schema_name: 'store-001', is_deleted: false },
      });
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-store')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateStoreDto = {
      name: 'Updated Store',
      address: '456 Updated St',
      phone: '0987654321',
      schemaName: 'store_001', // Thêm schemaName để tránh conflict
    };

    it('should update store successfully', async () => {
      storesRepo.findOne.mockResolvedValue(mockStore);
      storesRepo.merge.mockReturnValue({ ...mockStore, ...updateStoreDto });
      storesRepo.save.mockResolvedValue({ ...mockStore, ...updateStoreDto });

      const result = await service.update('store-001', updateStoreDto);

      expect(result.message).toBe('✅ Store "Updated Store" đã được cập nhật');
      expect(result.data.name).toBe('Updated Store');
    });

    it('should throw ConflictException if schema name is changed', async () => {
      storesRepo.findOne.mockResolvedValue(mockStore);

      await expect(
        service.update('store-001', {
          ...updateStoreDto,
          schemaName: 'different-schema',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-store', updateStoreDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete store successfully', async () => {
      storesRepo.findOne.mockResolvedValue(mockStore);
      storesRepo.save.mockResolvedValue({ ...mockStore, is_deleted: true });

      const result = await service.remove('store-001');

      expect(result.message).toBe(
        '✅ Store với ID "store-001" đã được xóa mềm',
      );
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-store')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore deleted store successfully', async () => {
      const deletedStore = { ...mockStore, is_deleted: true };
      storesRepo.findOne.mockResolvedValue(deletedStore);
      storesRepo.save.mockResolvedValue({ ...deletedStore, is_deleted: false });

      const result = await service.restore('store-001');

      expect(result.message).toBe('Khôi phục store thành công');
      expect(result.data.is_deleted).toBe(false);
    });

    it('should throw InternalServerErrorException if store not found or not deleted', async () => {
      storesRepo.findOne.mockResolvedValue(null);

      await expect(service.restore('invalid-store')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createTenantDatabase', () => {
    it('should create database successfully', async () => {
      (storesRepo.manager.query as jest.Mock).mockResolvedValue(undefined);

      await service.createTenantDatabase('test-db');

      expect(storesRepo.manager.query).toHaveBeenCalledWith(
        'CREATE DATABASE "test-db"',
      );
    });

    it('should handle database creation error', async () => {
      (storesRepo.manager.query as jest.Mock).mockRejectedValue(
        new Error('Database creation failed'),
      );

      await expect(service.createTenantDatabase('test-db')).rejects.toThrow(
        Error,
      );
    });
  });

  describe('updateStore', () => {
    it('should call update method', async () => {
      const updateStoreDto = { name: 'Updated Store', schemaName: 'store_001' };
      const expectedResult = {
        message: '✅ Store "Updated Store" đã được cập nhật',
        data: { ...mockStore, name: 'Updated Store' },
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await service.updateStore('store-001', updateStoreDto);

      expect(service.update).toHaveBeenCalledWith('store-001', updateStoreDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeStore', () => {
    it('should call remove method', async () => {
      const expectedResult = {
        message: '✅ Store với ID "store-001" đã được xóa mềm',
        data: null,
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await service.removeStore('store-001');

      expect(service.remove).toHaveBeenCalledWith('store-001');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByUser', () => {
    it('should return stores for user', async () => {
      const stores = [mockStore];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(stores),
      };
      storesRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByUser('user-001');

      expect(result).toEqual(stores);
    });

    it('should return empty array when user has no stores', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      storesRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByUser('user-001');

      expect(result).toEqual([]);
    });
  });

  describe('dropTenantDatabase', () => {
    it('should drop database successfully', async () => {
      (storesRepo.manager.query as jest.Mock).mockResolvedValue(undefined);

      await service.dropTenantDatabase('test-db');

      expect(storesRepo.manager.query).toHaveBeenCalledWith(
        'DROP DATABASE IF EXISTS "test-db"',
      );
    });

    it('should handle database drop error gracefully', async () => {
      (storesRepo.manager.query as jest.Mock).mockRejectedValue(
        new Error('Database drop failed'),
      );

      // dropTenantDatabase không throw error, chỉ log
      await expect(
        service.dropTenantDatabase('test-db'),
      ).resolves.toBeUndefined();
    });
  });
});
