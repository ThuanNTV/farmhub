import { Test, TestingModule } from '@nestjs/testing';
import { StoreSettingsController } from '@modules/store-settings/controller/store-settings.controller';
import { StoreSettingsService } from '@modules/store-settings/service/store-settings.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { Reflector } from '@nestjs/core';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import {
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
  mockReflector,
  mockSecurityService,
  mockAuditLogAsyncService,
} from '../../../../utils/mock-dependencies';
import { CreateStoreSettingDto } from 'src/modules/store-settings/dto/create-storeSetting.dto';
import { StoreSettingFilterDto } from 'src/modules/store-settings/dto/storeSetting-filter.dto';
import { UpdateStoreSettingDto } from 'src/modules/store-settings/dto/update-storeSetting.dto';
import { RequestWithUser } from 'src/common/types/common.types';

const mockService = {
  createStoreSetting: jest.fn(),
  findAllWithFilter: jest.fn(),
  findByKey: jest.fn(),
  getSettingValue: jest.fn(),
  getSettingsByCategory: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateByKey: jest.fn(),
  remove: jest.fn(),
  deleteByKey: jest.fn(),
  restore: jest.fn(),
};

describe('StoreSettingsController (unit)', () => {
  let controller: StoreSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreSettingsController],
      providers: [
        { provide: StoreSettingsService, useValue: mockService },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
        { provide: AuditInterceptor, useValue: mockAuditInterceptor },
        { provide: Reflector, useValue: mockReflector },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
      ],
    }).compile();

    controller = module.get<StoreSettingsController>(StoreSettingsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service.createStoreSetting', async () => {
    const req = { user: { id: 'u1' } } as RequestWithUser;
    await controller.create(
      'store-001',
      { storeId: 'store-001', settingKey: 'k' } as CreateStoreSettingDto,
      req,
    );
    expect(mockService.createStoreSetting).toHaveBeenCalledWith(
      'store-001',
      expect.any(Object),
      'u1',
    );
  });

  it('findAll calls service.findAllWithFilter', async () => {
    await controller.findAll('store-001', {
      key: 'k',
      page: 1,
      limit: 5,
    } as StoreSettingFilterDto);
    expect(mockService.findAllWithFilter).toHaveBeenCalled();
  });

  it('findByKey calls service.findByKey', async () => {
    await controller.findByKey('store-001', 'k');
    expect(mockService.findByKey).toHaveBeenCalledWith('store-001', 'k');
  });

  it('getSettingValue calls service.getSettingValue', async () => {
    await controller.getSettingValue('store-001', 'k');
    expect(mockService.getSettingValue).toHaveBeenCalledWith('store-001', 'k');
  });

  it('getByCategory calls service.getSettingsByCategory', async () => {
    await controller.getByCategory('store-001', 'email');
    expect(mockService.getSettingsByCategory).toHaveBeenCalledWith(
      'store-001',
      'email',
    );
  });

  it('findById calls service.findOne', async () => {
    await controller.findById('store-001', 'id1');
    expect(mockService.findOne).toHaveBeenCalledWith('store-001', 'id1');
  });

  it('update calls service.update', async () => {
    const req = { user: { id: 'u1' } } as RequestWithUser;
    await controller.update(
      'store-001',
      'id1',
      { settingValue: 'v' } as UpdateStoreSettingDto,
      req,
    );
    expect(mockService.update).toHaveBeenCalledWith(
      'store-001',
      'id1',
      { settingValue: 'v' },
      'u1',
    );
  });

  it('updateByKey calls service.updateByKey', async () => {
    const req = { user: { id: 'u1' } } as RequestWithUser;
    await controller.updateByKey('store-001', 'k', { value: 'v' }, req);
    expect(mockService.updateByKey).toHaveBeenCalledWith(
      'store-001',
      'k',
      'v',
      'u1',
    );
  });

  it('remove calls service.remove', async () => {
    await controller.remove('store-001', 'id1');
    expect(mockService.remove).toHaveBeenCalledWith('store-001', 'id1');
  });

  it('deleteByKey calls service.deleteByKey', async () => {
    await controller.deleteByKey('store-001', 'k');
    expect(mockService.deleteByKey).toHaveBeenCalledWith('store-001', 'k');
  });

  it('restore calls service.restore', async () => {
    await controller.restore('store-001', 'id1');
    expect(mockService.restore).toHaveBeenCalledWith('store-001', 'id1');
  });
});
