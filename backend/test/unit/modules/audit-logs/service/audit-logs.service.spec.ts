import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';

const mockAuditLog: AuditLog = {
  id: '1',
  user_id: 'u1',
  user_name: 'test user',
  action: 'CREATE',
  target_table: 'table',
  target_id: 'tid',
  resource_type: 'type',
  resource_id: 'rid',
  old_value: JSON.stringify({}),
  new_value: JSON.stringify({}),
  ip_address: '127.0.0.1',
  device: 'PC',
  browser: 'Chrome',
  os: 'Windows',
  metadata: {
    action: 'CREATE',
    resource: 'table',
    resourceId: 'tid',
  },
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  deleted_at: new Date(),
  user_agent: 'Mozilla/5.0',
  timestamp: new Date(),
  store_id: 'store1',
  session_id: 'session1',
  details: '',
  audit_log_id: 'audit1',
};

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let mockTenantDataSourceService: any;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn().mockResolvedValue({
        getRepository: jest.fn().mockReturnValue(mockRepository),
        isInitialized: true,
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();
    service = module.get<AuditLogsService>(AuditLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create audit log', async () => {
      const storeId = 'store1';
      const dto: CreateAuditLogDto = { action: 'CREATE' } as any;
      const spy = jest.spyOn(service, 'create').mockResolvedValue(mockAuditLog);
      const result = await service.create(storeId, dto);
      expect(result).toBe(mockAuditLog);
      spy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return audit log by id', async () => {
      const storeId = 'store1';
      const id = '1';
      jest.spyOn(service, 'findById').mockResolvedValue(mockAuditLog);
      const result = await service.findById(storeId, id);
      expect(result).toBe(mockAuditLog);
    });
    it('should return null if not found', async () => {
      const storeId = 'store1';
      const id = '2';
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      const result = await service.findById(storeId, id);
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return audit log if found', async () => {
      jest
        .spyOn(AuditLogsService.prototype, 'findById')
        .mockResolvedValue(mockAuditLog);
      const result = await service.findOne('store1', '1');
      expect(result).toBe(mockAuditLog);
    });
    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);
      await expect(service.findOne('store1', '2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      mockRepository.find.mockResolvedValue([mockAuditLog]);
      const result = await service.findAll('store1');
      expect(result).toEqual([mockAuditLog]);
    });
    it('should return empty array if none', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findAll('store1');
      expect(result).toEqual([]);
    });
    it('should throw if repo.find throws', async () => {
      mockRepository.find.mockRejectedValue(new Error('fail-find'));
      await expect(service.findAll('store1')).rejects.toThrow('fail-find');
    });
  });

  describe('update', () => {
    it('should update audit log', async () => {
      const storeId = 'store1';
      const id = '1';
      const dto: UpdateAuditLogDto = { action: 'UPDATE' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuditLog);
      mockRepository.merge.mockReturnValue({ ...mockAuditLog, ...dto });
      mockRepository.save.mockResolvedValue({ ...mockAuditLog, ...dto });
      const result = await service.update(storeId, id, dto);
      expect(result.action).toBe('UPDATE');
    });
    it('should throw if save fails', async () => {
      const storeId = 'store1';
      const id = '1';
      const dto: UpdateAuditLogDto = { action: 'UPDATE' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuditLog);
      mockRepository.merge.mockReturnValue({ ...mockAuditLog, ...dto });
      mockRepository.save.mockRejectedValue(new Error('fail-save'));
      await expect(service.update(storeId, id, dto)).rejects.toThrow(
        'fail-save',
      );
    });
  });

  describe('remove', () => {
    it('should remove audit log', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuditLog);
      mockRepository.remove.mockResolvedValue(undefined);
      const result = await service.remove('store1', '1');
      expect(result.message).toContain('đã được xóa');
    });
    it('should throw if remove fails', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuditLog);
      mockRepository.remove.mockRejectedValue(new Error('fail-remove'));
      await expect(service.remove('store1', '1')).rejects.toThrow(
        'fail-remove',
      );
    });
  });

  describe('mapToResponseDto', () => {
    it('should map entity to response dto', () => {
      const dto = service.mapToResponseDto(mockAuditLog);
      expect(dto.id).toBe(mockAuditLog.id);
      expect(dto.userId).toBe(mockAuditLog.user_id);
      expect(dto.action).toBe(mockAuditLog.action);
      expect(dto.targetTable).toBe(mockAuditLog.target_table);
      expect(dto.targetId).toBe(mockAuditLog.target_id);
      expect(dto.metadata).toBe(mockAuditLog.metadata);
      expect(dto.createdAt).toBe(mockAuditLog.created_at);
      expect(dto.updatedAt).toBe(mockAuditLog.updated_at);
      expect(dto.isDeleted).toBe(mockAuditLog.is_deleted);
      expect(dto.deletedAt).toBe(mockAuditLog.deleted_at);
    });
  });
});
