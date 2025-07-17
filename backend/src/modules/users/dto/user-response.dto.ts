import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID người dùng' })
  @Expose({ name: 'userId' })
  userId!: string;

  @ApiProperty({ description: 'Tên đăng nhập' })
  @Expose({ name: 'userName' })
  userName!: string;

  @ApiProperty({ description: 'Họ tên' })
  @Expose({ name: 'fullName' })
  fullName!: string;

  @ApiProperty({ description: 'Email' })
  @Expose({ name: 'email' })
  email!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @Expose({ name: 'phone' })
  phone?: string;

  @ApiProperty({ description: 'Vai trò' })
  @Expose({ name: 'role' })
  role!: string;

  @ApiProperty({ description: 'Hoạt động' })
  @Expose({ name: 'isActive' })
  isActive!: boolean;

  @ApiProperty({ description: 'Superadmin' })
  @Expose({ name: 'isSuperadmin' })
  isSuperadmin!: boolean;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({ description: 'Lần đăng nhập cuối', required: false })
  @Expose({ name: 'lastLoginAt' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Token reset mật khẩu', required: false })
  @Expose({ name: 'passwordResetToken' })
  passwordResetToken?: string;

  @ApiProperty({ description: 'Thời gian hết hạn token', required: false })
  @Expose({ name: 'tokenExpiryAt' })
  tokenExpiryAt?: Date;

  @ApiProperty({
    description: 'Thời gian tạo',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @Exclude()
  passwordHash!: string;
}
