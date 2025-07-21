import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogAsyncService } from '../../../../src/common/audit/audit-log-async.service';
import {
  AuditLogQueueService,
  AuditLogJobData,
} from '../../../../src/common/queue/audit-log-queue.service';

describe('AuditLogAsyncService', () => {
  let service: AuditLogAsyncService;
  let auditLogQueueService: jest.Mocked<AuditLogQueueService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogAsyncService,
        {
          provide: AuditLogQueueService,
          useValue: {
            addAuditLog: jest.fn(),
            addCriticalAuditLog: jest.fn(),
            addBulkAuditLogs: jest.fn(),
            getQueueStatus: jest.fn(),
            clearQueue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogAsyncService>(AuditLogAsyncService);
    auditLogQueueService = module.get(AuditLogQueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call addAuditLog on logCreate', async () => {
    await service.logCreate(
      'u1',
      'user',
      'resource',
      'rid',
      { foo: 'bar' },
      'store1',
    );
    expect(auditLogQueueService.addAuditLog).toHaveBeenCalled();
  });

  it('should call addAuditLog on logUpdate', async () => {
    await service.logUpdate(
      'u1',
      'user',
      'resource',
      'rid',
      { old: 1 },
      { new: 2 },
      'store1',
    );
    expect(auditLogQueueService.addAuditLog).toHaveBeenCalled();
  });

  it('should call addAuditLog on logDelete', async () => {
    await service.logDelete(
      'u1',
      'user',
      'resource',
      'rid',
      { foo: 'bar' },
      'store1',
    );
    expect(auditLogQueueService.addAuditLog).toHaveBeenCalled();
  });

  it('should call addAuditLog on logCriticalAction', async () => {
    await service.logCriticalAction(
      'u1',
      'user',
      'action',
      'resource',
      'rid',
      { foo: 'bar' },
      'store1',
    );
    expect(auditLogQueueService.addCriticalAuditLog).toHaveBeenCalled();
  });

  it('logLogin nên gọi addCriticalAuditLog với dữ liệu đúng', async () => {
    await service.logLogin('u1', 'user', 'store1', 'ip', 'agent', {
      details: JSON.stringify({ foo: 1 }),
    });
    expect(auditLogQueueService.addCriticalAuditLog).toHaveBeenCalledTimes(1);
  });

  it('logLogout nên gọi addCriticalAuditLog với dữ liệu đúng', async () => {
    await service.logLogout('u1', 'user', 'store1', 'ip', 'agent', {
      details: JSON.stringify({ bar: 2 }),
    });
    expect(auditLogQueueService.addCriticalAuditLog).toHaveBeenCalledTimes(1);
  });

  it('logBulkActions nên gọi addBulkAuditLogs', async () => {
    const auditData: AuditLogJobData[] = [
      {
        userId: 'u1',
        action: 'a1',
        targetTable: 't1',
        targetId: 't1_id',
        storeId: 's1',
      },
      {
        userId: 'u2',
        action: 'a2',
        targetTable: 't2',
        targetId: 't2_id',
        storeId: 's2',
      },
    ];
    await service.logBulkActions(auditData);
    expect(auditLogQueueService.addBulkAuditLogs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ userId: 'u1' }),
        expect.objectContaining({ userId: 'u2' }),
      ]),
    );
  });

  it('getQueueStatus nên gọi getQueueStatus của queue service', async () => {
    auditLogQueueService.getQueueStatus = jest.fn().mockResolvedValue('ok');
    const result = await service.getQueueStatus();
    expect(auditLogQueueService.getQueueStatus).toHaveBeenCalled();
    expect(result).toBe('ok');
  });

  it('should call clearQueue', async () => {
    auditLogQueueService.clearQueue = jest.fn().mockResolvedValue(undefined);
    await service.clearQueue();
    expect(auditLogQueueService.clearQueue).toHaveBeenCalled();
  });
});
