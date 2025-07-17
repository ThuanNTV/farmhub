import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Notification } from 'src/entities/tenant/notification.entity';
import { CreateNotificationDto } from 'src/modules/notification/dto/create-notification.dto';
import { NotificationResponseDto } from 'src/modules/notification/dto/notification-response.dto';
import { UpdateNotificationDto } from 'src/modules/notification/dto/update-notification.dto';

@Injectable()
export class NotificationService extends TenantBaseService<Notification> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Notification);
    this.primaryKey = 'id';
  }

  private mapToDto(entity: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.link = entity.link;
    dto.isRead = entity.is_read;
    dto.createdAt = entity.created_at;
    dto.createdByUserId = entity.created_by_user_id;
    dto.updatedByUserId = entity.updated_by_user_id;
    return dto;
  }

  async createNotification(storeId: string, dto: CreateNotificationDto) {
    const repo = await this.getRepo(storeId);
    const notification = repo.create(dto);
    const savedEntity = await repo.save(notification);
    return this.mapToDto(savedEntity);
  }

  async findAllNotifications(storeId: string) {
    const repo = await this.getRepo(storeId);
    const entities = await repo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
    return entities.map((entity) => this.mapToDto(entity));
  }

  async findOneNotification(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const notification = await repo.findOne({
      where: { id, is_deleted: false },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    return this.mapToDto(notification);
  }

  async updateNotification(
    storeId: string,
    id: string,
    dto: UpdateNotificationDto,
  ) {
    const repo = await this.getRepo(storeId);
    const notification = await repo.findOne({
      where: { id, is_deleted: false },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    const updated = repo.merge(notification, dto);
    const savedEntity = await repo.save(updated);
    return this.mapToDto(savedEntity);
  }

  async removeNotification(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const notification = await repo.findOne({
      where: { id, is_deleted: false },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    notification.is_deleted = true;
    await repo.save(notification);
    return {
      message: `✅ Notification with ID "${id}" has been deleted`,
      data: null,
    };
  }

  async restoreNotification(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const notification = await repo.findOne({
      where: { id, is_deleted: true },
    });
    if (!notification) {
      throw new InternalServerErrorException(
        'Notification does not exist or has not been soft deleted',
      );
    }
    notification.is_deleted = false;
    const savedEntity = await repo.save(notification);
    return {
      message: 'Notification restored successfully',
      data: this.mapToDto(savedEntity),
    };
  }

  async markAsRead(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const notification = await repo.findOne({
      where: { id, is_deleted: false },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    notification.is_read = true;
    const savedEntity = await repo.save(notification);
    return this.mapToDto(savedEntity);
  }

  async markAllAsRead(storeId: string) {
    const repo = await this.getRepo(storeId);
    await repo.update({ is_deleted: false, is_read: false }, { is_read: true });
    return {
      message: 'All notifications marked as read successfully',
    };
  }
}
