import { LocalStrategy } from '../../../../src/common/auth/local.strategy';
import { AuthService } from '../../../../src/core/auth/service/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      validateUser: jest.fn(),
    } as any;
    strategy = new LocalStrategy(authService);
  });

  it('trả về user khi validate thành công', async () => {
    const user = { userId: '1', username: 'test' };
    authService.validateUser.mockResolvedValue(user);
    const result = await strategy.validate('test', '123');
    expect(result).toBe(user);
    expect(authService.validateUser).toHaveBeenCalledWith('test', '123');
  });

  it('throw UnauthorizedException khi user không hợp lệ', async () => {
    authService.validateUser.mockResolvedValue(null);
    await expect(strategy.validate('test', '123')).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
  });

  it('throw lỗi khi validateUser throw', async () => {
    authService.validateUser.mockRejectedValue(new Error('fail'));
    await expect(strategy.validate('test', '123')).rejects.toThrow('fail');
  });
});
