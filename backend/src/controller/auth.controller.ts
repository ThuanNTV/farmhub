import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SafeUser,
} from 'src/dto/dtoAuth/auth.dto';
import { CreateUserDto } from 'src/dto/dtoUsers/create-user.dto';
import { AuthService } from 'src/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req: { user: SafeUser }): SafeUser {
    return req.user; // chứa thông tin đã decode từ token
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user as SafeUser);
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
