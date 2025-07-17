import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { SecurityService } from 'src/service/global/security.service';

@Injectable()
export class EnhancedJwtStrategy extends PassportStrategy(
  Strategy,
  'enhanced-jwt',
) {
  constructor(private securityService: SecurityService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'secretKey',
      passReqToCallback: true,
    });
  }

  async validate(
    request: { ip?: string; connection?: { remoteAddress?: string } },
    payload: {
      sub: string;
      username: string;
      email: string;
      role: UserRole;
      sessionId?: string;
      iat: number;
      exp: number;
    },
  ) {
    // Kiểm tra token có bị blacklist không
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request as any);
    if (token && !(await this.securityService.validateToken(token))) {
      throw new UnauthorizedException(
        'Token không hợp lệ hoặc đã bị vô hiệu hóa',
      );
    }

    // Kiểm tra session nếu có
    if (payload.sessionId) {
      const sessionValid = this.securityService.updateSessionActivity(
        payload.sessionId,
      );
      if (!sessionValid) {
        throw new UnauthorizedException('Session đã hết hạn');
      }
    }

    // Kiểm tra IP suspicious
    const clientIP: string =
      typeof request.ip === 'string'
        ? request.ip
        : request.connection &&
            typeof request.connection.remoteAddress === 'string'
          ? request.connection.remoteAddress
          : 'unknown';
    if (this.securityService.isSuspiciousIP(clientIP)) {
      throw new UnauthorizedException('IP không được phép truy cập');
    }

    // Kiểm tra token age (không cho phép token quá cũ)
    const tokenAge = Date.now() - payload.iat * 1000;
    const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
    if (tokenAge > maxTokenAge) {
      throw new UnauthorizedException('Token quá cũ, vui lòng đăng nhập lại');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      tokenIssuedAt: payload.iat,
      tokenExpiresAt: payload.exp,
    };
  }
}
