import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationService } from 'src/service/global/notification.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Notification } from 'src/entities/tenant/notification.entity';
import { CreateNotificationDto } from 'src/modules/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from 'src/modules/notification/dto/update-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      merge: jest.fn(),
      update: jest.fn(),
    };

    const mockDataSource = {
      isInitialized: true,
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn().mockResolvedValue(mockDataSource),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const storeId = 'store-1';
      const createDto = new CreateNotificationDto();
      createDto.type = 'INFO';
      createDto.title = 'Test Notification';
      createDto.description = 'Test Description';

      const mockNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification(storeId, createDto);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual({
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        isRead: false,
        createdAt: expect.any(Date),
        createdByUserId: 'user-1',
        updatedByUserId: null,
      });
    });
  });

  describe('findAllNotifications', () => {
    it('should return all notifications', async () => {
      const storeId = 'store-1';
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'INFO',
          title: 'Notification 1',
          description: 'Description 1',
          link: null,
          is_read: false,
          created_at: new Date(),
          created_by_user_id: 'user-1',
          updated_by_user_id: null,
        },
        {
          id: 'notif-2',
          type: 'WARNING',
          title: 'Notification 2',
          description: 'Description 2',
          link: '/test',
          is_read: true,
          created_at: new Date(),
          created_by_user_id: 'user-2',
          updated_by_user_id: 'user-1',
        },
      ];

      mockRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.findAllNotifications(storeId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'notif-1',
        type: 'INFO',
        title: 'Notification 1',
        description: 'Description 1',
        link: null,
        isRead: false,
        createdAt: expect.any(Date),
        createdByUserId: 'user-1',
        updatedByUserId: null,
      });
    });

    it('should return empty array when no notifications found', async () => {
      const storeId = 'store-1';
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllNotifications(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findOneNotification', () => {
    it('should return notification when found', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const mockNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
      };

      mockRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOneNotification(storeId, notificationId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: false },
      });
      expect(result).toEqual({
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        isRead: false,
        createdAt: expect.any(Date),
        createdByUserId: 'user-1',
        updatedByUserId: null,
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneNotification(storeId, notificationId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: false },
      });
    });
  });

  describe('updateNotification', () => {
    it('should update notification successfully', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const updateDto = new UpdateNotificationDto();
      updateDto.title = 'Updated Title';
      updateDto.description = 'Updated Description';

      const existingNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Original Title',
        description: 'Original Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
      };

      const updatedNotification = {
        ...existingNotification,
        title: 'Updated Title',
        description: 'Updated Description',
      };

      mockRepository.findOne.mockResolvedValue(existingNotification);
      mockRepository.merge.mockReturnValue(updatedNotification);
      mockRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.updateNotification(
        storeId,
        notificationId,
        updateDto,
      );

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: false },
      });
      expect(mockRepository.merge).toHaveBeenCalledWith(
        existingNotification,
        updateDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(updatedNotification);
      expect(result).toEqual({
        id: 'notif-1',
        type: 'INFO',
        title: 'Updated Title',
        description: 'Updated Description',
        link: null,
        isRead: false,
        createdAt: expect.any(Date),
        createdByUserId: 'user-1',
        updatedByUserId: null,
      });
    });

    it('should throw NotFoundException when notification not found for update', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const updateDto = new UpdateNotificationDto();
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateNotification(storeId, notificationId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeNotification', () => {
    it('should soft delete notification successfully', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const existingNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
        is_deleted: false,
      };

      mockRepository.findOne.mockResolvedValue(existingNotification);
      mockRepository.save.mockResolvedValue({
        ...existingNotification,
        is_deleted: true,
      });

      const result = await service.removeNotification(storeId, notificationId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingNotification,
        is_deleted: true,
      });
      expect(result).toEqual({
        message: '✅ Notification with ID "notif-1" has been deleted',
        data: null,
      });
    });

    it('should throw NotFoundException when notification not found for deletion', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeNotification(storeId, notificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreNotification', () => {
    it('should restore notification successfully', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const deletedNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
        is_deleted: true,
      };

      const restoredNotification = {
        ...deletedNotification,
        is_deleted: false,
      };

      mockRepository.findOne.mockResolvedValue(deletedNotification);
      mockRepository.save.mockResolvedValue(restoredNotification);

      const result = await service.restoreNotification(storeId, notificationId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: true },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...deletedNotification,
        is_deleted: false,
      });
      expect(result).toEqual({
        message: 'Notification restored successfully',
        data: {
          id: 'notif-1',
          type: 'INFO',
          title: 'Test Notification',
          description: 'Test Description',
          link: null,
          isRead: false,
          createdAt: expect.any(Date),
          createdByUserId: 'user-1',
          updatedByUserId: null,
        },
      });
    });

    it('should throw InternalServerErrorException when notification not found for restoration', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restoreNotification(storeId, notificationId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      const existingNotification = {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        is_read: false,
        created_at: new Date(),
        created_by_user_id: 'user-1',
        updated_by_user_id: null,
      };

      const updatedNotification = {
        ...existingNotification,
        is_read: true,
      };

      mockRepository.findOne.mockResolvedValue(existingNotification);
      mockRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(storeId, notificationId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, is_deleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingNotification,
        is_read: true,
      });
      expect(result).toEqual({
        id: 'notif-1',
        type: 'INFO',
        title: 'Test Notification',
        description: 'Test Description',
        link: null,
        isRead: true,
        createdAt: expect.any(Date),
        createdByUserId: 'user-1',
        updatedByUserId: null,
      });
    });

    it('should throw NotFoundException when notification not found for marking as read', async () => {
      const storeId = 'store-1';
      const notificationId = 'notif-1';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(storeId, notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const storeId = 'store-1';
      mockRepository.update.mockResolvedValue({ affected: 5 });

      const result = await service.markAllAsRead(storeId);

      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { is_deleted: false, is_read: false },
        { is_read: true },
      );
      expect(result).toEqual({
        message: 'All notifications marked as read successfully',
      });
    });
  });
});
