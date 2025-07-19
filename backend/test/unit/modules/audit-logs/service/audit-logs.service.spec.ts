import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { NotFoundException } from '@nestjs/common';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';

jest.mock('src/common/helpers/dto-mapper.helper');

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let tenantDS: any;
  let repo: any;

  beforeEach(() => {
    tenantDS = {};
    service = new AuditLogsService(tenantDS);
    repo = {
      find: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    jest.spyOn(service, 'getRepo').mockResolvedValue(repo);
    jest.spyOn(service, 'findOne').mockImplementation();
  });

  it('create gọi DtoMapper.mapToEntity và super.create', async () => {
    const entity = { a: 1 };
    (DtoMapper.mapToEntity as jest.Mock).mockReturnValue(entity);
    const superCreate = jest.spyOn(TenantBaseService.prototype, 'create').mockResolvedValue(entity);
    const result = await service.create('store1', { foo: 'bar' } as any);
    expect(DtoMapper.mapToEntity).toHaveBeenCalled();
    expect(superCreate).toHaveBeenCalled();
    expect(result).toBe(entity);
    superCreate.mockRestore();
  });

  it('findById gọi super.findById', async () => {
    const superFindById = jest.spyOn(TenantBaseService.prototype, 'findById').mockResolvedValue({ id: 1 });
    const result = await service.findById('store1', 'id1');
    expect(superFindById).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
    superFindById.mockRestore();
  });

  it('findOne trả về entity nếu có', async () => {
    jest.spyOn(TenantBaseService.prototype, 'findById').mockResolvedValue({ id: 1 });
    const result = await service.findOne('store1', 'id1');
    expect(result).toEqual({ id: 1 });
  });

  it('findOne ném NotFoundException nếu không có entity', async () => {
    jest.spyOn(TenantBaseService.prototype, 'findById').mockResolvedValue(null);
    await expect(service.findOne('store1', 'id1')).rejects.toThrow(NotFoundException);
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