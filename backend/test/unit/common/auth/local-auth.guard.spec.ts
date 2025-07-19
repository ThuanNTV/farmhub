import { LocalAuthGuard } from '../../../../src/common/auth/local-auth.guard';

describe('LocalAuthGuard', () => {
  it('khởi tạo đúng class', () => {
    const guard = new LocalAuthGuard();
    expect(guard).toBeInstanceOf(LocalAuthGuard);
  });
});
