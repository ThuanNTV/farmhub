import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID cannot be empty' })
  storeId!: string;

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
}
