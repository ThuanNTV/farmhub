import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { WebhookLogsController } from '@modules/webhook-logs/controller/webhook-logs.controller';
import { WebhookLogsService } from '@modules/webhook-logs/service/webhook-logs.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockWebhookLogsService,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('WebhookLogsController', () => {
  let controller: WebhookLogsController;
  let webhookLogsService: jest.Mocked<WebhookLogsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookLogsController],
      providers: [
        { provide: WebhookLogsService, useValue: mockWebhookLogsService },
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

    controller = module.get<WebhookLogsController>(WebhookLogsController);
    webhookLogsService =
      module.get<jest.Mocked<WebhookLogsService>>(WebhookLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const storeId = 'test-store-123';
    const createDto = {
      eventType: 'order.created',
      type: 'outgoing',
      requestPayload: { orderId: '123' },
      responsePayload: { success: true },
      status: 'success',
    };

    it('should create webhook log successfully', async () => {
      const mockWebhookLog = { id: '1', ...createDto };
      webhookLogsService.createWebhookLogs.mockResolvedValue(
        mockWebhookLog as any,
      );

      const result = await controller.create(storeId, createDto as any);

      expect(webhookLogsService.createWebhookLogs).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
      expect(result).toEqual(mockWebhookLog);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      webhookLogsService.createWebhookLogs.mockRejectedValue(error);

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    const storeId = 'test-store-123';

    it('should find all webhook logs successfully', async () => {
      const mockWebhookLogs = [{ id: '1', eventType: 'order.created' }];
      webhookLogsService.findAll.mockResolvedValue(mockWebhookLogs as any);

      const result = await controller.findAll(storeId);

      expect(webhookLogsService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockWebhookLogs);
    });
  });
});
