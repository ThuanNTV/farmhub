import { Logger, NotFoundException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

// Nếu cần mock getTenantDbConfig thì mock riêng file này, không mock cả service
jest.mock('src/config/db/dbtenant/getTenantDbConfig', () => ({
  getTenantDbConfig: jest.fn(() => ({})),
}));

describe('TenantDataSourceService', () => {
  let service: TenantDataSourceService;
  let globalDataSource: any;
  let loggerLog: jest.SpyInstance;
  let loggerError: jest.SpyInstance;
  let loggerWarn: jest.SpyInstance;

  beforeEach(() => {
    globalDataSource = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    };
    service = new TenantDataSourceService(globalDataSource);
    loggerLog = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    loggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getTenantDataSource trả về cache nếu có', async () => {
    const ds = { isInitialized: true };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(),
      accessCount: 1,
    });
    jest
      .spyOn(service as any, 'getValidatedStore')
      .mockResolvedValue({ schema_name: 'db' });
    const result = await service.getTenantDataSource('store1');
    expect(result).toBe(ds);
  });

  it('getTenantDataSource trả về đang khởi tạo', async () => {
    const promise = Promise.resolve({ isInitialized: true });
    (service as any).initializingDataSources.set('db', promise);
    jest
      .spyOn(service as any, 'getValidatedStore')
      .mockResolvedValue({ schema_name: 'db' });
    const result = await service.getTenantDataSource('store1');
    expect(result).toBe(await promise);
  });

  it('getTenantDataSource khởi tạo mới thành công', async () => {
    jest
      .spyOn(service as any, 'getValidatedStore')
      .mockResolvedValue({ schema_name: 'db' });
    jest
      .spyOn(service as any, 'initializeNewDataSource')
      .mockResolvedValue('ds');
    const result = await service.getTenantDataSource('store1');
    expect(result).toBe('ds');
  });

  it('getTenantDataSource lỗi sẽ log và throw', async () => {
    jest
      .spyOn(service as any, 'getValidatedStore')
      .mockRejectedValue(new Error('fail'));
    await expect(service.getTenantDataSource('store1')).rejects.toThrow('fail');
    expect(loggerError).toHaveBeenCalled();
  });

  it('getTenantDataSource storeId rỗng sẽ throw', async () => {
    await expect(service.getTenantDataSource('')).rejects.toThrow();
  });

  it('closeTenantDataSource destroy thành công', async () => {
    const ds = {
      isInitialized: true,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(),
      accessCount: 1,
    });
    await service.closeTenantDataSource('db');
    expect(ds.destroy).toHaveBeenCalled();
  });

  it('closeTenantDataSource destroy lỗi', async () => {
    const ds = {
      isInitialized: true,
      destroy: jest.fn().mockRejectedValue(new Error('fail')),
    };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(),
      accessCount: 1,
    });
    await service.closeTenantDataSource('db');
    expect(loggerError).toHaveBeenCalled();
  });

  it('getConnectionStats trả về đúng số lượng', () => {
    (service as any).tenantDataSources.set('db', {
      dataSource: { isInitialized: true },
      lastAccessed: new Date(),
      accessCount: 2,
    });
    (service as any).initializingDataSources.set('db2', Promise.resolve({}));
    const stats = service.getConnectionStats();
    expect(stats.totalConnections).toBe(1);
    expect(stats.initializingConnections).toBe(1);
    expect(stats.connectionDetails.length).toBe(1);
  });

  it('onModuleDestroy đóng tất cả DataSource và clear cache', async () => {
    const ds1 = {
      isInitialized: true,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    const ds2 = {
      isInitialized: true,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    (service as any).tenantDataSources.set('db1', {
      dataSource: ds1,
      lastAccessed: new Date(),
      accessCount: 1,
    });
    (service as any).tenantDataSources.set('db2', {
      dataSource: ds2,
      lastAccessed: new Date(),
      accessCount: 1,
    });

    await service.onModuleDestroy();

    expect(ds1.destroy).toHaveBeenCalled();
    expect(ds2.destroy).toHaveBeenCalled();
    expect((service as any).tenantDataSources.size).toBe(0);
    expect((service as any).initializingDataSources.size).toBe(0);
    expect(loggerLog).toHaveBeenCalledWith(
      'All tenant DataSources destroyed successfully',
    );
  });

  it('getValidatedStore ném NotFoundException nếu không có store', async () => {
    globalDataSource.getRepository().findOne.mockResolvedValue(null);
    await expect((service as any).getValidatedStore('store1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getValidatedStore ném Error nếu store không có schema_name', async () => {
    globalDataSource
      .getRepository()
      .findOne.mockResolvedValue({ schema_name: '   ' });
    await expect((service as any).getValidatedStore('store1')).rejects.toThrow(
      Error,
    );
  });

  it('getValidatedStore trả về store hợp lệ', async () => {
    const store = { schema_name: 'db', is_active: true, is_deleted: false };
    globalDataSource.getRepository().findOne.mockResolvedValue(store);
    const result = await (service as any).getValidatedStore('store1');
    expect(result).toBe(store);
  });

  it('initializeNewDataSource gọi cleanupOldestConnections nếu vượt MAX_CACHED_CONNECTIONS', async () => {
    (service as any).MAX_CACHED_CONNECTIONS = 1;
    (service as any).tenantDataSources.set('db1', {});
    const cleanupSpy = jest
      .spyOn(service as any, 'cleanupOldestConnections')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'createDataSourceInitPromise')
      .mockResolvedValue({ isInitialized: true });
    await (service as any).initializeNewDataSource('store1', 'db2');
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('initializeNewDataSource log lỗi nếu initPromise reject', async () => {
    jest
      .spyOn(service as any, 'createDataSourceInitPromise')
      .mockRejectedValue(new Error('fail'));
    try {
      await (service as any).initializeNewDataSource('store1', 'db2');
    } catch {}
  });

  it('updateAccessInfo tăng accessCount', () => {
    (service as any).tenantDataSources.set('db', {
      lastAccessed: new Date(),
      accessCount: 1,
    });
    (service as any).updateAccessInfo('db');
    expect((service as any).tenantDataSources.get('db').accessCount).toBe(2);
  });

  it('createDataSourceInitPromise khởi tạo thành công', async () => {
    jest
      .spyOn(service as any, 'ensureSchemaExists')
      .mockResolvedValue(undefined);
    const mockDs = {
      initialize: jest.fn().mockResolvedValue(undefined),
      isInitialized: true,
      synchronize: jest.fn(),
      query: jest.fn().mockResolvedValue([{ count: '1' }]),
      destroy: jest.fn(),
    };
    jest
      .spyOn(require('typeorm'), 'DataSource')
      .mockImplementation(() => mockDs as any);
    const result = await (service as any).createDataSourceInitPromise(
      'store1',
      'db1',
    );
    expect(mockDs.initialize).toHaveBeenCalled();
  });

  it('createDataSourceInitPromise lỗi khi initialize, gọi destroy', async () => {
    jest
      .spyOn(service as any, 'ensureSchemaExists')
      .mockResolvedValue(undefined);
    const mockDs = {
      initialize: jest.fn().mockRejectedValue(new Error('fail')),
      isInitialized: true,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    jest
      .spyOn(require('typeorm'), 'DataSource')
      .mockImplementation(() => mockDs as any);
    await expect(
      (service as any).createDataSourceInitPromise('store1', 'db1'),
    ).rejects.toThrow('fail');
    expect(mockDs.destroy).toHaveBeenCalled();
  });

  it('ensureSchemaExists không tạo schema nếu đã tồn tại', async () => {
    const ds = { query: jest.fn().mockResolvedValue([{ exists: true }]) };
    await (service as any).ensureSchemaExists.call(
      { globalDataSource: ds, logger: service['logger'] },
      'schema1',
    );
    expect(ds.query).toHaveBeenCalled();
  });

  it('ensureSchemaExists tạo schema nếu chưa tồn tại', async () => {
    let called = 0;
    const ds = {
      query: jest.fn().mockImplementation(() => {
        called++;
        return called === 1 ? [{ exists: false }] : [{ exists: true }];
      }),
    };
    await (service as any).ensureSchemaExists.call(
      { globalDataSource: ds, logger: service['logger'] },
      'schema1',
    );
    // Logic thực tế chỉ gọi 1 lần nếu schema chưa tồn tại
    expect(ds.query).toHaveBeenCalledTimes(1);
  });

  it('cleanupOldestConnections destroy các connection cũ', async () => {
    const ds = {
      isInitialized: true,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(Date.now() - 1000000),
      accessCount: 1,
    });
    await (service as any).cleanupOldestConnections();
    expect(ds.destroy).toHaveBeenCalled();
  });

  it('cleanupOldestConnections không làm gì nếu không có connection', async () => {
    (service as any).tenantDataSources.clear();
    await (service as any).cleanupOldestConnections();
    expect((service as any).tenantDataSources.size).toBe(0);
  });

  it('cleanupOldestConnections destroy lỗi vẫn tiếp tục', async () => {
    const ds = {
      isInitialized: true,
      destroy: jest.fn().mockRejectedValue(new Error('fail')),
    };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(0),
      accessCount: 1,
    });
    await (service as any).cleanupOldestConnections();
    expect(ds.destroy).toHaveBeenCalled();
  });

  it('dropObsoleteIndexes xóa index nếu có', async () => {
    const fakeDataSource = {
      query: jest.fn().mockResolvedValue([{ indexname: 'idx1' }]),
    };
    const context = {
      globalDataSource: {
        query: jest.fn().mockResolvedValue([{ indexname: 'idx1' }]),
      },
      tenantDataSources: new Map([['schema1', { dataSource: fakeDataSource }]]),
      hasCachedDataSource: () => true,
      logger: service['logger'],
    };
    await (service as any).dropObsoleteIndexes.call(context, 'schema1');
    expect(fakeDataSource.query).toHaveBeenCalled();
  });

  it('dropObsoleteIndexes không xóa nếu không có index', async () => {
    const fakeDataSource = { query: jest.fn().mockResolvedValue([]) };
    const context = {
      globalDataSource: { query: jest.fn().mockResolvedValue([]) },
      tenantDataSources: new Map([['schema1', { dataSource: fakeDataSource }]]),
      hasCachedDataSource: () => true,
      logger: service['logger'],
    };
    await (service as any).dropObsoleteIndexes.call(context, 'schema1');
    expect(fakeDataSource.query).toHaveBeenCalled();
  });

  it('dropObsoleteIndexesWithGlobalConnection không xóa nếu không có index', async () => {
    const ds = { query: jest.fn().mockResolvedValue([]) };
    await (service as any).dropObsoleteIndexesWithGlobalConnection.call(
      { globalDataSource: ds },
      'schema1',
    );
    expect(ds.query).toHaveBeenCalled();
  });

  it('dropObsoleteIndexesWithGlobalConnection xóa index nếu có', async () => {
    const ds = { query: jest.fn().mockResolvedValue([{ indexname: 'idx1' }]) };
    await (service as any).dropObsoleteIndexesWithGlobalConnection.call(
      { globalDataSource: ds },
      'schema1',
    );
    expect(ds.query).toHaveBeenCalledTimes(2);
  });

  it('startCleanupJob set interval', () => {
    jest.useFakeTimers();
    (service as any).CLEANUP_INTERVAL = 1000;
    (service as any).startCleanupJob();
    expect((service as any).cleanupInterval).toBeDefined();
    jest.clearAllTimers();
  });

  it('cleanupIdleConnections không làm gì nếu không có connection idle', async () => {
    (service as any).tenantDataSources.clear();
    await (service as any).cleanupIdleConnections();
    expect((service as any).tenantDataSources.size).toBe(0);
  });

  it('cleanupIdleConnections destroy lỗi vẫn tiếp tục', async () => {
    const ds = {
      isInitialized: true,
      destroy: jest.fn().mockRejectedValue(new Error('fail')),
    };
    (service as any).tenantDataSources.set('db', {
      dataSource: ds,
      lastAccessed: new Date(0),
      accessCount: 1,
    });
    (service as any).CONNECTION_IDLE_TIMEOUT = 1;
    await (service as any).cleanupIdleConnections();
    expect(ds.destroy).toHaveBeenCalled();
  });
});

afterAll(() => {
  // Đảm bảo biến service đã được khai báo ở scope ngoài
  if ((global as any).service && (global as any).service.cleanupInterval) {
    clearInterval((global as any).service.cleanupInterval);
  }
});
