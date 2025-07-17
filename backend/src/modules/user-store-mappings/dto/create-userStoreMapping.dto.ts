import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserStoreMappingDto {
  @ApiProperty({ description: 'ID người dùng' })
  @IsUUID()
  userId!: string; // maps to user_id

  @ApiProperty({ description: 'ID cửa hàng' })
  @IsUUID()
  storeId!: string; // maps to store_id

  @ApiProperty({ description: 'Vai trò', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}
