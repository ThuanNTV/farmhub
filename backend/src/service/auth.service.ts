import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SafeUser, ResetToken } from 'src/dto/dtoAuth/auth.dto';
import { CreateUserDto } from 'src/dto/dtoUsers/create-user.dto';
import { UsersService } from 'src/service/users.service';

export interface UserPayload {
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  role: string;
  associatedStoreIds?: string[];
  isSuperadmin?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Validate bằng username hoặc email
  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserPayload | null> {
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

    const {
      userId,
      userName,
      fullName,
      email,
      role,
      associatedStoreIds,
      isSuperadmin,
    } = user;

    return {
      userId,
      userName,
      fullName,
      email,
      role,
      associatedStoreIds,
      isSuperadmin,
    };
  }

  async login(user: SafeUser) {
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
          ...user,
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
      const payload = this.jwtService.verify<ResetToken>(token);

      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findOneById(payload.userId);
      if (user.passwordResetToken !== token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(payload.userId, hashedPassword);

      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
