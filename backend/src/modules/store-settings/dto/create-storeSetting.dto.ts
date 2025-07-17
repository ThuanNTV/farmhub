import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreSettingDto {
  @ApiProperty({ description: 'ID cửa hàng' })
  @IsString()
  storeId!: string; // maps to store_id

  @ApiProperty({ description: 'Khóa cài đặt' })
  @IsString()
  settingKey!: string; // maps to setting_key

  @ApiProperty({ description: 'Giá trị cài đặt', required: false })
  @IsOptional()
  @IsString()
  settingValue?: string; // maps to setting_value

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}
