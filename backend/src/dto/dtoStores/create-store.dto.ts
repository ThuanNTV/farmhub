import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name!: string;

  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address cannot be empty' })
  address!: string;

  @IsString({ message: 'Phone must be a string' })
  @Length(7, 20, { message: 'Phone must be between 7 and 20 characters' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsString({ message: 'Database name must be a string' })
  @IsNotEmpty({ message: 'Database name cannot be empty' })
  databaseName!: string;

  @IsOptional()
  @IsString({ message: 'Manager ID must be a string' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: 'Opening hours must be a string' })
  openingHours?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDelete must be a boolean' })
  isDelete?: boolean;

  // 🏦 Bank Info
  @IsOptional()
  @IsString({ message: 'Bank ID must be a string' })
  bankId?: string;

  @IsOptional()
  @IsString({ message: 'Account number must be a string' })
  accountNo?: string;

  @IsOptional()
  @IsString({ message: 'Account name must be a string' })
  accountName?: string;

  // 🧾 VAT
  @IsOptional()
  @IsBoolean({ message: 'VAT enabled must be a boolean' })
  isVatEnabled?: boolean;

  @IsOptional()
  @IsInt({ message: 'VAT rate must be an integer' })
  @Min(0, { message: 'VAT rate must be 0 or greater' })
  vatRate?: number;

  // 🧾 Invoice
  @IsOptional()
  @IsString({ message: 'Invoice footer must be a string' })
  invoiceFooter?: string;

  @IsOptional()
  @IsEnum(['k58', 'k80', 'a5'], {
    message: 'Default paper size must be one of: k58, k80, a5',
  })
  defaultPaperSize?: 'k58' | 'k80' | 'a5';

  // 💾 Backup
  @IsOptional()
  @IsString({ message: 'Backup schedule must be a string' })
  backupSchedule?: string;

  // ⚙️ Configs
  @IsOptional()
  @IsString({ message: 'Default unit must be a string' })
  defaultUnit?: string;

  @IsOptional()
  @IsInt({ message: 'Default discount must be an integer' })
  @Min(0, { message: 'Default discount cannot be negative' })
  defaultDiscount?: number;

  @IsOptional()
  @IsInt({ message: 'Default shipping fee must be an integer' })
  @Min(0, { message: 'Default shipping fee cannot be negative' })
  defaultShippingFee?: number;
}
