import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { StoreSetting } from 'src/entities/tenant/store_setting.entity';
import { CreateStoreSettingDto } from 'src/modules/store-settings/dto/create-storeSetting.dto';
import { UpdateStoreSettingDto } from 'src/modules/store-settings/dto/update-storeSetting.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { Like } from 'typeorm';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class StoreSettingsService extends TenantBaseService<StoreSetting> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, StoreSetting);
    this.primaryKey = 'id';
  }

  async createStoreSetting(
    storeId: string,
    dto: CreateStoreSettingDto,
    userId?: string,
  ): Promise<StoreSetting> {
    // Validate required fields
    if (!dto.settingKey) {
      throw new BadRequestException('Setting key is required');
    }

    // Validate setting key format
    this.validateSettingKey(dto.settingKey);

    // Validate setting value if provided
    if (dto.settingValue) {
      this.validateSettingValue(dto.settingValue);
    }

    const repo = await this.getRepo(storeId);

    // Check for duplicate setting key
    const existingSetting = await repo.findOne({
      where: { setting_key: dto.settingKey, is_deleted: false },
    });

    if (existingSetting) {
      throw new ConflictException(
        `Setting with key "${dto.settingKey}" already exists`,
      );
    }

    const entityData = DtoMapper.mapToEntity<StoreSetting>({
      ...dto,
      store_id: storeId,
      created_by_user_id: userId,
      updated_by_user_id: userId,
    } as unknown as Record<string, unknown>);

    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<StoreSetting | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<StoreSetting> {
    return await super.findByIdOrFail(storeId, id);
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false },
      order: { setting_key: 'ASC' },
    });
  }

  async findByKey(
    storeId: string,
    settingKey: string,
  ): Promise<StoreSetting | null> {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({
      where: { setting_key: settingKey, is_deleted: false },
    });
  }

  async getSettingValue(
    storeId: string,
    settingKey: string,
  ): Promise<string | null> {
    const setting = await this.findByKey(storeId, settingKey);
    return setting?.setting_value ?? null;
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateStoreSettingDto,
    userId?: string,
  ) {
    const storeSetting = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Validate setting key if provided
    if (dto.settingKey) {
      this.validateSettingKey(dto.settingKey);

      // Check for duplicate setting key if key is being changed
      if (dto.settingKey !== storeSetting.setting_key) {
        const existingSetting = await repo.findOne({
          where: { setting_key: dto.settingKey, is_deleted: false },
        });

        if (existingSetting) {
          throw new ConflictException(
            `Setting with key "${dto.settingKey}" already exists`,
          );
        }
      }
    }

    // Validate setting value if provided
    if (dto.settingValue) {
      this.validateSettingValue(dto.settingValue);
    }

    const entityData = DtoMapper.mapToEntity<StoreSetting>({
      ...dto,
      updated_by_user_id: userId,
    } as unknown as Record<string, unknown>);

    const updated = repo.merge(storeSetting, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const storeSetting = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Soft delete
    storeSetting.is_deleted = true;
    await repo.save(storeSetting);

    return {
      message: `✅ StoreSetting với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const storeSetting = await repo.findOne({
      where: { id, is_deleted: true },
    });

    if (!storeSetting) {
      throw new BadRequestException(
        'StoreSetting không tồn tại hoặc chưa bị xóa mềm',
      );
    }

    storeSetting.is_deleted = false;
    await repo.save(storeSetting);

    return {
      message: 'Khôi phục store setting thành công',
      data: storeSetting,
    };
  }

  async updateByKey(
    storeId: string,
    settingKey: string,
    value: string,
    userId?: string,
  ) {
    const setting = await this.findByKey(storeId, settingKey);

    if (!setting) {
      // Create new setting if it doesn't exist
      return await this.createStoreSetting(
        storeId,
        {
          storeId,
          settingKey,
          settingValue: value,
        },
        userId,
      );
    }

    // Update existing setting
    return await this.update(
      storeId,
      setting.id,
      {
        settingValue: value,
      },
      userId,
    );
  }

  async getSettingsByCategory(storeId: string, category: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: {
        setting_key: Like(`${category}.%`),
        is_deleted: false,
      },
      order: { setting_key: 'ASC' },
    });
  }

  async deleteByKey(storeId: string, settingKey: string) {
    const setting = await this.findByKey(storeId, settingKey);

    if (!setting) {
      throw new BadRequestException(
        `Setting with key "${settingKey}" not found`,
      );
    }

    return await this.remove(storeId, setting.id);
  }

  private validateSettingKey(key: string): void {
    // Validate setting key format (alphanumeric, dots, underscores, hyphens)
    const keyRegex = /^[a-zA-Z0-9._-]+$/;

    if (!keyRegex.test(key)) {
      throw new BadRequestException(
        'Setting key can only contain alphanumeric characters, dots, underscores, and hyphens',
      );
    }

    if (key.length < 1 || key.length > 255) {
      throw new BadRequestException(
        'Setting key must be between 1 and 255 characters',
      );
    }
  }

  private validateSettingValue(value: string): void {
    // Check if value is valid JSON
    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
      try {
        JSON.parse(value);
      } catch {
        throw new BadRequestException('Invalid JSON format in setting value');
      }
    }

    // Check for maximum length
    if (value.length > 65535) {
      // TEXT field limit
      throw new BadRequestException(
        'Setting value is too long (maximum 65535 characters)',
      );
    }
  }
}
