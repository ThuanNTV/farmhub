import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  ADMIN_STORE = 'admin_store',
  STORE_MANAGER = 'store_manager',
  STORE_STAFF = 'store_staff',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ description: 'Tên đăng nhập' })
  @IsString()
  @IsNotEmpty()
  userName!: string; // maps to user_name

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password!: string; // maps to password_hash (hash ở backend)

  @ApiProperty({ description: 'Họ tên' })
  @IsString()
  @IsNotEmpty()
  fullName!: string; // maps to full_name

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;

  @ApiProperty({ description: 'Vai trò', enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ description: 'Hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Superadmin', required: false })
  @IsOptional()
  @IsBoolean()
  isSuperadmin?: boolean;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Lần đăng nhập cuối', required: false })
  @IsOptional()
  @IsDateString()
  lastLoginAt?: string;

  @ApiProperty({ description: 'Token reset mật khẩu', required: false })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiProperty({ description: 'Thời gian hết hạn token', required: false })
  @IsOptional()
  @IsDateString()
  tokenExpiryAt?: string;
}
