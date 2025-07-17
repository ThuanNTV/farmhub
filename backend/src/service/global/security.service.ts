import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface TokenBlacklist {
  token: string;
  expiresAt: number;
  reason: string;
}

interface UserSession {
  userId: string;
  sessionId: string;
  lastActivity: number;
  ip: string;
  userAgent: string;
}

@Injectable()
export class SecurityService {
  static createSession(createSession: any) {
    throw new Error('Method not implemented.');
  }
  private tokenBlacklist = new Map<string, TokenBlacklist>();
  private userSessions = new Map<string, UserSession>();
  private failedLoginAttempts = new Map<
    string,
    { count: number; lastAttempt: number; blockedUntil?: number }
  >();

  constructor(private jwtService: JwtService) {
    // Cleanup expired records every 5 minutes
    setInterval(() => this.cleanupExpiredRecords(), 5 * 60 * 1000);
  }

  // Token Management
  async validateToken(token: string): Promise<boolean> {
    try {
      // Kiểm tra blacklist
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token đã bị vô hiệu hóa');
      }

      // Verify JWT
      await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      return false;
    }
  }

  blacklistToken(token: string, reason: string = 'User logout'): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.decode(token);
      const expiresAt =
        decoded && typeof (decoded as { exp?: unknown }).exp === 'number'
          ? (decoded as { exp: number }).exp * 1000
          : Date.now() + 24 * 60 * 60 * 1000;

      this.tokenBlacklist.set(token, {
        token,
        expiresAt,
        reason,
      });
    } catch {
      this.tokenBlacklist.set(token, {
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        reason,
      });
    }
  }

  private isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  // Session Management
  createSession(
    userId: string,
    sessionId: string,
    ip: string,
    userAgent: string,
  ): void {
    this.userSessions.set(sessionId, {
      userId,
      sessionId,
      lastActivity: Date.now(),
      ip,
      userAgent,
    });
  }

  updateSessionActivity(sessionId: string): boolean {
    const session = this.userSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  removeSession(sessionId: string): void {
    this.userSessions.delete(sessionId);
  }

  getUserSessions(userId: string): UserSession[] {
    return Array.from(this.userSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  // Login Security
  recordFailedLoginAttempt(identifier: string): void {
    const attempts = this.failedLoginAttempts.get(identifier) ?? {
      count: 0,
      lastAttempt: 0,
    };

    attempts.count++;
    attempts.lastAttempt = Date.now();

    // Block after 5 failed attempts for 15 minutes
    if (attempts.count >= 5) {
      attempts.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }

    this.failedLoginAttempts.set(identifier, attempts);
  }

  recordSuccessfulLogin(identifier: string): void {
    this.failedLoginAttempts.delete(identifier);
  }

  isLoginBlocked(identifier: string): boolean {
    const attempts = this.failedLoginAttempts.get(identifier);
    if (!attempts) return false;

    if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
      return true;
    }

    // Reset if block period has passed
    if (attempts.blockedUntil && Date.now() >= attempts.blockedUntil) {
      this.failedLoginAttempts.delete(identifier);
      return false;
    }

    return false;
  }

  getRemainingBlockTime(identifier: string): number {
    const attempts = this.failedLoginAttempts.get(identifier);
    const remaining =
      attempts?.blockedUntil != null ? attempts.blockedUntil - Date.now() : 0;
    return remaining > 0 ? remaining : 0;
  }

  // Password Security
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // IP Security
  isSuspiciousIP(ip: string): boolean {
    // Check for private/reserved IP ranges
    const privateRanges = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^0\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];
    if (privateRanges.some((re) => re.test(ip))) {
      return true;
    }
    // TODO: Integrate with external IP reputation service (e.g., AbuseIPDB)
    // Example: if (await this.checkExternalReputation(ip)) return true;
    return false;
  }

  // Cleanup
  private cleanupExpiredRecords(): void {
    const now = Date.now();

    // Cleanup expired blacklisted tokens
    for (const [token, record] of this.tokenBlacklist.entries()) {
      if (now > record.expiresAt) {
        this.tokenBlacklist.delete(token);
      }
    }

    // Cleanup expired sessions (30 minutes inactivity)
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > sessionTimeout) {
        this.userSessions.delete(sessionId);
      }
    }

    // Cleanup expired login blocks
    for (const [identifier, attempts] of this.failedLoginAttempts.entries()) {
      if (attempts.blockedUntil && now > attempts.blockedUntil) {
        this.failedLoginAttempts.delete(identifier);
      }
    }
  }

  // Security Reports
  getSecurityReport(): {
    activeSessions: number;
    blacklistedTokens: number;
    blockedUsers: number;
  } {
    const now = Date.now();
    const activeSessions = Array.from(this.userSessions.values()).filter(
      (session) => now - session.lastActivity <= 30 * 60 * 1000,
    ).length;

    const blacklistedTokens = this.tokenBlacklist.size;

    const blockedUsers = Array.from(this.failedLoginAttempts.values()).filter(
      (attempts) => attempts.blockedUntil && now < attempts.blockedUntil,
    ).length;

    return {
      activeSessions,
      blacklistedTokens,
      blockedUsers,
    };
  }
}
