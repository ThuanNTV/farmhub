import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

/**
 * Service để quản lý log level động
 * Cho phép thay đổi log level runtime mà không cần restart app
 */
@Injectable()
export class LogLevelService {
  private readonly logger = new Logger(LogLevelService.name);
  private currentLogLevel: string;

  constructor(private configService: ConfigService) {
    this.currentLogLevel =
      this.configService.get<string>('LOG_LEVEL') ?? 'info';
  }

  /**
   * Lấy log level hiện tại
   */
  getCurrentLogLevel(): string {
    return this.currentLogLevel;
  }

  /**
   * Thay đổi log level cho tất cả Winston transports
   */
  setLogLevel(level: string): {
    success: boolean;
    message: string;
    previousLevel: string;
  } {
    const validLevels = ['error', 'warn', 'info', 'debug'];

    if (!validLevels.includes(level)) {
      return {
        success: false,
        message: `Invalid log level: ${level}. Valid levels are: ${validLevels.join(', ')}`,
        previousLevel: this.currentLogLevel,
      };
    }

    const previousLevel = this.currentLogLevel;
    this.currentLogLevel = level;

    try {
      // Cập nhật log level cho Winston logger
      const winstonLogger = winston.loggers.get('default');
      winstonLogger.level = level;

      // Cập nhật level cho từng transport
      winstonLogger.transports.forEach((transport) => {
        if (transport instanceof winston.transports.Console) {
          transport.level = level;
        }
      });

      this.logger.log(`Log level changed from ${previousLevel} to ${level}`);

      return {
        success: true,
        message: `Log level successfully changed to ${level}`,
        previousLevel,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to change log level: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        message: `Failed to change log level: ${err.message}`,
        previousLevel,
      };
    }
  }

  /**
   * Lấy thông tin về log level theo môi trường
   */
  getLogLevelInfo(): {
    current: string;
    environment: string;
    recommended: string;
    available: string[];
  } {
    const environment =
      this.configService.get<string>('NODE_ENV') ?? 'development';
    const recommended = environment === 'production' ? 'info' : 'debug';

    return {
      current: this.currentLogLevel,
      environment,
      recommended,
      available: ['error', 'warn', 'info', 'debug'],
    };
  }

  /**
   * Reset log level về mặc định theo môi trường
   */
  resetLogLevel(): { success: boolean; message: string; newLevel: string } {
    const environment =
      this.configService.get<string>('NODE_ENV') ?? 'development';
    const defaultLevel = environment === 'production' ? 'info' : 'debug';

    const result = this.setLogLevel(defaultLevel);

    return {
      success: result.success,
      message: result.success
        ? `Log level reset to default (${defaultLevel}) for ${environment} environment`
        : result.message,
      newLevel: defaultLevel,
    };
  }

  /**
   * Kiểm tra xem log level có được enable không
   */
  isLogLevelEnabled(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(this.currentLogLevel);
    const checkIndex = levels.indexOf(level);

    return currentIndex >= checkIndex;
  }

  /**
   * Lấy thống kê log level usage
   */
  getLogLevelStats(): {
    current: string;
    enabledLevels: string[];
    disabledLevels: string[];
    totalLevels: number;
  } {
    const allLevels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = allLevels.indexOf(this.currentLogLevel);

    const enabledLevels = allLevels.slice(0, currentIndex + 1);
    const disabledLevels = allLevels.slice(currentIndex + 1);

    return {
      current: this.currentLogLevel,
      enabledLevels,
      disabledLevels,
      totalLevels: allLevels.length,
    };
  }
}
