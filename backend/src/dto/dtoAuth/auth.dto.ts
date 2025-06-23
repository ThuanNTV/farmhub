import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Username or email must be a string' })
  @IsNotEmpty({ message: 'Username or email cannot be empty' })
  usernameOrEmail!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token!: string;

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

export interface SafeUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  associatedStoreIds: string[];
  isSuperadmin: boolean;
}
