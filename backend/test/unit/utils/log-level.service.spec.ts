import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LogLevelService } from 'src/utils/log-level.service';
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

// Mock winston
jest.mock('winston', () => ({
  loggers: {
    get: jest.fn(),
  },
  transports: {
    Console: jest.fn().mockImplementation(() => ({
      level: 'debug',
    })),
  },
}));

describe('LogLevelService', () => {
  let service: LogLevelService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockConfig = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogLevelService,
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<LogLevelService>(LogLevelService);
    mockConfigService = module.get(ConfigService);

    // Spy on logger methods
    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  beforeEach(() => {
    // Reset mocks
    mockConfigService.get.mockReset();
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'LOG_LEVEL') return 'info';
      if (key === 'NODE_ENV') return 'development';
      return undefined;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentLogLevel', () => {
    it('should return current log level', () => {
      const result = service.getCurrentLogLevel();
      expect(result).toBe('info');
    });

    it('should return default level when config is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const testService = new LogLevelService(mockConfigService);
      const result = testService.getCurrentLogLevel();

      expect(result).toBe('info');
    });
  });

  describe('setLogLevel', () => {
    it('should successfully change log level', () => {
      const result = service.setLogLevel('debug');

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully changed to debug');
      expect(result.previousLevel).toBe('info');
      expect(service.getCurrentLogLevel()).toBe('debug');
    });

    it('should reject invalid log level', () => {
      const result = service.setLogLevel('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid log level');
      expect(result.previousLevel).toBe('info');
      expect(service.getCurrentLogLevel()).toBe('info');
    });

    it('should handle all valid log levels', () => {
      const validLevels = ['error', 'warn', 'info', 'debug'];

      validLevels.forEach((level) => {
        const result = service.setLogLevel(level);
        expect(result.success).toBe(true);
        expect(service.getCurrentLogLevel()).toBe(level);
      });
    });
  });

  describe('getLogLevelInfo', () => {
    it('should return complete log level information', () => {
      const result = service.getLogLevelInfo();

      expect(result).toEqual({
        current: 'info',
        environment: 'development',
        recommended: 'debug',
        available: ['error', 'warn', 'info', 'debug'],
      });
    });

    it('should recommend info for production environment', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return 'info';
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      const result = testService.getLogLevelInfo();

      expect(result.recommended).toBe('info');
      expect(result.environment).toBe('production');
    });
  });

  describe('resetLogLevel', () => {
    it('should reset to debug in development environment', () => {
      service.setLogLevel('error');

      const result = service.resetLogLevel();

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe('debug');
      expect(service.getCurrentLogLevel()).toBe('debug');
    });

    it('should reset to info in production environment', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return 'error';
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      testService.setLogLevel('error');

      const result = testService.resetLogLevel();

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe('info');
    });
  });

  describe('isLogLevelEnabled', () => {
    it('should correctly identify enabled levels', () => {
      service.setLogLevel('info');

      expect(service.isLogLevelEnabled('error')).toBe(true);
      expect(service.isLogLevelEnabled('warn')).toBe(true);
      expect(service.isLogLevelEnabled('info')).toBe(true);
      expect(service.isLogLevelEnabled('debug')).toBe(false);
    });

    it('should work with debug level', () => {
      service.setLogLevel('debug');

      expect(service.isLogLevelEnabled('error')).toBe(true);
      expect(service.isLogLevelEnabled('warn')).toBe(true);
      expect(service.isLogLevelEnabled('info')).toBe(true);
      expect(service.isLogLevelEnabled('debug')).toBe(true);
    });

    it('should work with error level', () => {
      service.setLogLevel('error');

      expect(service.isLogLevelEnabled('error')).toBe(true);
      expect(service.isLogLevelEnabled('warn')).toBe(false);
      expect(service.isLogLevelEnabled('info')).toBe(false);
      expect(service.isLogLevelEnabled('debug')).toBe(false);
    });
  });

  describe('getLogLevelStats', () => {
    it('should return correct stats for info level', () => {
      service.setLogLevel('info');

      const result = service.getLogLevelStats();

      expect(result).toEqual({
        current: 'info',
        enabledLevels: ['error', 'warn', 'info'],
        disabledLevels: ['debug'],
        totalLevels: 4,
      });
    });

    it('should return correct stats for debug level', () => {
      service.setLogLevel('debug');

      const result = service.getLogLevelStats();

      expect(result).toEqual({
        current: 'debug',
        enabledLevels: ['error', 'warn', 'info', 'debug'],
        disabledLevels: [],
        totalLevels: 4,
      });
    });

    it('should return correct stats for error level', () => {
      service.setLogLevel('error');

      const result = service.getLogLevelStats();

      expect(result).toEqual({
        current: 'error',
        enabledLevels: ['error'],
        disabledLevels: ['warn', 'info', 'debug'],
        totalLevels: 4,
      });
    });

    it('should return correct stats for warn level', () => {
      service.setLogLevel('warn');

      const result = service.getLogLevelStats();

      expect(result).toEqual({
        current: 'warn',
        enabledLevels: ['error', 'warn'],
        disabledLevels: ['info', 'debug'],
        totalLevels: 4,
      });
    });
  });

  describe('setLogLevel with winston integration', () => {
    beforeEach(() => {
      // Mock winston logger and transports
      const mockTransport = {
        level: 'info',
      };

      const mockWinstonLogger = {
        level: 'info',
        transports: [mockTransport],
      };

      (winston.loggers.get as jest.Mock).mockReturnValue(mockWinstonLogger);
    });

    it('should update winston logger level successfully', () => {
      const result = service.setLogLevel('debug');

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully changed to debug');
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Log level changed from info to debug'),
      );
    });

    it('should handle winston logger error', () => {
      // Mock winston to throw error
      (winston.loggers.get as jest.Mock).mockImplementation(() => {
        throw new Error('Winston error');
      });

      const result = service.setLogLevel('debug');

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Failed to change log level: Winston error',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to change log level: Winston error'),
        expect.any(String),
      );
    });

    it('should handle console transport update', () => {
      const mockConsoleTransport = new winston.transports.Console();
      mockConsoleTransport.level = 'info';

      const mockWinstonLogger = {
        level: 'info',
        transports: [mockConsoleTransport],
      };

      (winston.loggers.get as jest.Mock).mockReturnValue(mockWinstonLogger);

      const result = service.setLogLevel('debug');

      expect(result.success).toBe(true);
      expect(mockConsoleTransport.level).toBe('debug');
    });
  });

  describe('isLogLevelEnabled edge cases', () => {
    it('should handle invalid level in check', () => {
      service.setLogLevel('info');

      // Test with invalid level should return false
      expect(service.isLogLevelEnabled('invalid')).toBe(false);
    });

    it('should work with warn level', () => {
      service.setLogLevel('warn');

      expect(service.isLogLevelEnabled('error')).toBe(true);
      expect(service.isLogLevelEnabled('warn')).toBe(true);
      expect(service.isLogLevelEnabled('info')).toBe(false);
      expect(service.isLogLevelEnabled('debug')).toBe(false);
    });
  });

  describe('getLogLevelInfo edge cases', () => {
    it('should handle undefined NODE_ENV', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return 'info';
        if (key === 'NODE_ENV') return undefined;
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      const result = testService.getLogLevelInfo();

      expect(result.environment).toBe('development');
      expect(result.recommended).toBe('debug');
    });
  });

  describe('resetLogLevel edge cases', () => {
    it('should handle undefined NODE_ENV in reset', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return 'error';
        if (key === 'NODE_ENV') return undefined;
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      const result = testService.resetLogLevel();

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe('debug'); // defaults to development
    });

    it('should handle reset failure', () => {
      // Mock winston to throw error during reset
      (winston.loggers.get as jest.Mock).mockImplementation(() => {
        throw new Error('Reset error');
      });

      const result = service.resetLogLevel();

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'Failed to change log level: Reset error',
      );
    });
  });

  describe('constructor edge cases', () => {
    it('should handle null LOG_LEVEL config', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return null;
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      const result = testService.getCurrentLogLevel();

      expect(result).toBe('info'); // fallback to default
    });

    it('should handle empty string LOG_LEVEL config', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'LOG_LEVEL') return '';
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });

      const testService = new LogLevelService(mockConfigService);
      const result = testService.getCurrentLogLevel();

      expect(result).toBe('info'); // fallback to default
    });
  });
});
