import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { NotificationController } from '@modules/notification/controller/notification.controller';
import { NotificationService } from 'src/service/global/notification.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: jest.Mocked<NotificationService>;

  const mockNotificationService = {
    createNotification: jest.fn(),
    findAllNotifications: jest.fn(),
    findOneNotification: jest.fn(),
    updateNotification: jest.fn(),
    removeNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
        { provide: AuditInterceptor, useValue: mockAuditInterceptor },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockEnhancedAuthGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue(mockAuditInterceptor)
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService =
      module.get<jest.Mocked<NotificationService>>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      const storeId = 'test-store-123';
      const mockNotifications = [{ id: '1', title: 'Test notification' }];
      notificationService.findAllNotifications.mockResolvedValue(
        mockNotifications as any,
      );

      const result = await controller.findAll(storeId);

      expect(notificationService.findAllNotifications).toHaveBeenCalledWith(
        storeId,
      );
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('create', () => {
    it('should create notification successfully', async () => {
      const storeId = 'test-store-123';
      const createDto = {
        title: 'Test notification',
        description: 'Test description',
        type: 'info',
      };
      const mockNotification = { id: '1', ...createDto };
      notificationService.createNotification.mockResolvedValue(
        mockNotification as any,
      );

      const result = await controller.create(storeId, createDto as any);

      expect(notificationService.createNotification).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
      expect(result).toEqual(mockNotification);
    });
  });
});
