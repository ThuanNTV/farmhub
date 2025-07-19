import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExternalSystemLogsController } from '@modules/external-system-logs/controller/external-system-logs.controller';
import { ExternalSystemLogsService } from 'src/modules/external-system-logs/service/external-system-logs.service';
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

describe('ExternalSystemLogsController', () => {
  let controller: ExternalSystemLogsController;
  let service: jest.Mocked<ExternalSystemLogsService>;

  const mockExternalSystemLogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSystemLogsController],
      providers: [
        {
          provide: ExternalSystemLogsService,
          useValue: mockExternalSystemLogsService,
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

    controller = module.get<ExternalSystemLogsController>(
      ExternalSystemLogsController,
    );
    service = module.get<jest.Mocked<ExternalSystemLogsService>>(
      ExternalSystemLogsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create external system log successfully', async () => {
      const storeId = 'test-store-123';
      const createDto = {
        systemName: 'Test System',
        action: 'CREATE',
        requestData: '{}',
        responseData: '{}',
      };
      const mockLog = { id: '1', ...createDto };
      service.create.mockResolvedValue(mockLog as any);

      const result = await controller.create(storeId, createDto as any);

      expect(service.create).toHaveBeenCalledWith(storeId, createDto);
      expect(result).toEqual(mockLog);
    });
  });

  describe('findAll', () => {
    it('should return all external system logs', async () => {
      const storeId = 'test-store-123';
      const mockLogs = [{ id: '1', systemName: 'Test System' }];
      service.findAll.mockResolvedValue(mockLogs as any);

      const result = await controller.findAll(storeId);

      expect(service.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockLogs);
    });
  });
});
