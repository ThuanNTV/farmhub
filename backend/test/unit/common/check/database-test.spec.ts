import * as dbTest from '../../../../src/common/check/database-test';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

describe('testDatabaseConnection', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('kết nối thành công, log version, log table', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(DataSource.prototype, 'query')
      .mockResolvedValueOnce([{ version: 'PostgreSQL 15' }])
      .mockResolvedValueOnce([{ tablename: 'table1' }]);
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockResolvedValue(undefined as any);

    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('kết nối lỗi trả về false', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockRejectedValue(new Error('fail'));
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('không lấy được version sẽ log cảnh báo', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(DataSource.prototype, 'query')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ tablename: 'table1' }]);
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockResolvedValue(undefined as any);
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('query version throw lỗi', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest.spyOn(DataSource.prototype, 'query').mockImplementationOnce(() => {
      throw new Error('fail');
    });
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockResolvedValue(undefined as any);
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('query table throw lỗi', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(DataSource.prototype, 'query')
      .mockResolvedValueOnce([{ version: 'PostgreSQL 15' }])
      .mockImplementationOnce(() => {
        throw new Error('fail');
      });
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockResolvedValue(undefined as any);
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('query table trả về mảng rỗng', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(DataSource.prototype, 'query')
      .mockResolvedValueOnce([{ version: 'PostgreSQL 15' }])
      .mockResolvedValueOnce([]);
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockResolvedValue(undefined as any);
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('destroy throw lỗi', async () => {
    jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(DataSource.prototype, 'query')
      .mockResolvedValueOnce([{ version: 'PostgreSQL 15' }])
      .mockResolvedValueOnce([{ tablename: 'table1' }]);
    jest
      .spyOn(DataSource.prototype, 'destroy')
      .mockRejectedValue(new Error('fail'));
    const result = await dbTest.testDatabaseConnection();
    expect(result).toBe(false); // destroy lỗi sẽ trả về false
    expect(errorSpy).toHaveBeenCalled();
  });
});
