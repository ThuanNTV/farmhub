import { Test, TestingModule } from '@nestjs/testing';
import { StoreSettingsService } from '@modules/store-settings/service/store-settings.service';
import {
  createTenantServiceTestSetup,
  setupSuccessfulRepositoryMocks,
  TEST_STORE_ID,
  TEST_USER_ID,
  resetMocks,
} from '../../../../utils/tenant-datasource-mock.util';
import { StoreSetting } from 'src/entities/tenant/store_setting.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

describe('StoreSettingsService (unit)', () => {
  const setup = createTenantServiceTestSetup<StoreSetting>();
  let service: StoreSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreSettingsService,
        {
          provide: TenantDataSourceService,
          useValue: setup.mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<StoreSettingsService>(StoreSettingsService);

    // Bypass tenant datasource and return mocked repository directly
    jest
      .spyOn(service as any, 'getRepo')
      .mockResolvedValue(
        setup.mockRepository as unknown as Repository<StoreSetting>,
      );

    const entity: StoreSetting = {
      id: 'id-1',
      store_id: TEST_STORE_ID,
      setting_key: 'email.smtp_host',
      setting_value: 'smtp.example.com',
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by_user_id: TEST_USER_ID,
      updated_by_user_id: TEST_USER_ID,
    } as StoreSetting;

    setupSuccessfulRepositoryMocks(setup.mockRepository, entity);
  });

  afterEach(() => {
    resetMocks(setup);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStoreSetting', () => {
    it('creates new setting when key not exists', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      const created = await service.createStoreSetting(
        TEST_STORE_ID,
        {
          storeId: TEST_STORE_ID,
          settingKey: 'email.from',
          settingValue: 'noreply@example.com',
        },
        TEST_USER_ID,
      );
      expect(created).toBeDefined();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('throws on missing key', async () => {
      await expect(
        service.createStoreSetting(
          TEST_STORE_ID,
          // @ts-expect-error testing validation
          { storeId: TEST_STORE_ID, settingValue: 'x' },
          TEST_USER_ID,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws on invalid key characters', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.createStoreSetting(
          TEST_STORE_ID,
          {
            storeId: TEST_STORE_ID,
            settingKey: 'invalid key',
            settingValue: 'x',
          },
          TEST_USER_ID,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws on duplicate key', async () => {
      setup.mockRepository.findOne.mockResolvedValue({
        id: 'dup',
      } as Partial<StoreSetting> as StoreSetting);
      await expect(
        service.createStoreSetting(
          TEST_STORE_ID,
          { storeId: TEST_STORE_ID, settingKey: 'dup', settingValue: 'x' },
          TEST_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('validates JSON settingValue', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.createStoreSetting(
          TEST_STORE_ID,
          {
            storeId: TEST_STORE_ID,
            settingKey: 'json',
            settingValue: '{ invalid',
          },
          TEST_USER_ID,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAllWithFilter', () => {
    it('applies key/value filters and pagination', async () => {
      const result = await service.findAllWithFilter(TEST_STORE_ID, {
        key: 'email',
        value: 'smtp',
        page: 2,
        limit: 10,
      });
      expect(setup.mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('update', () => {
    it('updates value and checks duplicate when key changes', async () => {
      // existing setting
      const existing: Partial<StoreSetting> = {
        id: 'id-1',
        setting_key: 'old.key',
        is_deleted: false,
      };
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(existing as StoreSetting);

      // no duplicate
      setup.mockRepository.findOne.mockResolvedValue(null);

      await service.update(
        TEST_STORE_ID,
        'id-1',
        { settingKey: 'new.key', settingValue: 'v' },
        TEST_USER_ID,
      );

      expect(setup.mockRepository.merge).toHaveBeenCalled();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('throws Conflict when new key already exists', async () => {
      const existing: Partial<StoreSetting> = {
        id: 'id-1',
        setting_key: 'old.key',
        is_deleted: false,
      };
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(existing as StoreSetting);
      setup.mockRepository.findOne.mockResolvedValue({
        id: 'other',
      } as Partial<StoreSetting> as StoreSetting);

      await expect(
        service.update(
          TEST_STORE_ID,
          'id-1',
          { settingKey: 'dup' },
          TEST_USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('updateByKey', () => {
    it('creates when not exists', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      const res = await service.updateByKey(
        TEST_STORE_ID,
        'new.key',
        'value',
        TEST_USER_ID,
      );
      expect(setup.mockRepository.save).toHaveBeenCalled();
      expect(res).toBeDefined();
    });

    it('updates when exists', async () => {
      setup.mockRepository.findOne.mockResolvedValue({
        id: 'id-1',
        setting_key: 'k',
        is_deleted: false,
      } as Partial<StoreSetting> as StoreSetting);
      const res = await service.updateByKey(
        TEST_STORE_ID,
        'k',
        'new-value',
        TEST_USER_ID,
      );
      expect(setup.mockRepository.merge).toHaveBeenCalled();
      expect(setup.mockRepository.save).toHaveBeenCalled();
      expect(res).toBeDefined();
    });
  });

  describe('deleteByKey/remove/restore', () => {
    it('deleteByKey throws when missing', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.deleteByKey(TEST_STORE_ID, 'missing'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('remove performs soft delete and restore succeeds', async () => {
      // findOne used by remove
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'id-1',
        is_deleted: false,
      } as Partial<StoreSetting> as StoreSetting);

      const res = await service.remove(TEST_STORE_ID, 'id-1');
      expect(res).toHaveProperty('message');
      expect(setup.mockRepository.save).toHaveBeenCalled();

      // restore path
      setup.mockRepository.findOne.mockResolvedValue({
        id: 'id-1',
        is_deleted: true,
      } as Partial<StoreSetting> as StoreSetting);
      const restored = await service.restore(TEST_STORE_ID, 'id-1');
      expect(restored).toHaveProperty('data');
    });

    it('restore throws when not soft-deleted', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.restore(TEST_STORE_ID, 'not-exist'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getters', () => {
    it('findByKey and getSettingValue return expected', async () => {
      setup.mockRepository.findOne.mockResolvedValue({
        id: 'id-1',
        setting_value: 'val',
        is_deleted: false,
      } as Partial<StoreSetting> as StoreSetting);
      const found = await service.findByKey(TEST_STORE_ID, 'k');
      expect(found).toBeDefined();
      const value = await service.getSettingValue(TEST_STORE_ID, 'k');
      expect(value).toBe('val');
    });

    it('getSettingsByCategory builds Like condition', async () => {
      await service.getSettingsByCategory(TEST_STORE_ID, 'email');
      expect(setup.mockRepository.find).toHaveBeenCalled();
    });
  });
});
