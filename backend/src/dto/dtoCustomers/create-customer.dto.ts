import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export enum CustomerType {
  RETAIL = 'retail', // Khách lẻ
  WHOLESALE = 'wholesale', // Khách sỉ
  BUSINESS = 'business', // Khách doanh nghiệp
  VIP = 'vip', // Khách VIP
}

export class CreateCustomerDto {
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID cannot be empty' })
  @Length(1, 50, { message: 'ID must be between 1 and 50 characters' })
  customerId!: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(10, 20, { message: 'Phone must be between 10 and 20 characters' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Length(5, 255, { message: 'Email must be between 5 and 255 characters' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Tax code must be a string' })
  taxCode?: string;

  @IsOptional()
  @IsEnum(CustomerType, { message: 'Customer type must be a valid value' })
  customerType?: CustomerType = CustomerType.RETAIL; // Default to 'retail'

  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  @Length(1, 255, { message: 'Note must be between 1 and 255 characters' })
  note?: string;

  @IsOptional()
  @IsDecimal({}, { message: 'Credit limit must be a decimal number' })
  creditLimit?: number;

  @IsOptional()
  @IsDecimal({}, { message: 'Total debt must be a decimal number' })
  totalDebt?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Debt due date must be a valid ISO date string' },
  )
  debtDueDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Last purchase date must be a valid ISO date string' },
  )
  lastPurchaseDate?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @Length(1, 50, { message: 'Status must be between 1 and 50 characters' })
  status?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true hoặc false' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDeleted phải là true hoặc false' })
  isDeleted?: boolean;
}
