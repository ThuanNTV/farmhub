import { Test, TestingModule } from '@nestjs/testing';

// Mock tất cả dependencies trước khi import
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
  createLogger: jest.fn(),
}));

jest.mock('winston-daily-rotate-file', () => jest.fn());

jest.mock('nest-winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    module: 'WinstonModule',
    providers: [],
    exports: [],
  }),
  forRoot: jest.fn().mockReturnValue({
    module: 'WinstonModule',
    providers: [],
    exports: [],
  }),
}));

// Import sau khi mock
import {
  getLogLevel,
  createFileTransport,
  winstonConfig,
  createWinstonLogger,
  WinstonLoggerModule,
} from '../../../src/utils/logger';

describe('Logger Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  describe('getLogLevel', () => {
    it('should return LOG_LEVEL when set', () => {
      process.env.LOG_LEVEL = 'debug';
      expect(getLogLevel()).toBe('debug');
    });

    it('should return info for production when LOG_LEVEL not set', () => {
      process.env.NODE_ENV = 'production';
      expect(getLogLevel()).toBe('info');
    });

    it('should return debug for non-production when LOG_LEVEL not set', () => {
      process.env.NODE_ENV = 'development';
      expect(getLogLevel()).toBe('debug');
    });

    it('should return debug when neither LOG_LEVEL nor NODE_ENV set', () => {
      expect(getLogLevel()).toBe('debug');
    });

    it('should return empty string when LOG_LEVEL is empty', () => {
      process.env.LOG_LEVEL = '';
      expect(getLogLevel()).toBe('');
    });

    it('should return custom LOG_LEVEL value', () => {
      process.env.LOG_LEVEL = 'custom-level';
      expect(getLogLevel()).toBe('custom-level');
    });
  });

  describe('createFileTransport', () => {
    it('should create DailyRotateFile transport', () => {
      const filename = 'test-%DATE%.log';
      const level = 'info';

      const result = createFileTransport(filename, level);

      expect(result).toBeDefined();
    });

    it('should create transport with different filename and level', () => {
      const filename = 'error-%DATE%.log';
      const level = 'error';

      const result = createFileTransport(filename, level);

      expect(result).toBeDefined();
    });
  });

  describe('winstonConfig', () => {
    it('should have correct structure', () => {
      expect(winstonConfig).toHaveProperty('level');
      expect(winstonConfig).toHaveProperty('format');
      expect(winstonConfig).toHaveProperty('transports');
      expect(Array.isArray(winstonConfig.transports)).toBe(true);
    });

    it('should use environment LOG_LEVEL', () => {
      process.env.LOG_LEVEL = 'warn';
      // Re-import để trigger lại getLogLevel
      jest.resetModules();
      const { winstonConfig: newConfig } = require('../../../src/utils/logger');
      expect(newConfig.level).toBe('warn');
    });
  });

  describe('createWinstonLogger', () => {
    it('should create Winston logger module', () => {
      const result = createWinstonLogger();
      expect(result).toBeDefined();
    });
  });

  describe('WinstonLoggerModule', () => {
    it('should be defined', () => {
      expect(WinstonLoggerModule).toBeDefined();
    });
  });
});
