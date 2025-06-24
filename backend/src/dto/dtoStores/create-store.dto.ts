import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export enum PaperSize {
  k58 = 'k58',
  k80 = 'k80',
  a5 = 'a5',
}

class BankInfoDto {
  @IsString()
  bankId!: string;

  @IsString()
  accountNo!: string;

  @IsString()
  accountName!: string;
}

class PrintingPreferencesDto {
  @IsString()
  defaultPaperSize!: PaperSize;
}

class StoreDefaultsDto {
  @IsString()
  unit!: string;

  @IsOptional()
  discount?: number;

  @IsOptional()
  shippingFee?: number;
}

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
  isDeleted?: boolean;

  // 🏦 Bank Info
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

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
  @ValidateNested()
  @Type(() => PrintingPreferencesDto)
  printingPreferences?: PrintingPreferencesDto;

  @IsOptional()
  @IsString({ message: 'Invoice footer must be a string' })
  invoiceFooter?: string;

  // 💾 Backup
  @IsOptional()
  @IsString({ message: 'Backup schedule must be a string' })
  backupSchedule?: string;

  // ⚙️ Configs
  @IsOptional()
  @ValidateNested()
  @Type(() => StoreDefaultsDto)
  defaults?: StoreDefaultsDto;
}
