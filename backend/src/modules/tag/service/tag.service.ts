import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Tag } from 'src/entities/tenant/tag.entity';
import { CreateTagDto } from 'src/modules/tag/dto/create-tag.dto';
import { UpdateTagDto } from 'src/modules/tag/dto/update-tag.dto';

@Injectable()
export class TagService extends TenantBaseService<Tag> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Tag);
    this.primaryKey = 'id';
  }

  async create(storeId: string, dto: CreateTagDto): Promise<Tag> {
    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<Tag>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<Tag | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<Tag> {
    return await super.findByIdOrFail(storeId, id);
  }

  async findAll(storeId: string): Promise<Tag[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, isDeleted: false },
      relations: ['createdByUser', 'updatedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(storeId: string): Promise<Tag[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, isDeleted: false, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByName(storeId: string, name: string): Promise<Tag | null> {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({
      where: { storeId, name, isDeleted: false },
    });
  }

  async update(storeId: string, id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    // Check if name already exists (if name is being updated)
    if (dto.name && dto.name !== tag.name) {
      const existingTag = await this.findByName(storeId, dto.name);
      if (existingTag) {
        throw new InternalServerErrorException(
          `❌ Tag với tên "${dto.name}" đã tồn tại`,
        );
      }
    }

    const entityData = DtoMapper.mapToEntity<Tag>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(tag, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const tag = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Soft delete
    tag.isDeleted = true;
    tag.deletedAt = new Date();
    await repo.save(tag);

    return {
      message: `✅ Tag với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const tag = await repo.findOne({
      where: { id, storeId, isDeleted: true },
    });

    if (!tag) {
      throw new NotFoundException(
        `Tag với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    tag.isDeleted = false;
    tag.deletedAt = undefined;
    const restored = await repo.save(tag);

    return {
      message: `✅ Tag với ID "${id}" đã được khôi phục`,
      data: restored,
    };
  }

  private async validateForeignKeys(
    storeId: string,
    dto: CreateTagDto | UpdateTagDto,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);

    // Validate created_by_user_id exists
    if (dto.createdByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.createdByUserId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.createdByUserId} not found`,
        );
      }
    }

    // Validate updated_by_user_id exists (only for UpdateTagDto)
    if ('updatedByUserId' in dto && dto.updatedByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.updatedByUserId, is_deleted: false },
      });
      if (!user) {
        if (typeof dto.updatedByUserId !== 'string') {
          throw new BadRequestException('Invalid user ID');
        }

        throw new NotFoundException(
          `User with ID ${dto.updatedByUserId} not found`,
        );
      }
    }
  }
}
