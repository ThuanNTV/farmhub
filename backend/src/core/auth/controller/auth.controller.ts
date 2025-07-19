import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import {
  RateLimitAuth,
  RateLimitModerate,
} from 'src/common/decorator/rate-limit.decorator';
import { AuthService } from 'src/core/auth/service/auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SafeUser,
} from 'src/dto/auth/auth.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(EnhancedAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: { user: SafeUser }): SafeUser {
    return req.user; // chứa thông tin đã decode từ token
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @RateLimitAuth()
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiHeader({
    name: 'x-forwarded-for',
    description: 'Client IP address (optional)',
    required: false,
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User agent string (optional)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không đúng' })
  @ApiResponse({ status: 429, description: 'Quá nhiều lần thử đăng nhập' })
  login(
    @Body() loginDto: LoginDto,
    @Request()
    req: {
      user: SafeUser;
      ip?: string;
      connection?: { remoteAddress?: string };
      headers?: Record<string, string>;
    },
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const clientIP =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      forwardedFor ?? req.ip ?? req.connection?.remoteAddress ?? '';
    return this.authService.login(req.user, clientIP, userAgent);
  }

  @Post('logout')
  @UseGuards(EnhancedAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  logout(@Request() req: { user: SafeUser; headers: Record<string, string> }) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      return this.authService.logout(token);
    }
    return { message: 'Đăng xuất thành công' };
  }

  @Post('register')
  @RateLimitModerate()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  @RateLimitModerate()
  @ApiOperation({ summary: 'Quên mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Token reset đã được gửi' })
  @ApiResponse({ status: 404, description: 'Email không tồn tại' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @RateLimitModerate()
  @ApiOperation({ summary: 'Reset mật khẩu' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Làm mới access token từ refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Cấp lại access token thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
