import {
  Injectable,
  UnauthorizedException,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/core/user/service/users.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    // Có thể bổ sung SecurityService, EmailService nếu cần
  ) {}

  async validateUser(usernameOrEmail: string, password: string, clientIP?: string): Promise<any> {
    const user = await this.usersService.findOneUsernameOrEmail(usernameOrEmail);
    if (!user || !user.password_hash) {
      if (this['securityService'] && this['securityService'].recordFailedLoginAttempt && clientIP)
        this['securityService'].recordFailedLoginAttempt(clientIP);
      return null;
    }
    if (this['securityService'] && this['securityService'].isLoginBlocked && clientIP) {
      if (this['securityService'].isLoginBlocked(clientIP)) {
        throw new UnauthorizedException();
      }
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      if (this['securityService'] && this['securityService'].recordFailedLoginAttempt && clientIP)
        this['securityService'].recordFailedLoginAttempt(clientIP);
      return null;
    }
    if (user.is_deleted) {
      if (this['securityService'] && this['securityService'].recordFailedLoginAttempt && clientIP)
        this['securityService'].recordFailedLoginAttempt(clientIP);
      throw new UnauthorizedException('Tài khoản không hoạt động hoặc đã bị xoá');
    }
    if (!user.is_active) {
      if (this['securityService'] && this['securityService'].recordFailedLoginAttempt && clientIP)
        this['securityService'].recordFailedLoginAttempt(clientIP);
      throw new UnauthorizedException();
    }
    if (this['securityService'] && this['securityService'].recordSuccessfulLogin && clientIP)
      this['securityService'].recordSuccessfulLogin(clientIP);
    // Chuyển sang kiểu SafeUser
    return {
      userId: user.user_id,
      username: user.user_name,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      associatedStoreIds: [],
      isSuperadmin: user.is_superadmin,
    };
  }

  async login(user: any, clientIP?: string, userAgent?: string) {
    await this.usersService.updateLastLogin(user.user_id || user.userId);
    const payload = {
      username: user.user_name || user.username,
      sub: user.user_id || user.userId,
      role: user.role,
      email: user.email,
    };
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    if (clientIP && userAgent && this['securityService'] && this['securityService'].createSession) {
      this['securityService'].createSession(user.user_id || user.userId, sessionId, clientIP, userAgent);
    }
    return {
      message: '🎉 Đăng nhập thành công!',
      data: {
        access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
        user: { ...user },
        sessionId,
      },
    };
  }

  async logout(token: string) {
    if (this['securityService'] && this['securityService'].blacklistToken)
      this['securityService'].blacklistToken(token, 'User logout');
    return { message: 'Đăng xuất thành công' };
  }

  async register(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneUsernameOrEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    const resetToken = this.jwtService.sign(
      { user_id: user.user_id, type: 'reset' },
      { expiresIn: '15m' },
    );
    await this.usersService.updateResetToken(user.user_id, resetToken);
    // TODO: Gửi email reset password ở đây
    return { message: 'Password reset token sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<any>(token);
      if (payload.type !== 'reset')
        throw new UnauthorizedException('Invalid token');
      const user = await this.usersService.findOneById(payload.user_id);
      if (user.password_reset_token !== token)
        throw new UnauthorizedException('Invalid or expired token');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(payload.user_id, hashedPassword);
      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<any>(refreshToken);
      if (payload.type !== 'refresh')
        throw new UnauthorizedException('Refresh token không hợp lệ');
      const user = await this.usersService.findOneById(payload.user_id);
      const newPayload = {
        username: user.user_name,
        sub: user.user_id,
        role: user.role,
        email: user.email,
      };
      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '1h' }),
        refresh_token: this.jwtService.sign(
          { ...newPayload, type: 'refresh' },
          { expiresIn: '7d' },
        ),
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
