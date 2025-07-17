import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/core/auth/service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail', // Có thể dùng username hoặc email
    });
  }
  // TODO: Add logging to the validate method
  async validate(usernameOrEmail: string, password: string): Promise<any> {
    Logger.log('🔍 LocalStrategy.validate called with:', {
      usernameOrEmail,
      password: '***',
    });

    try {
      const user = await this.authService.validateUser(
        usernameOrEmail,
        password,
      );
      Logger.log(
        '✅ LocalStrategy.validate result:',
        user ? 'User found' : 'User not found',
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    } catch (error) {
      Logger.error(
        '❌ LocalStrategy.validate error:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
