import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  WebhookLog,
  WebhookType,
} from 'src/entities/tenant/webhook_log.entity';
import { CreateWebhookLogDto } from 'src/modules/webhook-logs/dto/create-webhookLog.dto';
import { UpdateWebhookLogDto } from 'src/modules/webhook-logs/dto/update-webhookLog.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { WebhookPayload } from 'src/common/types/common.types';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

interface WebhookStatRow {
  total_webhooks: string;
  successful_webhooks: string;
  failed_webhooks: string;
  type: string;
  eventType: string;
}

@Injectable()
export class WebhookLogsService extends TenantBaseService<WebhookLog> {
  protected readonly logger = new Logger(WebhookLogsService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, WebhookLog);
    this.primaryKey = 'id';
  }

  async createWebhookLogs(
    storeId: string,
    dto: CreateWebhookLogDto,
  ): Promise<WebhookLog> {
    try {
      this.logger.log(`Creating webhook log for store: ${storeId}`);
      // Validate JSON payload
      if (dto.requestPayload) {
        this.validateJsonPayload(
          dto.requestPayload as unknown as WebhookPayload,
        );
      }

      // Validate event type
      this.validateEventType(dto.eventType);

      // Validate type (outgoing/incoming)
      this.validateWebhookType(dto.eventType);

      const entityData = DtoMapper.mapToEntity<WebhookLog>(
        dto as unknown as Record<string, unknown>,
      );
      const webhookLog = await super.create(storeId, entityData);
      this.logger.log(`Webhook log created successfully: ${webhookLog.id}`);
      return webhookLog;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create webhook log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findById(storeId: string, id: string): Promise<WebhookLog | null> {
    try {
      this.logger.debug(
        `Finding webhook log by ID: ${id} in store: ${storeId}`,
      );
      const webhookLog = await super.findById(storeId, id);
      this.logger.debug(`Webhook log found: ${webhookLog ? 'yes' : 'no'}`);
      return webhookLog;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find webhook log by ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<WebhookLog> {
    try {
      this.logger.debug(
        `Finding webhook log by ID: ${id} in store: ${storeId}`,
      );
      const webhookLog = await super.findByIdOrFail(storeId, id);
      if (webhookLog.is_deleted) {
        throw new NotFoundException(`Webhook log with ID ${id} not found`);
      }
      this.logger.debug(`Webhook log found: ${id}`);
      return webhookLog;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find webhook log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAll(storeId: string) {
    try {
      this.logger.debug(`Finding all webhook logs for store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const webhookLogs = await repo.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      this.logger.debug(`Found ${webhookLogs.length} webhook logs`);
      return webhookLogs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find all webhook logs: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async update(storeId: string, id: string, dto: UpdateWebhookLogDto) {
    try {
      this.logger.log(`Updating webhook log: ${id} in store: ${storeId}`);
      const webhookLog = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);

      // Validate JSON payload if provided
      if (dto.payload) {
        this.validateJsonPayload(dto.payload as unknown as WebhookPayload);
      }

      // Validate event type if provided
      if (dto.eventType) {
        this.validateEventType(dto.eventType);
      }

      // Validate type if provided
      if (dto.type) {
        this.validateWebhookType(dto.type);
      }

      const entityData = DtoMapper.mapToEntity<WebhookLog>(
        dto as unknown as Record<string, unknown>,
      );
      const updated = repo.merge(webhookLog, entityData);
      const saved = await repo.save(updated);
      this.logger.log(`Webhook log updated successfully: ${id}`);
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update webhook log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async remove(storeId: string, id: string) {
    try {
      this.logger.log(`Removing webhook log: ${id} from store: ${storeId}`);
      const webhookLog = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);

      // Soft delete
      webhookLog.is_deleted = true;
      await repo.save(webhookLog);
      this.logger.log(`Webhook log soft deleted successfully: ${id}`);

      return {
        message: `✅ WebhookLog với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove webhook log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      this.logger.log(`Restoring webhook log: ${id} in store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const webhookLog = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!webhookLog) {
        throw new NotFoundException(
          'WebhookLog không tồn tại hoặc chưa bị xóa mềm',
        );
      }

      webhookLog.is_deleted = false;
      const restored = await repo.save(webhookLog);
      this.logger.log(`Webhook log restored successfully: ${id}`);

      return {
        message: 'Khôi phục webhook log thành công',
        data: restored,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore webhook log: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findByEventType(storeId: string, eventType: string) {
    try {
      this.logger.debug(
        `Finding webhook logs by event type: ${eventType} in store: ${storeId}`,
      );
      const repo = await this.getRepo(storeId);
      const webhookLogs = await repo.find({
        where: { event_type: eventType, is_deleted: false },
        order: { created_at: 'DESC' },
      });
      this.logger.debug(
        `Found ${webhookLogs.length} webhook logs for event type: ${eventType}`,
      );
      return webhookLogs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find webhook logs by event type: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findByType(storeId: string, type: string) {
    try {
      this.logger.debug(
        `Finding webhook logs by type: ${type} in store: ${storeId}`,
      );
      const repo = await this.getRepo(storeId);
      const webhookLogs = await repo.find({
        where: {
          type: WebhookType[type as keyof typeof WebhookType],
          is_deleted: false,
        },
        order: { created_at: 'DESC' },
      });
      this.logger.debug(
        `Found ${webhookLogs.length} webhook logs for type: ${type}`,
      );
      return webhookLogs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find webhook logs by type: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getWebhookStats(storeId: string) {
    try {
      this.logger.debug(`Getting webhook stats for store: ${storeId}`);
      const repo = await this.getRepo(storeId);

      const stats = await repo
        .createQueryBuilder('webhook')
        .select([
          'COUNT(*) as total_webhooks',
          'SUM(CASE WHEN is_success = true THEN 1 ELSE 0 END) as successful_webhooks',
          'SUM(CASE WHEN is_success = false THEN 1 ELSE 0 END) as failed_webhooks',
          'webhook.type',
          'webhook.eventType',
        ])
        .where('is_deleted = :is_deleted', { is_deleted: false })
        .groupBy('webhook.type, webhook.eventType')
        .getRawMany<WebhookStatRow>();

      const result = {
        total: stats.reduce(
          (sum, stat) => sum + parseInt(stat.total_webhooks),
          0,
        ),
        successful: stats.reduce(
          (sum, stat) => sum + parseInt(stat.successful_webhooks),
          0,
        ),
        failed: stats.reduce(
          (sum, stat) => sum + parseInt(stat.failed_webhooks),
          0,
        ),
        by_type: stats.map((stat) => ({
          type: stat.type,
          event_type: stat.eventType,
          total: parseInt(stat.total_webhooks),
          successful: parseInt(stat.successful_webhooks),
          failed: parseInt(stat.failed_webhooks),
        })),
      };

      this.logger.debug(
        `Webhook stats retrieved: ${result.total} total, ${result.successful} successful, ${result.failed} failed`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get webhook stats: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to get webhook stats: ${errorMessage}`,
      );
    }
  }

  private validateJsonPayload(payload: WebhookPayload): void {
    try {
      if (typeof payload === 'string') {
        JSON.parse(payload);
      } else if (typeof payload !== 'object') {
        throw new BadRequestException(
          'Payload must be a valid JSON object or string',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid JSON format in payload');
    }
  }

  private validateEventType(eventType: string): void {
    const validEventTypes = [
      'order.created',
      'order.updated',
      'order.cancelled',
      'payment.completed',
      'payment.failed',
      'customer.created',
      'customer.updated',
      'product.created',
      'product.updated',
      'inventory.updated',
    ];

    if (!validEventTypes.includes(eventType)) {
      throw new BadRequestException(
        `Invalid event type. Valid types: ${validEventTypes.join(', ')}`,
      );
    }
  }

  private validateWebhookType(type: string): void {
    const validTypes = ['outgoing', 'incoming'];

    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid webhook type. Valid types: ${validTypes.join(', ')}`,
      );
    }
  }
}
