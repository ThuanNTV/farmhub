import { Injectable, NotFoundException } from '@nestjs/common';
import { ExternalSystemLog } from 'src/entities/tenant/external_system_log.entity';
import { CreateExternalSystemLogDto } from 'src/modules/external-system-logs/dto/create-externalSystemLog.dto';
import { UpdateExternalSystemLogDto } from 'src/modules/external-system-logs/dto/update-externalSystemLog.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { AuditMetadata } from 'src/common/types/common.types';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';

@Injectable()
export class ExternalSystemLogsService extends TenantBaseService<ExternalSystemLog> {
  protected primaryKey!: string;

  constructor(
    tenantDS: TenantDataSourceService,
    private auditLogAsyncService: AuditLogAsyncService,
  ) {
    super(tenantDS, ExternalSystemLog);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateExternalSystemLogDto,
  ): Promise<ExternalSystemLog> {
    const entityData = DtoMapper.mapToEntity<ExternalSystemLog>(
      dto as unknown as Record<string, unknown>,
    );
    const result = await super.create(storeId, entityData);

    // Audit logging for external system log creation
    await this.logAudit(storeId, 'CREATE', 'external_system_log', result.id, {
      action: 'CREATE',
      resource: 'external_system_log',
      resourceId: result.id,
      changes: {
        systemName: result.system_name,
        endpoint: result.endpoint,
        status: result.status,
      },
    });

    return result;
  }

  async findById(
    storeId: string,
    id: string,
  ): Promise<ExternalSystemLog | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<ExternalSystemLog> {
    const entity = await super.findById(storeId, id);
    if (!entity) {
      throw new NotFoundException(
        `External system log with ID ${id} not found`,
      );
    }
    return entity;
  }

  async findAll(storeId: string): Promise<ExternalSystemLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find();
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateExternalSystemLogDto,
  ): Promise<ExternalSystemLog> {
    const externalSystemLog = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<ExternalSystemLog>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(externalSystemLog, entityData);
    const result = await repo.save(updated);

    // Audit logging for external system log update
    await this.logAudit(storeId, 'UPDATE', 'external_system_log', result.id, {
      action: 'UPDATE',
      resource: 'external_system_log',
      resourceId: result.id,
      changes: {
        systemName: result.system_name,
        endpoint: result.endpoint,
        status: result.status,
      },
    });

    return result;
  }

  async remove(storeId: string, id: string) {
    const externalSystemLog = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    await repo.remove(externalSystemLog);

    // Audit logging for external system log deletion
    await this.logAudit(storeId, 'DELETE', 'external_system_log', id, {
      action: 'DELETE',
      resource: 'external_system_log',
      resourceId: id,
      changes: {
        systemName: externalSystemLog.system_name,
        endpoint: externalSystemLog.endpoint,
      },
    });

    return {
      message: `✅ External system log với ID "${id}" đã được xóa`,
      data: null,
    };
  }

  mapToResponseDto(entity: ExternalSystemLog) {
    return {
      id: entity.id,
      systemName: entity.system_name,
      endpoint: entity.endpoint,
      requestData: entity.request_data,
      responseData: entity.response_data,
      status: entity.status,
      responseTime: entity.response_time,
      errorMessage: entity.error_message,
      ipAddress: entity.ip_address,
      userAgent: entity.user_agent,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  // Audit logging implementation for tracking external system interactions
  private async logAudit(
    storeId: string,
    action: string,
    targetTable: string,
    targetId: string,
    metadata: AuditMetadata,
  ): Promise<void> {
    try {
      if (action === 'CREATE') {
        await this.auditLogAsyncService.logCreate(
          'system',
          'system',
          targetTable,
          targetId,
          metadata,
          storeId,
        );
      } else if (action === 'UPDATE') {
        await this.auditLogAsyncService.logUpdate(
          'system',
          'system',
          targetTable,
          targetId,
          {},
          metadata,
          storeId,
        );
      } else if (action === 'DELETE') {
        await this.auditLogAsyncService.logDelete(
          'system',
          'system',
          targetTable,
          targetId,
          metadata,
          storeId,
        );
      } else {
        await this.auditLogAsyncService.logCriticalAction(
          'system',
          'system',
          action,
          targetTable,
          targetId,
          metadata,
          storeId,
        );
      }
    } catch (error) {
      this.logger.error('Audit logging failed:', error);
    }
  }
}
