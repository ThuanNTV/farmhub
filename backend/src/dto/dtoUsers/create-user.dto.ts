import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
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
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID cannot be empty' })
  userId!: string;

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
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(7, 20, { message: 'Phone must be between 7 and 20 characters' })
  phone?: string;

  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role!: UserRole;

  @IsOptional()
  @IsArray({ message: 'Associated store IDs must be an array' })
  associatedStoreIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'is_active must be true or false' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDelete must be a boolean' })
  isDelete?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'is_superadmin must be true or false' })
  isSuperadmin?: boolean;

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
