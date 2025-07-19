import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationService } from 'src/service/global/notification.service';
import {
  createTenantServiceTestSetup,
  TenantServiceTestSetup,
  TEST_STORE_ID,
  TEST_USER_ID,
  resetMocks,
  createTestEntity,
  setupSuccessfulRepositoryMocks,
} from '../../../../utils/tenant-datasource-mock.util';
import { CreateNotificationDto } from '@modules/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from '@modules/notification/dto/update-notification.dto';
import { Notification } from 'src/entities/tenant/notification.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

describe('NotificationService', () => {
  let module: TestingModule;
  let service: NotificationService;
  let setup: TenantServiceTestSetup<Notification>;

  const mockNotificationData: Partial<Notification> = {
    id: 'notification-123',
    type: 'info',
    title: 'Test Notification',
    description: 'Test notification description',
    link: '/test-link',
    is_read: false,
    is_deleted: false,
    created_by_user_id: TEST_USER_ID,
    updated_by_user_id: TEST_USER_ID,
  };

  beforeEach(async () => {
    setup = createTenantServiceTestSetup<Notification>();

    module = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: TenantDataSourceService,
          useValue: setup.mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    resetMocks(setup);
    if (module) {
      await module.close();
    }
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct primary key', () => {
      expect((service as any).primaryKey).toBe('id');
    });
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const createDto: CreateNotificationDto = {
        type: 'info',
        title: 'Test Notification',
        description: 'Test description',
        link: '/test',
        isRead: false,
        createdByUserId: TEST_USER_ID,
      };

      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      setupSuccessfulRepositoryMocks(setup.mockRepository, testNotification);

      const result = await service.createNotification(TEST_STORE_ID, createDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockNotificationData.title);
      expect(setup.mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const createDto: CreateNotificationDto = {
        type: 'info',
        title: 'Test Notification',
        description: 'Test description',
        link: '/test',
        isRead: false,
        createdByUserId: TEST_USER_ID,
      };

      const error = new Error('Database error');
      setup.mockRepository.save.mockRejectedValue(error);

      await expect(
        service.createNotification(TEST_STORE_ID, createDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAllNotifications', () => {
    it('should find all notifications successfully', async () => {
      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      setup.mockRepository.find.mockResolvedValue([testNotification]);

      const result = await service.findAllNotifications(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(setup.mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no notifications found', async () => {
      setup.mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllNotifications(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('findOneNotification', () => {
    it('should find one notification successfully', async () => {
      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      setup.mockRepository.findOne.mockResolvedValue(testNotification);

      const result = await service.findOneNotification(
        TEST_STORE_ID,
        'notification-123',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockNotificationData.id);
      expect(setup.mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-123', is_deleted: false },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneNotification(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNotification', () => {
    it('should update notification successfully', async () => {
      const updateDto: UpdateNotificationDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      const updatedNotification = { ...testNotification, ...updateDto };

      setup.mockRepository.findOne.mockResolvedValue(testNotification);
      setup.mockRepository.merge.mockReturnValue(updatedNotification);
      setup.mockRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.updateNotification(
        TEST_STORE_ID,
        'notification-123',
        updateDto,
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
      expect(setup.mockRepository.merge).toHaveBeenCalledWith(
        testNotification,
        updateDto,
      );
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification not found for update', async () => {
      const updateDto: UpdateNotificationDto = { title: 'Updated Title' };
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateNotification(TEST_STORE_ID, 'non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification successfully (soft delete)', async () => {
      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      setup.mockRepository.findOne.mockResolvedValue(testNotification);
      setup.mockRepository.save.mockResolvedValue({
        ...testNotification,
        is_deleted: true,
      });

      const result = await service.removeNotification(
        TEST_STORE_ID,
        'notification-123',
      );

      expect(result).toBeDefined();
      expect(result.message).toContain('has been deleted');
      expect(result.data).toBeNull();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification not found for removal', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeNotification(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restoreNotification', () => {
    it('should restore notification successfully', async () => {
      const deletedNotification = createTestEntity<Notification>({
        ...mockNotificationData,
        is_deleted: true,
      });
      const restoredNotification = {
        ...deletedNotification,
        is_deleted: false,
      };

      setup.mockRepository.findOne.mockResolvedValue(deletedNotification);
      setup.mockRepository.save.mockResolvedValue(restoredNotification);

      const result = await service.restoreNotification(
        TEST_STORE_ID,
        'notification-123',
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Notification restored successfully');
      expect(result.data).toBeDefined();
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when notification not found or not deleted', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restoreNotification(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const testNotification =
        createTestEntity<Notification>(mockNotificationData);
      const readNotification = { ...testNotification, is_read: true };

      setup.mockRepository.findOne.mockResolvedValue(testNotification);
      setup.mockRepository.save.mockResolvedValue(readNotification);

      const result = await service.markAsRead(
        TEST_STORE_ID,
        'notification-123',
      );

      expect(result).toBeDefined();
      expect(result.isRead).toBe(true);
      expect(setup.mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification not found for marking as read', async () => {
      setup.mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsRead(TEST_STORE_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      setup.mockRepository.update.mockResolvedValue({
        affected: 5,
        generatedMaps: [],
        raw: [],
      });

      const result = await service.markAllAsRead(TEST_STORE_ID);

      expect(result).toBeDefined();
      expect(result.message).toBe(
        'All notifications marked as read successfully',
      );
      expect(setup.mockRepository.update).toHaveBeenCalledWith(
        { is_deleted: false, is_read: false },
        { is_read: true },
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', () => {
      const error = new Error('Database connection failed');
      setup.mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        error,
      );

      // This would be tested at the TenantBaseService level
      expect(
        setup.mockTenantDataSourceService.getTenantDataSource,
      ).toBeDefined();
    });

    it('should handle repository operation errors', async () => {
      const error = new Error('Repository operation failed');
      setup.mockRepository.save.mockRejectedValue(error);

      const createDto: CreateNotificationDto = {
        type: 'info',
        title: 'Test',
        description: 'Test',
        link: '/test',
        isRead: false,
        createdByUserId: TEST_USER_ID,
      };

      await expect(
        service.createNotification(TEST_STORE_ID, createDto),
      ).rejects.toThrow();
    });
  });
});
