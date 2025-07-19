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

  it('processAuditLog thành công', async () => {
    await processor.processAuditLog(job as any);
    expect(loggerDebug).toHaveBeenCalled();
    expect(loggerLog).toHaveBeenCalled();
  });

  it('processAuditLog lỗi sẽ log và rethrow', async () => {
    const spy = jest
      .spyOn(processor as any, 'logMetrics')
      .mockImplementation(() => {});
    jest.spyOn(processor as any, 'logMetrics').mockImplementation(() => {
      throw new Error('fail');
    });
    const errorJob = { ...job, data: { ...job.data, action: 'FAIL' } };
    jest.spyOn(Logger.prototype, 'debug').mockImplementationOnce(() => {
      throw new Error('fail');
    });
    await expect(processor.processAuditLog(errorJob as any)).rejects.toThrow();
    expect(loggerError).toHaveBeenCalled();
  });

  it('handleFailedJob sẽ log và gọi sendFailureAlert', async () => {
    const spy = jest
      .spyOn(processor as any, 'sendFailureAlert')
      .mockImplementation(() => {});
    await processor.handleFailedJob(job as any, new Error('fail'));
    expect(loggerError).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('logMetrics log đúng', () => {
    (processor as any).logMetrics('CREATE_USER', 'SUCCESS');
    expect(loggerLog).toHaveBeenCalled();
  });

  it('sendFailureAlert log đúng', () => {
    (processor as any).sendFailureAlert(job.data);
    expect(loggerError).toHaveBeenCalled();
  });
});
