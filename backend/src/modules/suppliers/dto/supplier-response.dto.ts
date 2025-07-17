import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class SupplierResponseDto {
  @ApiProperty({ description: 'ID nhà cung cấp' })
  @Expose({ name: 'id' })
  id!: string;

  @ApiProperty({ description: 'Tên nhà cung cấp' })
  @Expose({ name: 'name' })
  name!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @Expose({ name: 'phone' })
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  @Expose({ name: 'email' })
  email?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @Expose({ name: 'address' })
  address?: string;

  @ApiProperty({ description: 'Mã số thuế', required: false })
  @Expose({ name: 'taxCode' })
  taxCode?: string;

  @ApiProperty({ description: 'Người liên hệ', required: false })
  @Expose({ name: 'contactPerson' })
  contactPerson?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @Expose({ name: 'note' })
  note?: string;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

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
