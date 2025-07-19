import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogAsyncService } from '../../../../src/common/audit/audit-log-async.service';
import { AuditLogQueueService } from '../../../../src/common/queue/audit-log-queue.service';

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

  it('should call addCriticalAuditLog on logLogin', async () => {
    await service.logLogin('u1', 'user', 'ip', 'agent', {
      details: { foo: 1 },
    });
    expect(auditLogQueueService.addCriticalAuditLog).toHaveBeenCalled();
  });

  it('should call addCriticalAuditLog on logLogout', async () => {
    await service.logLogout('u1', 'user', 'ip', 'agent', {
      details: { bar: 2 },
    });
    expect(auditLogQueueService.addCriticalAuditLog).toHaveBeenCalled();
  });

  it('should call addBulkAuditLogs on logBulkActions', async () => {
    auditLogQueueService.addBulkAuditLogs = jest.fn();
    const arr = [
      {
        userId: 'u1',
        userName: 'user',
        action: 'A',
        resource: 'R',
        resourceId: 'id',
        newValue: 1,
      },
      {
        userId: 'u2',
        userName: 'user2',
        action: 'B',
        resource: 'R2',
        resourceId: 'id2',
        newValue: 2,
        timestamp: new Date(),
      },
    ];
    await service.logBulkActions(arr as any);
    expect(auditLogQueueService.addBulkAuditLogs).toHaveBeenCalled();
    const calledArg = auditLogQueueService.addBulkAuditLogs.mock.calls[0][0];
    expect(calledArg[0].timestamp).toBeDefined();
    expect(calledArg[1].timestamp).toBeDefined();
  });

  it('should call getQueueStatus', async () => {
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
