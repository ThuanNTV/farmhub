import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { NotFoundException } from '@nestjs/common';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';

jest.mock('src/common/helpers/dto-mapper.helper');

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let mockRepo: any;

  // Mock data
  const mockAuditLog = {
    id: 'audit-123',
    user_id: 'user-123',
    action: 'CREATE',
    target_table: 'products',
    target_id: 'product-123',
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Test Product', price: 100 },
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    is_deleted: false,
    deleted_at: null,
  };

  const mockCreateDto: CreateAuditLogDto = {
    userId: 'user-123',
    action: 'CREATE',
    targetTable: 'products',
    targetId: 'product-123',
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Test Product', price: 100 },
    },
  };

  const mockUpdateDto: UpdateAuditLogDto = {
    action: 'UPDATE',
    metadata: {
      action: 'UPDATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Updated Product', price: 150 },
    },
  };

  beforeEach(() => {
    const tenantDS = {};
    service = new AuditLogsService(tenantDS as any);
    mockRepo = {
      find: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    jest.spyOn(service, 'getRepo').mockResolvedValue(mockRepo);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log successfully', async () => {
      const mappedEntity = { ...mockCreateDto };
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(mappedEntity);
      jest.spyOn(service, 'create').mockResolvedValue(mockAuditLog);

      const result = await service.create('store-123', mockCreateDto);

      expect(DtoMapper.mapToEntity).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      (DtoMapper.mapToEntity as jest.Mock).mockReturnValue({});
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(service.create('store-123', mockCreateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findById', () => {
    it('should return audit log when found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockAuditLog);

      const result = await service.findById('store-123', 'audit-123');

      expect(result).toEqual(mockAuditLog);
    });

    it('should return null when audit log not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      const result = await service.findById('store-123', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  it('findOne trả về entity nếu có', async () => {
    jest
      .spyOn(TenantBaseService.prototype, 'findById')
      .mockResolvedValue({ id: 1 });
    const result = await service.findOne('store1', 'id1');
    expect(result).toEqual({ id: 1 });
  });

  it('findOne ném NotFoundException nếu không có entity', async () => {
    jest.spyOn(TenantBaseService.prototype, 'findById').mockResolvedValue(null);
    await expect(service.findOne('store1', 'id1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findAll trả về repo.find', async () => {
    repo.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll('store1');
    expect(result).toEqual([{ id: 1 }]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('update gọi findOne, getRepo, DtoMapper, merge, save', async () => {
    const auditLog = { id: 1 };
    const entityData = { foo: 'bar' };
    (service.findOne as jest.Mock).mockResolvedValue(auditLog);
    (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(entityData);
    repo.merge.mockReturnValue({ ...auditLog, ...entityData });
    repo.save.mockResolvedValue({ ...auditLog, ...entityData });
    const result = await service.update('store1', 'id1', { foo: 'bar' } as any);
    expect(service.findOne).toHaveBeenCalled();
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ ...auditLog, ...entityData });
  });

  it('remove gọi findOne, getRepo, remove', async () => {
    const auditLog = { id: 1 };
    (service.findOne as jest.Mock).mockResolvedValue(auditLog);
    repo.remove.mockResolvedValue(undefined);
    const result = await service.remove('store1', 'id1');
    expect(service.findOne).toHaveBeenCalled();
    expect(repo.remove).toHaveBeenCalledWith(auditLog);
    expect(result.message).toMatch(/đã được xóa/);
  });

  it('mapToResponseDto trả về đúng structure', () => {
    const entity = {
      id: 1,
      user_id: 'u1',
      action: 'act',
      target_table: 'tbl',
      target_id: 'tid',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
      deleted_at: null,
    };
    const dto = service.mapToResponseDto(entity as any);
    expect(dto).toMatchObject({
      id: 1,
      userId: 'u1',
      action: 'act',
      targetTable: 'tbl',
      targetId: 'tid',
      metadata: {},
      isDeleted: false,
    });
  });
});
