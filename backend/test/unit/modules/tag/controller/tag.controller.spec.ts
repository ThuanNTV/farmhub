import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TagController } from '@modules/tag/controller/tag.controller';
import { TagService } from 'src/modules/tag/service/tag.service';
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

describe('TagController', () => {
  let controller: TagController;
  let tagService: jest.Mocked<TagService>;

  const mockTagService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        { provide: TagService, useValue: mockTagService },
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

    controller = module.get<TagController>(TagController);
    tagService = module.get<jest.Mocked<TagService>>(TagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tags when active is not specified', async () => {
      const storeId = 'test-store-123';
      const mockTags = [{ id: '1', name: 'Test tag' }];
      tagService.findAll.mockResolvedValue(mockTags as any);

      const result = await controller.findAll(storeId);

      expect(tagService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockTags);
    });

    it('should return active tags when active is true', async () => {
      const storeId = 'test-store-123';
      const mockTags = [{ id: '1', name: 'Active tag' }];
      tagService.findActive.mockResolvedValue(mockTags as any);

      const result = await controller.findAll(storeId, true);

      expect(tagService.findActive).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockTags);
    });
  });

  describe('create', () => {
    it('should create tag successfully', async () => {
      const storeId = 'test-store-123';
      const createDto = { name: 'New tag', color: '#FF0000' };
      const mockTag = { id: '1', ...createDto };
      tagService.create.mockResolvedValue(mockTag as any);

      const result = await controller.create(storeId, createDto as any);

      expect(tagService.create).toHaveBeenCalledWith(storeId, createDto);
      expect(result).toEqual(mockTag);
    });
  });
});
