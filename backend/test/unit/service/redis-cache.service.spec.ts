import { RedisCacheService } from '../../../src/common/cache/redis-cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let cacheManager: any;

  beforeEach(() => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    service = new RedisCacheService(cacheManager);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('get trả về giá trị parse được', async () => {
    cacheManager.get.mockResolvedValue(JSON.stringify({ a: 1 }));
    const result = await service.get('key');
    expect(result).toEqual({ a: 1 });
  });

  it('get trả về giá trị raw nếu không parse được', async () => {
    cacheManager.get.mockResolvedValue('raw');
    const result = await service.get('key');
    expect(result).toBe('raw');
  });

  it('get trả về null nếu không có value', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    const result = await service.get('key');
    expect(result).toBeNull();
  });

  it('get trả về null nếu lỗi', async () => {
    cacheManager.get.mockRejectedValue(new Error('fail'));
    const result = await service.get('key');
    expect(result).toBeNull();
  });

  it('set lưu giá trị object', async () => {
    cacheManager.set.mockResolvedValue(undefined);
    await service.set('key', { a: 1 });
    expect(cacheManager.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify({ a: 1 }),
    );
  });

  it('set lưu giá trị primitive', async () => {
    cacheManager.set.mockResolvedValue(undefined);
    await service.set('key', 123);
    expect(cacheManager.set).toHaveBeenCalledWith('key', 123);
  });

  it('set không throw khi lỗi', async () => {
    cacheManager.set.mockRejectedValue(new Error('fail'));
    await service.set('key', 1);
    expect(cacheManager.set).toHaveBeenCalled();
  });

  it('del xoá đúng key', async () => {
    cacheManager.del.mockResolvedValue(undefined);
    await service.del('key');
    expect(cacheManager.del).toHaveBeenCalledWith('key');
  });

  it('del không throw khi lỗi', async () => {
    cacheManager.del.mockRejectedValue(new Error('fail'));
    await service.del('key');
    expect(cacheManager.del).toHaveBeenCalled();
  });

  it('delPattern xoá các key đúng', async () => {
    const keys = ['a', 'b'];
    const client = { keys: jest.fn().mockResolvedValue(keys) };
    cacheManager.store = { getClient: () => client };
    cacheManager.del.mockResolvedValue(undefined);
    await service.delPattern('prefix:*');
    expect(cacheManager.del).toHaveBeenCalledTimes(keys.length);
  });

  it('delPattern không throw khi lỗi', async () => {
    cacheManager.store = {
      getClient: () => {
        throw new Error('fail');
      },
    };
    await service.delPattern('prefix:*');
  });

  it('reset gọi flushdb', async () => {
    const client = { flushdb: jest.fn().mockResolvedValue(undefined) };
    cacheManager.store = { getClient: () => client };
    await service.reset();
    expect(client.flushdb).toHaveBeenCalled();
  });

  it('reset không throw khi lỗi', async () => {
    cacheManager.store = {
      getClient: () => {
        throw new Error('fail');
      },
    };
    await service.reset();
  });

  it('getStats trả về stats đúng', async () => {
    const info =
      'redis_version:6.2.6\r\ntotal_connections_received:10\r\ntotal_commands_processed:100\r\nkeyspace_hits:5\r\nkeyspace_misses:2\r\nused_memory:12345\r\nused_memory_peak:23456\r\nconnected_clients:3\r\nblocked_clients:0\r\n';
    const client = { info: jest.fn().mockResolvedValue(info) };
    cacheManager.store = { getClient: () => client };
    const stats = await service.getStats();
    expect(stats?.connected).toBe(true);
    expect(stats?.stats?.redis_version).toBe('6.2.6');
  });

  it('getStats trả về error nếu không có info', async () => {
    cacheManager.store = { getClient: () => ({}) };
    const stats = await service.getStats();
    expect(stats?.connected).toBe(false);
  });

  it('withCache trả về cache nếu có', async () => {
    jest.spyOn(service, 'get').mockResolvedValue(123 as any);
    const fn = jest.fn();
    const result = await service.withCache('k', fn);
    expect(result).toBe(123);
    expect(fn).not.toHaveBeenCalled();
  });

  it('withCache gọi fn và set nếu cache miss', async () => {
    jest.spyOn(service, 'get').mockResolvedValue(null);
    jest.spyOn(service, 'set').mockResolvedValue(undefined);
    const fn = jest.fn().mockResolvedValue(456);
    const result = await service.withCache('k', fn);
    expect(result).toBe(456);
    expect(fn).toHaveBeenCalled();
    expect(service.set).toHaveBeenCalledWith('k', 456, undefined);
  });

  it('invalidatePattern gọi delPattern', async () => {
    const spy = jest.spyOn(service, 'delPattern').mockResolvedValue();
    await service.invalidatePattern('abc:*');
    expect(spy).toHaveBeenCalledWith('abc:*');
  });

  it('invalidateEntity gọi invalidatePattern đúng', async () => {
    const spy = jest.spyOn(service, 'invalidatePattern').mockResolvedValue();
    await service.invalidateEntity('entity', 'id1');
    expect(spy).toHaveBeenCalledWith('entity:id1');
    await service.invalidateEntity('entity');
    expect(spy).toHaveBeenCalledWith('entity:*');
  });
});
