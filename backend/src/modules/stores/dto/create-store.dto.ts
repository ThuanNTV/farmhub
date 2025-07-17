import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaperSize {
  k58 = 'k58',
  k80 = 'k80',
  a5 = 'a5',
}

export class CreateStoreDto {
  @ApiProperty({ description: 'Tên cửa hàng' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Địa chỉ' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsString()
  @Length(7, 20)
  phone!: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Tên schema database' })
  @IsString()
  @IsNotEmpty()
  schemaName!: string; // maps to schema_name

  @ApiProperty({ description: 'ID user quản lý', required: false })
  @IsOptional()
  @IsString()
  managerUserId?: string; // maps to manager_user_id

  @ApiProperty({ description: 'Giờ mở cửa', required: false })
  @IsOptional()
  @IsString()
  openingHours?: string; // maps to opening_hours

  @ApiProperty({ description: 'Hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'ID ngân hàng', required: false })
  @IsOptional()
  @IsString()
  bankId?: string; // maps to bank_id

  @ApiProperty({ description: 'Số tài khoản ngân hàng', required: false })
  @IsOptional()
  @IsString()
  accountNo?: string; // maps to account_no

  @ApiProperty({ description: 'Tên chủ tài khoản', required: false })
  @IsOptional()
  @IsString()
  accountName?: string; // maps to account_name

  @ApiProperty({ description: 'Bật VAT', required: false })
  @IsOptional()
  @IsBoolean()
  isVatEnabled?: boolean; // maps to is_vat_enabled

  @ApiProperty({ description: 'Tỷ lệ VAT (%)', required: false })
  @IsOptional()
  @IsInt()
  vatRate?: number; // maps to vat_rate

  @ApiProperty({ description: 'Chân trang hóa đơn', required: false })
  @IsOptional()
  @IsString()
  invoiceFooter?: string; // maps to invoice_footer

  @ApiProperty({
    description: 'Khổ giấy in mặc định',
    enum: PaperSize,
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultPaperSize?: PaperSize; // maps to default_paper_size

  @ApiProperty({ description: 'Lịch backup', required: false })
  @IsOptional()
  @IsString()
  backupSchedule?: string; // maps to backup_schedule

  @ApiProperty({ description: 'ID đơn vị tính mặc định', required: false })
  @IsOptional()
  @IsString()
  defaultUnitId?: string; // maps to default_unit_id

  @ApiProperty({ description: 'Chiết khấu mặc định (%)', required: false })
  @IsOptional()
  @IsInt()
  defaultDiscount?: number; // maps to default_discount

  @ApiProperty({ description: 'Phí ship mặc định', required: false })
  @IsOptional()
  @IsInt()
  defaultShippingFee?: number; // maps to default_shipping_fee
}
