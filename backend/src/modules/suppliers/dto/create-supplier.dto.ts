import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'ID nhà cung cấp', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Tên nhà cung cấp' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Mã số thuế', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty({ description: 'Người liên hệ', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}
