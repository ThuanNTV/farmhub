import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Mock winston và DailyRotateFile trước khi import logger
jest.mock('winston');
jest.mock('winston-daily-rotate-file');
jest.mock('nest-winston');

// Import logger sau khi mock
import {
  getLogLevel,
  createFileTransport,
  winstonConfig,
  createWinstonLogger,
  WinstonLoggerModule,
} from '../../../src/utils/logger';

describe('Logger', () => {
  let mockFormat: any;
  let mockCombine: jest.Mock;
  let mockTimestamp: jest.Mock;
  let mockErrors: jest.Mock;
  let mockLabel: jest.Mock;
  let mockPrintf: jest.Mock;
  let mockColorize: jest.Mock;
  let mockConsoleTransport: jest.Mock;
  let mockDailyRotateFile: jest.Mock;
  let mockCreateLogger: jest.Mock;
  let mockWinstonModule: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Mock winston format functions
    mockCombine = jest.fn();
    mockTimestamp = jest.fn().mockReturnValue('timestamp');
    mockErrors = jest.fn().mockReturnValue('errors');
    mockLabel = jest.fn().mockReturnValue('label');
    mockPrintf = jest.fn().mockReturnValue('printf');
    mockColorize = jest.fn().mockReturnValue('colorize');

    mockFormat = {
      combine: mockCombine,
      timestamp: mockTimestamp,
      errors: mockErrors,
      label: mockLabel,
      printf: mockPrintf,
      colorize: mockColorize,
    };

    // Mock winston transports
    mockConsoleTransport = jest.fn();
    mockConsoleTransport.mockImplementation((options: any) => ({
      ...options,
      _type: 'console',
    }));

    // Mock winston logger
    mockCreateLogger = jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    });

    // Mock winston module
    (winston as any).format = mockFormat;
    (winston as any).transports = {
      Console: mockConsoleTransport,
    };
    (winston as any).createLogger = mockCreateLogger;

    // Mock DailyRotateFile
    mockDailyRotateFile = jest.fn();
    mockDailyRotateFile.mockImplementation((options: any) => ({
      ...options,
      _type: 'dailyRotateFile',
    }));
    (DailyRotateFile as any).mockImplementation(mockDailyRotateFile);

    // Mock WinstonModule
    mockWinstonModule = {
      createLogger: jest.fn().mockReturnValue({
        module: WinstonModule,
        providers: [],
        exports: [],
      }),
      forRoot: jest.fn().mockReturnValue({
        module: WinstonModule,
        providers: [],
        exports: [],
      }),
    };
    (WinstonModule as any).createLogger = mockWinstonModule.createLogger;

    // Clear environment variables
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  describe('getLogLevel', () => {
    it('should return LOG_LEVEL environment variable when set', () => {
      process.env.LOG_LEVEL = 'debug';
      expect(getLogLevel()).toBe('debug');
    });

    it('should return info for production environment when LOG_LEVEL is not set', () => {
      process.env.NODE_ENV = 'production';
      expect(getLogLevel()).toBe('info');
    });

    it('should return debug for non-production environment when LOG_LEVEL is not set', () => {
      process.env.NODE_ENV = 'development';
      expect(getLogLevel()).toBe('debug');
    });

    it('should return debug when neither LOG_LEVEL nor NODE_ENV is set', () => {
      expect(getLogLevel()).toBe('debug');
    });

    it('should return empty string when LOG_LEVEL is empty string', () => {
      process.env.LOG_LEVEL = '';
      expect(getLogLevel()).toBe('');
    });

    it('should return LOG_LEVEL even if it is unusual value', () => {
      process.env.LOG_LEVEL = 'custom-level';
      expect(getLogLevel()).toBe('custom-level');
    });
  });

  describe('createFileTransport', () => {
    it('should create DailyRotateFile transport with correct options', () => {
      const filename = 'test-%DATE%.log';
      const level = 'info';

      const result = createFileTransport(filename, level);

      expect(mockDailyRotateFile).toHaveBeenCalledWith({
        filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level,
      });

      expect(result).toEqual({
        filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level,
        _type: 'dailyRotateFile',
      });
    });

    it('should create transport with different filename and level', () => {
      const filename = 'error-%DATE%.log';
      const level = 'error';

      createFileTransport(filename, level);

      expect(mockDailyRotateFile).toHaveBeenCalledWith({
        filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level,
      });
    });
  });

  describe('winston format printf function', () => {
    let printfFn: (info: any) => string;

    beforeEach(() => {
      // Reset mocks để có thể capture printf function
      mockPrintf.mockClear();
      
      // Import lại để trigger việc tạo winston config
      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);
      
      // Re-import để trigger tạo config
      require('../../../src/utils/logger');
      
      // Lấy printf function từ mock call
      expect(mockPrintf).toHaveBeenCalled();
      printfFn = mockPrintf.mock.calls[0][0];
    });

    it('should format log without context or stack', () => {
      const info = {
        timestamp: '2024-01-01T12:00:00Z',
        level: 'info',
        message: 'Test message',
        label: 'test-service',
      };

      const result = printfFn(info);

      expect(result).toBe('2024-01-01T12:00:00Z [test-service] info: Test message');
    });

    it('should format log with context', () => {
      const info = {
        timestamp: '2024-01-01T12:00:00Z',
        level: 'info',
        message: 'Test message',
        label: 'test-service',
        context: 'TestController',
      };

      const result = printfFn(info);

      expect(result).toBe('2024-01-01T12:00:00Z [test-service] info: [TestController] Test message');
    });

    it('should format log with stack trace', () => {
      const info = {
        timestamp: '2024-01-01T12:00:00Z',
        level: 'error',
        message: 'Test error',
        label: 'test-service',
        stack: 'Error: Test error\n    at test.js:1:1',
      };

      const result = printfFn(info);

      expect(result).toBe(
        '2024-01-01T12:00:00Z [test-service] error: Test error\nError: Test error\n    at test.js:1:1'
      );
    });

    it('should format log with both context and stack', () => {
      const info = {
        timestamp: '2024-01-01T12:00:00Z',
        level: 'error',
        message: 'Test error',
        label: 'test-service',
        context: 'ErrorHandler',
        stack: 'Error: Test error\n    at handler.js:10:5',
      };

      const result = printfFn(info);

      expect(result).toBe(
        '2024-01-01T12:00:00Z [test-service] error: [ErrorHandler] Test error\nError: Test error\n    at handler.js:10:5'
      );
    });
  });

  describe('winstonConfig', () => {
    beforeEach(() => {
      // Clear previous calls
      mockCombine.mockClear();
      mockTimestamp.mockClear();
      mockErrors.mockClear();
      mockLabel.mockClear();
      mockPrintf.mockClear();
      mockConsoleTransport.mockClear();
      mockCreateLogger.mockClear();
    });

    it('should create winston logger with correct configuration', () => {
      process.env.LOG_LEVEL = 'info';

      // Re-import để trigger tạo config với LOG_LEVEL mới
      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);

      const { winstonConfig: config } = require('../../../src/utils/logger');

      expect(mockCreateLogger).toHaveBeenCalledWith({
        level: 'info',
        format: mockFormat.combine(),
        transports: expect.any(Array),
      });
    });

    it('should include console transport in development', () => {
      process.env.NODE_ENV = 'development';

      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);

      require('../../../src/utils/logger');

      expect(mockConsoleTransport).toHaveBeenCalledWith({
        format: expect.anything(),
      });
    });

    it('should include console transport in production', () => {
      process.env.NODE_ENV = 'production';

      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);

      require('../../../src/utils/logger');

      expect(mockConsoleTransport).toHaveBeenCalled();
    });

    it('should create file transports for info and error logs', () => {
      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);

      require('../../../src/utils/logger');

      // Kiểm tra có 2 file transports được tạo (info và error)
      expect(mockDailyRotateFile).toHaveBeenCalledTimes(2);
      
      // Kiểm tra info transport
      expect(mockDailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
      });

      // Kiểm tra error transport
      expect(mockDailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
      });
    });

    it('should configure format correctly', () => {
      jest.resetModules();
      jest.doMock('winston', () => ({
        format: mockFormat,
        transports: { Console: mockConsoleTransport },
        createLogger: mockCreateLogger,
      }));
      jest.doMock('winston-daily-rotate-file', () => mockDailyRotateFile);

      require('../../../src/utils/logger');

      expect(mockTimestamp).toHaveBeenCalled();
      expect(mockErrors).toHaveBeenCalledWith({ stack: true });
      expect(mockLabel).toHaveBeenCalledWith({ label: 'farmhub-backend' });
      expect(mockPrintf).toHaveBeenCalled();
      expect(mockCombine).toHaveBeenCalled();
    });
  });

  describe('createWinstonLogger', () => {
    it('should create winston logger module', () => {
      const result = createWinstonLogger();

      expect(mockWinstonModule.createLogger).toHaveBeenCalledWith({
        instance: expect.any(Object),
      });
      expect(result).toBeDefined();
    });
  });

  describe('WinstonLoggerModule', () => {
    it('should be defined', () => {
      expect(WinstonLoggerModule).toBeDefined();
    });

    it('should create logger module with winston configuration', () => {
      expect(mockWinstonModule.createLogger).toHaveBeenCalled();
    });
  });

  describe('environment edge cases', () => {
    it('should handle undefined NODE_ENV', () => {
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;

      expect(getLogLevel()).toBe('debug');
    });

    it('should handle empty NODE_ENV', () => {
      process.env.NODE_ENV = '';
      delete process.env.LOG_LEVEL;

      expect(getLogLevel()).toBe('debug');
    });

    it('should prioritize LOG_LEVEL over NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'verbose';

      expect(getLogLevel()).toBe('verbose');
    });
  });
});
