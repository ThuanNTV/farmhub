import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import { ForgotPasswordDto, ResetPasswordDto } from 'src/dto/dtoAuth/auth.dto';
import { CreateUserDto } from 'src/dto/dtoUsers/create-user.dto';
import { AuthService } from 'src/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
