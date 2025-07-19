import { Expose } from 'class-transformer';
import { Exclude } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  CreateCustomerDto,
  CustomerType,
} from 'src/modules/customers/dto/create-customer.dto';

export class CustomerResponseDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({ description: 'ID khách hàng' })
  @Expose({ name: 'customerId' })
  customerId!: string;

  @ApiProperty({ description: 'Tên khách hàng' })
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

  @ApiProperty({ description: 'Loại khách hàng', required: false })
  @Expose({ name: 'customerType' })
  customerType?: CustomerType;

  @ApiProperty({ description: 'Giới tính', required: false })
  @Expose({ name: 'gender' })
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({ description: 'Ngày sinh', required: false })
  @Expose({ name: 'birthday' })
  birthday?: string;

  @ApiProperty({ description: 'Mã giới thiệu', required: false })
  @Expose({ name: 'refCode' })
  refCode?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @Expose({ name: 'note' })
  note?: string;

  @ApiProperty({ description: 'Hạn mức tín dụng', required: false })
  @Expose({ name: 'creditLimit' })
  creditLimit?: number;

  @ApiProperty({ description: 'Tổng nợ', required: false })
  @Expose({ name: 'totalDebt' })
  totalDebt?: number;

  @ApiProperty({ description: 'Ngày đến hạn nợ', required: false })
  @Expose({ name: 'debtDueDate' })
  debtDueDate?: string;

  @ApiProperty({ description: 'Ngày mua cuối', required: false })
  @Expose({ name: 'lastPurchaseDate' })
  lastPurchaseDate?: string;

  @ApiProperty({ description: 'Trạng thái', required: false })
  @Expose({ name: 'status' })
  status?: string;

  @ApiProperty({ description: 'Hoạt động' })
  @Expose({ name: 'isActive' })
  isActive!: boolean;

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
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @Exclude()
  updatedByUserId?: string;
}
