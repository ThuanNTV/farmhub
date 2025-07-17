import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookLogDto {
  @ApiProperty({ description: 'Store ID' })
  @IsString()
  storeId!: string;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  eventType!: string;

  @ApiProperty({ description: 'Request payload', required: false })
  @IsOptional()
  @IsString()
  requestPayload?: string;

  @ApiProperty({ description: 'Response payload', required: false })
  @IsOptional()
  @IsString()
  responsePayload?: string;

  @ApiProperty({ description: 'Status code', required: false })
  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @ApiProperty({ description: 'Error message', required: false })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiProperty({ description: 'Is success' })
  @IsBoolean()
  isSuccess!: boolean;

  @ApiProperty({ description: 'Retry count', required: false })
  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @ApiProperty({ description: 'Next retry at', required: false })
  @IsOptional()
  @IsDateString()
  nextRetryAt?: string;

  @ApiProperty({ description: 'Payload', required: false })
  @IsOptional()
  @IsString()
  payload?: string;

  @ApiProperty({
    description: 'Webhook type (outgoing/incoming)',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
