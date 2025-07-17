import { Expose } from 'class-transformer';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaperSize } from './create-store.dto';

export class StoreResponseDto {
  @ApiProperty({ description: 'ID cửa hàng' })
  @Expose({ name: 'storeId' })
  storeId!: string;

  @ApiProperty({ description: 'Tên cửa hàng' })
  @Expose({ name: 'name' })
  name!: string;

  @ApiProperty({ description: 'Địa chỉ' })
  @Expose({ name: 'address' })
  address!: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @Expose({ name: 'phone' })
  phone!: string;

  @ApiProperty({ description: 'Email', required: false })
  @Expose({ name: 'email' })
  email?: string;

  @ApiProperty({ description: 'Tên schema database' })
  @Exclude()
  schemaName!: string;

  @ApiProperty({ description: 'ID user quản lý', required: false })
  @Exclude()
  managerUserId?: string;

  @ApiProperty({ description: 'Giờ mở cửa', required: false })
  @Expose({ name: 'openingHours' })
  openingHours?: string;

  @ApiProperty({ description: 'Hoạt động' })
  @Expose({ name: 'isActive' })
  isActive!: boolean;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({ description: 'ID ngân hàng', required: false })
  @Exclude()
  bankId?: string;

  @ApiProperty({ description: 'Số tài khoản ngân hàng', required: false })
  @Exclude()
  accountNo?: string;

  @ApiProperty({ description: 'Tên chủ tài khoản', required: false })
  @Exclude()
  accountName?: string;

  @ApiProperty({ description: 'Bật VAT' })
  @Expose({ name: 'isVatEnabled' })
  isVatEnabled!: boolean;

  @ApiProperty({ description: 'Tỷ lệ VAT (%)' })
  @Expose({ name: 'vatRate' })
  vatRate!: number;

  @ApiProperty({ description: 'Chân trang hóa đơn', required: false })
  @Expose({ name: 'invoiceFooter' })
  invoiceFooter?: string;

  @ApiProperty({ description: 'Khổ giấy in mặc định', enum: PaperSize })
  @Expose({ name: 'defaultPaperSize' })
  defaultPaperSize!: PaperSize;

  @ApiProperty({ description: 'Lịch backup', required: false })
  @Expose({ name: 'backupSchedule' })
  backupSchedule?: string;

  @ApiProperty({ description: 'ID đơn vị tính mặc định', required: false })
  @Expose({ name: 'defaultUnitId' })
  defaultUnitId?: string;

  @ApiProperty({ description: 'Chiết khấu mặc định (%)' })
  @Expose({ name: 'defaultDiscount' })
  defaultDiscount!: number;

  @ApiProperty({ description: 'Phí ship mặc định' })
  @Expose({ name: 'defaultShippingFee' })
  defaultShippingFee!: number;

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
}
