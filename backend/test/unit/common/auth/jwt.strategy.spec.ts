import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { JwtStrategy } from '../../../../src/common/auth/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('validate trả về user info đúng', () => {
    const payload = {
      sub: 'user1',
      username: 'test',
      email: 'test@mail.com',
      role: UserRole.ADMIN_GLOBAL,
    };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: 'user1',
      username: 'test',
      email: 'test@mail.com',
      role: UserRole.ADMIN_GLOBAL,
    });
  });
});
