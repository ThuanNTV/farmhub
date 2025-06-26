import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';

export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  STORE_MANAGER = 'store_manager',
  STORE_STAFF = 'store_staff',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password!: string;

  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  fullName!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(7, 20, { message: 'Phone must be between 7 and 20 characters' })
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.STORE_MANAGER;

  @IsOptional()
  @IsArray({ message: 'Associated store IDs must be an array' })
  associatedStoreIds?: string[];

  @IsOptional()
  @IsDateString(
    {},
    { message: 'last_login_at must be a valid ISO date string' },
  )
  lastLoginAt?: string;

  @IsOptional()
  @IsString({ message: 'Password reset token must be a string' })
  passwordResetToken?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'token_expiry_at must be a valid ISO date string' },
  )
  tokenExpiryAt?: string;
}
