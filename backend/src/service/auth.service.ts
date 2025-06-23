import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/dto/dtoUsers/create-user.dto';
import { UsersService } from 'src/service/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Validate bằng username hoặc email
  async validateUser(usernameOrEmail: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    Logger.log('👤 Đang xác thực:', usernameOrEmail, password);
    if (!user) {
      // Delay trả về để chống timing attack
      await bcrypt.compare(
        password,
        '$2b$10$invalidsaltfortimingattack........',
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      return null;
    }

    if (!user.isActive || user.isDelete) {
      throw new UnauthorizedException(
        'Tài khoản không hoạt động hoặc đã bị xoá',
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    const { ...safeUser } = user;

    return safeUser;
  }
  async login(user: any) {
    // Cập nhật last login
    await this.usersService.updateLastLogin(user.userId);

    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
      email: user.email,
    };

    return {
      mesage: '🎉 Đăng nhập thành công!',
      data: {
        access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
        user: {
          userId: user.userId,
          userName: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          associatedStoreIds: user.associatedStoreIds,
          isSuperadmin: user.isSuperadmin,
        },
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByUsernameOrEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { userId: user.userId, type: 'reset' },
      { expiresIn: '15m' },
    );

    await this.usersService.updateResetToken(user.userId, resetToken);

    // Gửi email reset password ở đây
    return { message: 'Password reset token sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findOneById(payload.userId);
      if (!user || user.passwordResetToken !== token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(payload.userId, hashedPassword);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
