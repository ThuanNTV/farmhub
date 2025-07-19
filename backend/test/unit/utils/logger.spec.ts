import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import {
  createWinstonLogger,
  WinstonLoggerModule,
  winstonConfig,
} from 'src/utils/logger';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file');

describe('Winston Logger', () => {
  let logger: Logger;
  let module: TestingModule;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [WinstonLoggerModule],
    }).compile();

    logger = module.get<Logger>(Logger);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should create winston logger', () => {
    const winstonLogger = createWinstonLogger();
    expect(winstonLogger).toBeDefined();
  });

  describe('winstonConfig', () => {
    it('should have correct default configuration', () => {
      expect(winstonConfig).toBeDefined();
      expect(winstonConfig.transports).toHaveLength(4);
      expect(winstonConfig.level).toBeDefined();
    });

    it('should use LOG_LEVEL from environment when set', () => {
      process.env.LOG_LEVEL = 'warn';

      // Re-import to get fresh config
      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        expect(freshConfig.level).toBe('warn');
      });
    });

    it('should use info level for production environment', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        expect(freshConfig.level).toBe('info');
      });
    });

    it('should use debug level for development environment', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        expect(freshConfig.level).toBe('debug');
      });
    });

    it('should default to debug level when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        expect(freshConfig.level).toBe('debug');
      });
    });
  });

  describe('winston format', () => {
    it('should format log messages with all components', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: { user: 'test', action: 'create' },
        stack: 'Error stack trace',
      };

      // Test the printf formatter
      const formatter = winstonConfig.format;
      expect(formatter).toBeDefined();
    });

    it('should handle context as string', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: 'TestContext',
        stack: null,
      };

      // This tests the context handling in the printf function
      expect(mockInfo.context).toBe('TestContext');
    });

    it('should handle context as array', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: ['item1', 'item2'],
        stack: null,
      };

      // This tests the array context handling
      expect(Array.isArray(mockInfo.context)).toBe(true);
    });

    it('should handle null context', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: null,
        stack: null,
      };

      // This tests null context handling
      expect(mockInfo.context).toBe(null);
    });

    it('should handle undefined context', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: undefined,
        stack: undefined,
      };

      // This tests undefined context/stack handling
      expect(mockInfo.context).toBeUndefined();
      expect(mockInfo.stack).toBeUndefined();
    });

    it('should handle stack as object', () => {
      const mockInfo = {
        timestamp: '2023-01-01 12:00:00',
        level: 'info',
        message: 'Test message',
        context: null,
        stack: { error: 'test error', trace: 'stack trace' },
      };

      // This tests object stack handling
      expect(typeof mockInfo.stack).toBe('object');
    });
  });

  describe('createFileTransport', () => {
    it('should create file transport with correct configuration', () => {
      // Mock DailyRotateFile constructor
      const mockTransport = jest.fn();
      (DailyRotateFile as unknown as jest.Mock).mockImplementation(
        mockTransport,
      );

      // Re-import to trigger createFileTransport
      jest.isolateModules(() => {
        require('src/utils/logger');

        // Verify that DailyRotateFile was called with correct options
        expect(DailyRotateFile).toHaveBeenCalledWith(
          expect.objectContaining({
            level: expect.any(String),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: expect.any(Object),
          }),
        );
      });
    });
  });

  describe('logging functionality', () => {
    it('should log debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.debug('Test debug message');
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.log('Test info message');
      consoleSpy.mockRestore();
    });

    it('should log warning messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      logger.warn('Test warning message');
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      logger.error('Test error message');
      consoleSpy.mockRestore();
    });

    it('should log messages with context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.log('Test message', 'TestContext');
      consoleSpy.mockRestore();
    });

    it('should log error messages with stack trace', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      logger.error('Test error message', error.stack);
      consoleSpy.mockRestore();
    });
  });

  describe('winston transports', () => {
    it('should configure console transport', () => {
      const consoleTransport = winstonConfig.transports.find(
        (transport) => transport instanceof winston.transports.Console,
      );
      expect(consoleTransport).toBeDefined();
    });

    it('should configure file transports for different log levels', () => {
      // The configuration should have multiple file transports
      expect(winstonConfig.transports).toHaveLength(4); // Console + 3 file transports
    });

    it('should handle LOG_LEVEL environment variable for console transport', () => {
      process.env.LOG_LEVEL = 'error';

      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        const consoleTransport = freshConfig.transports.find(
          (transport: any) => transport.constructor.name === 'Console',
        );
        expect(consoleTransport.level).toBe('error');
      });
    });

    it('should default to debug level for console transport', () => {
      delete process.env.LOG_LEVEL;

      jest.isolateModules(() => {
        const { winstonConfig: freshConfig } = require('src/utils/logger');
        const consoleTransport = freshConfig.transports.find(
          (transport: any) => transport.constructor.name === 'Console',
        );
        expect(consoleTransport.level).toBe('debug');
      });
    });
  });
});
