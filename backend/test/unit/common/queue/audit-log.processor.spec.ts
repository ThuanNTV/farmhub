import { AuditLogProcessor } from '../../../../src/common/queue/audit-log.processor';
import { Logger } from '@nestjs/common';

describe('AuditLogProcessor', () => {
  let processor: AuditLogProcessor;
  let loggerDebug: jest.SpyInstance;
  let loggerError: jest.SpyInstance;
  let loggerLog: jest.SpyInstance;
  let tenantDataSourceService: any;

  beforeEach(() => {
    tenantDataSourceService = {};
    processor = new AuditLogProcessor(tenantDataSourceService);
    loggerDebug = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => {});
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    loggerLog = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const job = {
    data: {
      userId: 'u1',
      userName: 'user',
      action: 'CREATE_USER',
      resource: 'User',
      timestamp: new Date(),
    },
  };

  const fullDataJob = {
    data: {
      userId: 'u1',
      userName: 'user',
      action: 'CREATE_USER',
      resource: 'User',
      resourceId: 'res-123',
      oldValue: { name: 'old' },
      newValue: { name: 'new' },
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      timestamp: new Date(),
      storeId: 'store-1',
      sessionId: 'session-123',
      details: { extra: 'info' },
    },
  };

  it('processAuditLog thành công với dữ liệu cơ bản', async () => {
    await processor.processAuditLog(job as any);
    expect(loggerDebug).toHaveBeenCalledWith(
      `Processing audit log job: ${job.data.action} by ${job.data.userName}`,
    );
    expect(loggerDebug).toHaveBeenCalledWith(
      expect.stringContaining('Audit log saved successfully:'),
    );
    expect(loggerLog).toHaveBeenCalled();
  });

  it('processAuditLog thành công với dữ liệu đầy đủ', async () => {
    await processor.processAuditLog(fullDataJob as any);
    expect(loggerDebug).toHaveBeenCalledWith(
      `Processing audit log job: ${fullDataJob.data.action} by ${fullDataJob.data.userName}`,
    );
    expect(loggerLog).toHaveBeenCalled();
  });

  it('processAuditLog lỗi sẽ log và rethrow', async () => {
    const errorJob = { ...job, data: { ...job.data, action: 'FAIL' } };
    jest.spyOn(Logger.prototype, 'debug').mockImplementationOnce(() => {
      throw new Error('debug fail');
    });

    await expect(processor.processAuditLog(errorJob as any)).rejects.toThrow(
      'debug fail',
    );

    expect(loggerError).toHaveBeenCalledWith(
      'Failed to process audit log: debug fail',
      expect.any(String),
    );
    expect(loggerError).toHaveBeenCalledWith(
      `Failed audit log data: ${JSON.stringify(errorJob.data)}`,
    );
    expect(loggerLog).toHaveBeenCalledWith(
      expect.stringContaining('AUDIT_LOG_METRICS:'),
    );
  });

  it('handleFailedJob sẽ log và gọi sendFailureAlert', async () => {
    const spy = jest
      .spyOn(processor as any, 'sendFailureAlert')
      .mockImplementation(() => {});

    await processor.handleFailedJob(job as any, new Error('fail'));

    expect(loggerError).toHaveBeenCalledWith(
      `Audit log job failed permanently: ${job.data.action} by ${job.data.userName}`,
    );
    expect(loggerError).toHaveBeenCalledWith(
      `PERMANENT_FAILURE_AUDIT_LOG: ${JSON.stringify(job.data)}`,
    );
    expect(spy).toHaveBeenCalledWith(job.data);
  });

  it('logMetrics log SUCCESS', () => {
    (processor as any).logMetrics('CREATE_USER', 'SUCCESS');
    expect(loggerLog).toHaveBeenCalledWith(
      expect.stringContaining('AUDIT_LOG_METRICS:'),
    );
  });

  it('logMetrics log FAILED', () => {
    (processor as any).logMetrics('DELETE_USER', 'FAILED');
    expect(loggerLog).toHaveBeenCalledWith(
      expect.stringContaining('AUDIT_LOG_METRICS:'),
    );
  });

  it('sendFailureAlert log đúng', () => {
    (processor as any).sendFailureAlert(job.data);
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('AUDIT_LOG_ALERT:'),
    );
  });
});
