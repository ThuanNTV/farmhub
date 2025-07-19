import {
  AuditLogQueueService,
  AuditLogJobData,
} from '../../../../src/common/queue/audit-log-queue.service';
import { Logger } from '@nestjs/common';

describe('AuditLogQueueService', () => {
  let service: AuditLogQueueService;
  let queue: any;
  let loggerDebug: jest.SpyInstance;
  let loggerError: jest.SpyInstance;
  let loggerWarn: jest.SpyInstance;

  beforeEach(() => {
    queue = {
      add: jest.fn().mockResolvedValue(undefined),
      addBulk: jest.fn().mockResolvedValue(undefined),
      getWaiting: jest.fn().mockResolvedValue([1]),
      getActive: jest.fn().mockResolvedValue([2]),
      getCompleted: jest.fn().mockResolvedValue([3]),
      getFailed: jest.fn().mockResolvedValue([4]),
      getDelayed: jest.fn().mockResolvedValue([5]),
      clean: jest.fn().mockResolvedValue(undefined),
    };
    service = new AuditLogQueueService(queue);
    loggerDebug = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => {});

    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    loggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const job: AuditLogJobData = {
    userId: 'u1',
    userName: 'user',
    action: 'CREATE_USER',
    resource: 'User',
    timestamp: new Date(),
  };

  it('addAuditLog gọi queue đúng', async () => {
    await service.addAuditLog(job);
    expect(queue.add).toHaveBeenCalledWith(
      'process-audit-log',
      job,
      expect.objectContaining({ priority: 5 }),
    );
    expect(loggerDebug).toHaveBeenCalled();
  });

  it('addAuditLog fallback khi lỗi', async () => {
    queue.add.mockRejectedValue(new Error('fail'));
    await service.addAuditLog(job);
    expect(loggerError).toHaveBeenCalled();
    expect(loggerWarn).toHaveBeenCalled();
  });

  it('addCriticalAuditLog gọi queue đúng', async () => {
    await service.addCriticalAuditLog(job);
    expect(queue.add).toHaveBeenCalledWith(
      'process-audit-log',
      job,
      expect.objectContaining({ priority: 1, attempts: 5 }),
    );
    expect(loggerDebug).toHaveBeenCalled();
  });

  it('addCriticalAuditLog fallback khi lỗi', async () => {
    queue.add.mockRejectedValue(new Error('fail'));
    await service.addCriticalAuditLog(job);
    expect(loggerError).toHaveBeenCalled();
  });

  it('addBulkAuditLogs gọi queue đúng', async () => {
    await service.addBulkAuditLogs([job, { ...job, action: 'DELETE_USER' }]);
    expect(queue.addBulk).toHaveBeenCalled();
    expect(loggerDebug).toHaveBeenCalled();
  });

  it('addBulkAuditLogs fallback khi lỗi', async () => {
    queue.addBulk.mockRejectedValue(new Error('fail'));
    await service.addBulkAuditLogs([job]);
    expect(loggerError).toHaveBeenCalled();
    expect(loggerWarn).toHaveBeenCalled();
  });

  it('getQueueStatus trả về đúng số lượng', async () => {
    const result = await service.getQueueStatus();
    expect(result).toEqual({
      waiting: 1,
      active: 1,
      completed: 1,
      failed: 1,
      delayed: 1,
    });
  });

  it('getQueueStatus fallback khi lỗi', async () => {
    queue.getWaiting.mockRejectedValue(new Error('fail'));
    const result = await service.getQueueStatus();
    expect(result).toEqual({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    });
    expect(loggerError).toHaveBeenCalled();
  });

  it('clearQueue gọi đúng các trạng thái', async () => {
    await service.clearQueue();
    expect(queue.clean).toHaveBeenCalledTimes(4);
    expect(loggerDebug).toHaveBeenCalled();
  });

  it('clearQueue fallback khi lỗi', async () => {
    queue.clean.mockRejectedValue(new Error('fail'));
    await service.clearQueue();
    expect(loggerError).toHaveBeenCalled();
  });

  it('getPriority cho critical action', () => {
    expect((service as any).getPriority('DELETE_STORE')).toBe(1);
  });
  it('getPriority cho high priority action', () => {
    expect((service as any).getPriority('CREATE_USER')).toBe(5);
  });
  it('getPriority cho action thường', () => {
    expect((service as any).getPriority('OTHER')).toBe(10);
  });
});
