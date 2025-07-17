import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class UserStoreMappingResponseDto {
  @ApiProperty({ description: 'ID người dùng' })
  @Expose({ name: 'userId' })
  userId!: string;

  @ApiProperty({ description: 'ID cửa hàng' })
  @Expose({ name: 'storeId' })
  storeId!: string;

  @ApiProperty({ description: 'Vai trò', required: false })
  @Expose({ name: 'role' })
  role?: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Người tạo', required: false })
  @Exclude()
  createdByUserId?: string;
}
