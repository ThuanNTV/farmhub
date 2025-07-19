/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// Helper function to get log level based on environment
export const getLogLevel = (): string => {
  return process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
};

// Tạo transport cho file log với rotation
export const createFileTransport = (filename: string, level: string) => {
  return new DailyRotateFile({
    filename,
    level,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  });
};

// Cấu hình Winston Logger
export const winstonConfig = {
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
      const contextStr = context
        ? `[${typeof context === 'object' && context !== null && !Array.isArray(context) ? JSON.stringify(context, null, 2) : JSON.stringify(context)}]`
        : '';
      const stackStr = stack
        ? `\n${typeof stack === 'string' ? stack : JSON.stringify(stack, null, 2)}`
        : '';
      return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)}${String(stackStr)}`;
    }),
  ),
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      level: process.env.LOG_LEVEL ?? 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),

    // File transport - All logs
    createFileTransport('logs/application-%DATE%.log', 'debug'),

    // File transport - Error logs only
    createFileTransport('logs/error-%DATE%.log', 'error'),

    // File transport - Info logs only (production)
    createFileTransport('logs/info-%DATE%.log', 'info'),
  ],
};

// Tạo Winston Module để inject vào NestJS
export const createWinstonLogger = () => {
  return WinstonModule.createLogger(winstonConfig);
};

// Export để sử dụng trong main.ts
export const WinstonLoggerModule = WinstonModule.forRoot(winstonConfig);
