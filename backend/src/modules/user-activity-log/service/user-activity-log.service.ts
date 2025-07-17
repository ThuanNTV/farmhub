import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserActivityLog } from 'src/entities/tenant/user_activity_log.entity';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class UserActivityLogService extends TenantBaseService<UserActivityLog> {
  protected readonly logger = new Logger(UserActivityLogService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, UserActivityLog);
    this.primaryKey = 'id';
  }

  async getAll(storeId: string) {
    try {
      this.logger.debug(`Getting all user activity logs for store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const logs = await repo.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      this.logger.debug(`Found ${logs.length} user activity logs`);
      return logs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get all user activity logs: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async create(storeId: string, data: Partial<UserActivityLog>) {
    try {
      this.logger.log(`Creating user activity log for store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const entity = repo.create(data);
      const saved = await repo.save(entity);
      this.logger.log(`User activity log created successfully: ${saved.id}`);
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create user activity log: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to create user activity log: ${errorMessage}`,
      );
    }
  }

  async getLog(storeId: string, id: string) {
    try {
      this.logger.debug(
        `Getting user activity log by ID: ${id} in store: ${storeId}`,
      );
      const log = await this.findByIdOrFail(storeId, id);
      if (log.is_deleted) {
        throw new NotFoundException(
          `User activity log with ID ${id} not found`,
        );
      }
      this.logger.debug(`User activity log found: ${id}`);
      return log;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get user activity log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async filter(storeId: string, userId?: string) {
    try {
      this.logger.debug(
        `Filtering user activity logs for store: ${storeId}, userId: ${userId ?? 'all'}`,
      );
      const repo = await this.getRepo(storeId);
      const whereCondition = { is_deleted: false };
      if (userId) {
        whereCondition['user_id'] = userId;
      }
      const logs = await repo.find({
        where: whereCondition,
        order: { created_at: 'DESC' },
      });
      this.logger.debug(`Found ${logs.length} filtered user activity logs`);
      return logs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to filter user activity logs: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
