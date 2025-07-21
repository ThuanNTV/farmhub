import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { AuditLogResponseDto } from 'src/modules/audit-logs/dto/audit-log-response.dto';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';
import {
  AuditLogFilterDto,
  AuditLogStatsDto,
  PaginatedAuditLogResponseDto,
  DateRangeDto,
} from '../dto/audit-log-filter.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';

@Injectable()
export class AuditLogsService extends TenantBaseService<AuditLog> {
  protected primaryKey!: string;
  protected readonly logger = new Logger(AuditLogsService.name);

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, AuditLog);
    this.primaryKey = 'id';
  }

  async create(storeId: string, dto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      this.logger.debug(`Creating audit log for store: ${storeId}`);

      const entityData = {
        user_id: dto.userId,
        action: dto.action,
        target_table: dto.targetTable,
        target_id: dto.targetId,
        store_id: dto.storeId,
        ip_address: dto.ipAddress,
        user_agent: dto.userAgent,
        session_id: dto.sessionId,
        device: dto.device,
        browser: dto.browser,
        os: dto.os,
        user_name: dto.userName,
        old_value: dto.oldValue,
        new_value: dto.newValue,
        metadata: dto.metadata,
        details: dto.details,
      };

      return await super.create(storeId, entityData);
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
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
      storeId: entity.store_id,
      ipAddress: entity.ip_address,
      userAgent: entity.user_agent,
      sessionId: entity.session_id,
      device: entity.device,
      browser: entity.browser,
      os: entity.os,
      userName: entity.user_name,
      oldValue: entity.old_value,
      newValue: entity.new_value,
      metadata: entity.metadata,
      details: entity.details,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      isDeleted: entity.is_deleted,
      deletedAt: entity.deleted_at,
    };
  }

  /**
   * Find audit logs with advanced filtering
   * @param storeId - Store ID
   * @param filters - Filter parameters
   * @returns Paginated audit logs
   */
  async findWithFilters(
    storeId: string,
    filters: AuditLogFilterDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    try {
      this.logger.debug(
        `Finding audit logs with filters for store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const queryBuilder = repo
        .createQueryBuilder('audit_log')
        .where('audit_log.store_id = :storeId', { storeId })
        .andWhere('audit_log.is_deleted = :isDeleted', { isDeleted: false });

      // Apply filters
      if (filters.userId) {
        queryBuilder.andWhere('audit_log.user_id = :userId', {
          userId: filters.userId,
        });
      }

      if (filters.action) {
        queryBuilder.andWhere('audit_log.action = :action', {
          action: filters.action,
        });
      }

      if (filters.actions && filters.actions.length > 0) {
        queryBuilder.andWhere('audit_log.action IN (:...actions)', {
          actions: filters.actions,
        });
      }

      if (filters.targetTable) {
        queryBuilder.andWhere('audit_log.target_table = :targetTable', {
          targetTable: filters.targetTable,
        });
      }

      if (filters.targetTables && filters.targetTables.length > 0) {
        queryBuilder.andWhere('audit_log.target_table IN (:...targetTables)', {
          targetTables: filters.targetTables,
        });
      }

      if (filters.targetId) {
        queryBuilder.andWhere('audit_log.target_id = :targetId', {
          targetId: filters.targetId,
        });
      }

      if (filters.ipAddress) {
        queryBuilder.andWhere('audit_log.ip_address = :ipAddress', {
          ipAddress: filters.ipAddress,
        });
      }

      if (filters.device) {
        queryBuilder.andWhere('audit_log.device = :device', {
          device: filters.device,
        });
      }

      if (filters.browser) {
        queryBuilder.andWhere('audit_log.browser = :browser', {
          browser: filters.browser,
        });
      }

      if (filters.userName) {
        queryBuilder.andWhere('audit_log.user_name ILIKE :userName', {
          userName: `%${filters.userName}%`,
        });
      }

      // Date range filter
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere(
          'audit_log.created_at BETWEEN :startDate AND :endDate',
          {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        );
      } else if (filters.startDate) {
        queryBuilder.andWhere('audit_log.created_at >= :startDate', {
          startDate: filters.startDate,
        });
      } else if (filters.endDate) {
        queryBuilder.andWhere('audit_log.created_at <= :endDate', {
          endDate: filters.endDate,
        });
      }

      // Search filter
      if (filters.search) {
        queryBuilder.andWhere(
          '(audit_log.action ILIKE :search OR audit_log.target_table ILIKE :search OR audit_log.user_name ILIKE :search OR audit_log.details ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      // Sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'DESC';
      queryBuilder.orderBy(`audit_log.${sortBy}`, sortOrder);

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [logs, total] = await queryBuilder.getManyAndCount();

      return {
        data: logs.map((log) => this.mapToResponseDto(log)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        appliedFilters: {
          userId: filters.userId,
          action: filters.action,
          targetTable: filters.targetTable,
          dateRange:
            filters.startDate && filters.endDate
              ? {
                  startDate: filters.startDate,
                  endDate: filters.endDate,
                }
              : undefined,
          search: filters.search,
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to find audit logs with filters: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get audit log statistics
   * @param storeId - Store ID
   * @param dateRange - Optional date range
   * @returns Statistics
   */
  async getStatistics(
    storeId: string,
    dateRange?: DateRangeDto,
  ): Promise<AuditLogStatsDto> {
    try {
      this.logger.debug(`Getting audit log statistics for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const baseQuery = repo
        .createQueryBuilder('audit_log')
        .where('audit_log.store_id = :storeId', { storeId })
        .andWhere('audit_log.is_deleted = :isDeleted', { isDeleted: false });

      if (dateRange) {
        baseQuery.andWhere(
          'audit_log.created_at BETWEEN :startDate AND :endDate',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        );
      }

      // Total logs
      const totalLogs = await baseQuery.getCount();

      // Logs by action
      const actionStats = await baseQuery
        .select('audit_log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.action')
        .orderBy('count', 'DESC')
        .getRawMany();

      const logsByAction: Record<string, number> = {};
      actionStats.forEach((stat) => {
        logsByAction[stat.action] = parseInt(stat.count);
      });

      // Logs by table
      const tableStats = await baseQuery
        .select('audit_log.target_table', 'target_table')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.target_table')
        .orderBy('count', 'DESC')
        .getRawMany();

      const logsByTable: Record<string, number> = {};
      tableStats.forEach((stat) => {
        logsByTable[stat.target_table] = parseInt(stat.count);
      });

      // Logs by user
      const userStats = await baseQuery
        .select('audit_log.user_id', 'user_id')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.user_id')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const logsByUser: Record<string, number> = {};
      userStats.forEach((stat) => {
        logsByUser[stat.user_id] = parseInt(stat.count);
      });

      // Logs by device
      const deviceStats = await baseQuery
        .select('audit_log.device', 'device')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.device IS NOT NULL')
        .groupBy('audit_log.device')
        .orderBy('count', 'DESC')
        .getRawMany();

      const logsByDevice: Record<string, number> = {};
      deviceStats.forEach((stat) => {
        logsByDevice[stat.device] = parseInt(stat.count);
      });

      // Logs by browser
      const browserStats = await baseQuery
        .select('audit_log.browser', 'browser')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.browser IS NOT NULL')
        .groupBy('audit_log.browser')
        .orderBy('count', 'DESC')
        .getRawMany();

      const logsByBrowser: Record<string, number> = {};
      browserStats.forEach((stat) => {
        logsByBrowser[stat.browser] = parseInt(stat.count);
      });

      // Recent activity
      const recentActivity = await baseQuery
        .select([
          'audit_log.action',
          'audit_log.target_table',
          'audit_log.user_name',
          'audit_log.created_at',
        ])
        .addSelect('COUNT(*)', 'count')
        .groupBy(
          'audit_log.action, audit_log.target_table, audit_log.user_name, audit_log.created_at',
        )
        .orderBy('audit_log.created_at', 'DESC')
        .limit(10)
        .getRawMany();

      return {
        totalLogs,
        logsByAction,
        logsByTable,
        logsByUser,
        logsByDevice,
        logsByBrowser,
        recentActivity: recentActivity.map((activity) => ({
          action: activity.action,
          targetTable: activity.target_table,
          userName: activity.user_name || 'Unknown',
          createdAt: activity.created_at,
          count: parseInt(activity.count),
        })),
        dailyStats: [], // TODO: Implement daily stats
        topActiveUsers: [], // TODO: Implement top active users
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get audit log statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get change history for a specific record
   * @param storeId - Store ID
   * @param targetTable - Target table
   * @param targetId - Target record ID
   * @returns Change history
   */
  async getChangeHistory(
    storeId: string,
    targetTable: string,
    targetId: string,
  ): Promise<AuditLogResponseDto[]> {
    try {
      this.logger.debug(
        `Getting change history for ${targetTable}:${targetId} in store: ${storeId}`,
      );

      const repo = await this.getRepo(storeId);
      const logs = await repo.find({
        where: {
          store_id: storeId,
          target_table: targetTable,
          target_id: targetId,
          is_deleted: false,
        },
        order: {
          created_at: 'DESC',
        },
      });

      return logs.map((log) => this.mapToResponseDto(log));
    } catch (error) {
      this.logger.error(
        `Failed to get change history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
