import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CustomerType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  BUSINESS = 'business',
  VIP = 'vip',
}

export class CreateCustomerDto {
  @ApiProperty({ description: 'ID khách hàng' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  customerId!: string; // maps to customer_id

  @ApiProperty({ description: 'Tên khách hàng' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  @Length(5, 255)
  email?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Mã số thuế', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string; // maps to tax_code

  @ApiProperty({
    description: 'Loại khách hàng',
    enum: CustomerType,
    default: CustomerType.RETAIL,
  })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType = CustomerType.RETAIL; // maps to customer_type

  @ApiProperty({
    description: 'Giới tính',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({ description: 'Ngày sinh', required: false })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({ description: 'Mã giới thiệu', required: false })
  @IsOptional()
  @IsString()
  refCode?: string; // maps to ref_code

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  note?: string;

  @ApiProperty({ description: 'Hạn mức tín dụng', required: false })
  @IsOptional()
  creditLimit?: number; // maps to credit_limit

  @ApiProperty({ description: 'Tổng nợ', required: false })
  @IsOptional()
  totalDebt?: number; // maps to total_debt

  @ApiProperty({ description: 'Ngày đến hạn nợ', required: false })
  @IsOptional()
  @IsDateString()
  debtDueDate?: string; // maps to debt_due_date

  @ApiProperty({ description: 'Ngày mua cuối', required: false })
  @IsOptional()
  @IsDateString()
  lastPurchaseDate?: string; // maps to last_purchase_date

  @ApiProperty({ description: 'Trạng thái', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  status?: string;

  @ApiProperty({ description: 'Hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
