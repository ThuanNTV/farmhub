import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { createWinstonLogger, WinstonLoggerModule } from 'src/utils/logger';

describe('Winston Logger', () => {
  let logger: Logger;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [WinstonLoggerModule],
    }).compile();

    logger = module.get<Logger>(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should create winston logger', () => {
    const winstonLogger = createWinstonLogger();
    expect(winstonLogger).toBeDefined();
  });

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
});
