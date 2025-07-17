import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { AuditLogResponseDto } from 'src/modules/audit-logs/dto/audit-log-response.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class AuditLogsService extends TenantBaseService<AuditLog> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, AuditLog);
    this.primaryKey = 'id';
  }

  async create(storeId: string, dto: CreateAuditLogDto): Promise<AuditLog> {
    const entityData = DtoMapper.mapToEntity<AuditLog>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<AuditLog | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<AuditLog> {
    const entity = await super.findById(storeId, id);
    if (!entity) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return entity;
  }

  async findAll(storeId: string): Promise<AuditLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find();
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateAuditLogDto,
  ): Promise<AuditLog> {
    const auditLog = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<AuditLog>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(auditLog, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const auditLog = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    await repo.remove(auditLog);
    return {
      message: `\u2705 AuditLog với ID "${id}" đã được xóa`,
      data: null,
    };
  }

  mapToResponseDto(entity: AuditLog): AuditLogResponseDto {
    return {
      id: entity.id,
      userId: entity.user_id,
      action: entity.action,
      targetTable: entity.target_table,
      targetId: entity.target_id,
      metadata: entity.metadata,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      isDeleted: entity.is_deleted,
      deletedAt: entity.deleted_at,
    };
  }
}
