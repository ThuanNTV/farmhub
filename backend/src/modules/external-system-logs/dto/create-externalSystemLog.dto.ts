import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateExternalSystemLogDto {
  @ApiProperty()
  @IsUUID()
  storeId!: string;

  @ApiProperty()
  @IsString()
  systemName!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  requestPayload?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  responsePayload?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  httpMethod?: string;

  @ApiProperty()
  @IsString()
  endpoint!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  statusCode?: number;

  @ApiProperty()
  @IsBoolean()
  isSuccess!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
