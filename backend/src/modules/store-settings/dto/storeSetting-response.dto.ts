import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class StoreSettingResponseDto {
  @ApiProperty({ description: 'ID cài đặt' })
  @Expose({ name: 'id' })
  id!: string;

  @ApiProperty({ description: 'ID cửa hàng' })
  @Expose({ name: 'storeId' })
  storeId!: string;

  @ApiProperty({ description: 'Khóa cài đặt' })
  @Expose({ name: 'settingKey' })
  settingKey!: string;

  @ApiProperty({ description: 'Giá trị cài đặt', required: false })
  @Expose({ name: 'settingValue' })
  settingValue?: string;

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

  @ApiProperty({ description: 'Người tạo', required: false })
  @Expose({ name: 'createdByUserId' })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @Expose({ name: 'updatedByUserId' })
  @Exclude()
  updatedByUserId?: string;
}
