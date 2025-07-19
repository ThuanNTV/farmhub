import { LogLevelController } from 'src/controllers/log-level.controller';
import { LogLevelService } from 'src/utils/log-level.service';
import { ChangeLogLevelDto } from 'src/controllers/log-level.controller';

describe('LogLevelController', () => {
  let controller: LogLevelController;
  let service: jest.Mocked<LogLevelService>;

  beforeEach(() => {
    service = {
      getLogLevelInfo: jest.fn().mockReturnValue({
        current: 'info',
        environment: 'dev',
        recommended: 'warn',
        available: ['error', 'warn', 'info', 'debug'],
      }),
      setLogLevel: jest.fn().mockReturnValue({
        success: true,
        message: 'Changed',
        previousLevel: 'info',
      }),
      resetLogLevel: jest
        .fn()
        .mockReturnValue({ success: true, message: 'Reset', newLevel: 'info' }),
      getLogLevelStats: jest.fn().mockReturnValue({
        current: 'info',
        enabledLevels: ['info'],
        disabledLevels: ['debug'],
        totalLevels: 2,
      }),
      getCurrentLogLevel: jest.fn().mockReturnValue('info'),
    } as any;
    controller = new LogLevelController(service);
  });

  it('getLogLevelInfo trả về thông tin log level', () => {
    const res = controller.getLogLevelInfo();
    expect(res.data).toEqual(service.getLogLevelInfo());
  });

  it('changeLogLevel trả về kết quả thay đổi', () => {
    const dto: ChangeLogLevelDto = { level: 'debug' };
    const res = controller.changeLogLevel(dto);
    expect(service.setLogLevel).toHaveBeenCalledWith('debug');
    expect(res.success).toBe(true);
    expect(res.data.previousLevel).toBe('info');
    expect(res.data.newLevel).toBe('debug');
  });

  it('resetLogLevel trả về kết quả reset', () => {
    const res = controller.resetLogLevel();
    expect(service.resetLogLevel).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.data.newLevel).toBe('info');
  });

  it('getLogLevelStats trả về thống kê', () => {
    const res = controller.getLogLevelStats();
    expect(res.data).toEqual(service.getLogLevelStats());
  });

  it('testLogs trả về thông tin test log', () => {
    const spyErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const spyInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    const spyDebug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    const res = controller.testLogs();
    expect(res.success).toBe(true);
    expect(res.data.currentLogLevel).toBe('info');
    expect(spyErr).toHaveBeenCalled();
    expect(spyWarn).toHaveBeenCalled();
    expect(spyInfo).toHaveBeenCalled();
    expect(spyDebug).toHaveBeenCalled();
    spyErr.mockRestore();
    spyWarn.mockRestore();
    spyInfo.mockRestore();
    spyDebug.mockRestore();
  });
});
