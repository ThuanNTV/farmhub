import { getTenantDbConfig } from 'src/config/db/dbtenant/getTenantDbConfig';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as fs from 'fs';

describe('getTenantDbConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  it('trả về config cơ bản với schemaName', () => {
    process.env.NODE_ENV = 'development';
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    expect(config.schema).toBe('myschema');
    expect(config.type).toBe('postgres');
    expect(config.entities).toBeDefined();
  });

  it('trả về ssl false nếu TENANT_DB_SSL không bật', () => {
    process.env.TENANT_DB_SSL = 'false';
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    expect(config.ssl).toBe(false);
  });

  it('trả về ssl object nếu TENANT_DB_SSL bật và NODE_ENV=production', () => {
    process.env.TENANT_DB_SSL = 'true';
    process.env.NODE_ENV = 'production';
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    expect(typeof config.ssl).toBe('object');
    expect((config.ssl as any).rejectUnauthorized).toBe(true);
  });

  it('ssl có ca nếu DB_CA_PATH được set', () => {
    process.env.TENANT_DB_SSL = 'true';
    process.env.NODE_ENV = 'production';
    process.env.DB_CA_PATH = '/tmp/ca.pem';
    jest.spyOn(fs, 'readFileSync').mockReturnValue('CA_CONTENT');
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    expect((config.ssl as any).ca).toBe('CA_CONTENT');
  });

  it('pooling config lấy từ env', () => {
    process.env.TENANT_DB_POOL_MAX = '10';
    process.env.TENANT_DB_POOL_MIN = '2';
    process.env.TENANT_DB_CONNECTION_TIMEOUT = '1234';
    process.env.TENANT_DB_IDLE_TIMEOUT = '5678';
    process.env.TENANT_DB_REAP_INTERVAL = '999';
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    expect((config.extra as any).max).toBe(10);
    expect((config.extra as any).min).toBe(2);
    expect((config.extra as any).acquireTimeoutMillis).toBe(1234);
    expect((config.extra as any).idleTimeoutMillis).toBe(5678);
    expect((config.extra as any).reapIntervalMillis).toBe(999);
  });

  it('cache config đúng', () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6380';
    const config = getTenantDbConfig('myschema') as PostgresConnectionOptions;
    if (config.cache && typeof config.cache !== 'boolean') {
      expect((config.cache as any).options.host).toBe('localhost');
      expect((config.cache as any).options.port).toBe(6380);
    }
  });
}); 