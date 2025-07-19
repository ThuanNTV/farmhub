import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserActivityLogController } from '@modules/user-activity-log/controller/user-activity-log.controller';
import { UserActivityLogService } from 'src/modules/user-activity-log/service/user-activity-log.service';
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

describe('UserActivityLogController', () => {
  let controller: UserActivityLogController;
  let userActivityLogService: jest.Mocked<UserActivityLogService>;

  const mockUserActivityLogService = {
    getAll: jest.fn(),
    create: jest.fn(),
    getLog: jest.fn(),
    filter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActivityLogController],
      providers: [
        {
          provide: UserActivityLogService,
          useValue: mockUserActivityLogService,
        },
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

    controller = module.get<UserActivityLogController>(
      UserActivityLogController,
    );
    userActivityLogService = module.get<jest.Mocked<UserActivityLogService>>(
      UserActivityLogService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all user activity logs', async () => {
      const storeId = 'test-store-123';
      const mockLogs = [{ id: '1', action: 'LOGIN', userId: 'user1' }];
      userActivityLogService.getAll.mockResolvedValue(mockLogs as any);

      const result = await controller.getAll(storeId);

      expect(userActivityLogService.getAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockLogs);
    });
  });

  describe('create', () => {
    it('should create user activity log successfully', async () => {
      const storeId = 'test-store-123';
      const body = { action: 'LOGIN', userId: 'user1' };
      const mockLog = { id: '1', ...body };
      userActivityLogService.create.mockResolvedValue(mockLog as any);

      const result = await controller.create(storeId, body);

      expect(userActivityLogService.create).toHaveBeenCalledWith(storeId, body);
      expect(result).toEqual(mockLog);
    });
  });

  describe('getLog', () => {
    it('should get log by id successfully', async () => {
      const storeId = 'test-store-123';
      const id = 'log-123';
      const mockLog = { id, action: 'LOGIN', userId: 'user1' };
      userActivityLogService.getLog.mockResolvedValue(mockLog as any);

      const result = await controller.getLog(storeId, id);

      expect(userActivityLogService.getLog).toHaveBeenCalledWith(storeId, id);
      expect(result).toEqual(mockLog);
    });
  });
});
