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
});
