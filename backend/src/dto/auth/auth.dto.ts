import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'admin@example.com',
    required: true,
  })
  @IsString({ message: 'Username or email must be a string' })
  @IsNotEmpty({ message: 'Username or email cannot be empty' })
  usernameOrEmail!: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin123',
    required: true,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address for password reset',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token!: string;

  @ApiProperty({
    description: 'New password (8-20 characters)',
    example: 'newSecurePassword123',
    minLength: 8,
    maxLength: 20,
    required: true,
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  newPassword!: string;
}
export class ResetToken {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId!: string;

  @IsString({ message: 'type must be a string' })
  @IsNotEmpty({ message: 'type cannot be empty' })
  type!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for getting new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  refreshToken!: string;
}

export interface SafeUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  associatedStoreIds: string[];
  isSuperadmin: boolean;
}
