import { JwtAuthGuard } from '../../../../src/common/auth/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('khởi tạo đúng class', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
