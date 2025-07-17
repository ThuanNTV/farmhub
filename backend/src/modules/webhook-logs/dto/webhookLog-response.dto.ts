import { Expose, Transform, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookLogResponseDto {
  @ApiProperty({ description: 'Webhook log ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Store ID' })
  @Expose({ name: 'storeId' })
  storeId!: string;

  @ApiProperty({ description: 'Event type' })
  @Expose({ name: 'eventType' })
  eventType!: string;

  @ApiProperty({ description: 'Request payload' })
  @Expose()
  @Exclude()
  requestPayload?: string;

  @ApiProperty({ description: 'Response payload' })
  @Expose()
  @Exclude()
  responsePayload?: string;

  @ApiProperty({ description: 'Status code' })
  @Expose({ name: 'statusCode' })
  statusCode?: number;

  @ApiProperty({ description: 'Error message' })
  @Expose()
  @Exclude()
  errorMessage?: string;

  @ApiProperty({ description: 'Is success' })
  @Expose({ name: 'isSuccess' })
  isSuccess!: boolean;

  @ApiProperty({ description: 'Retry count' })
  @Expose()
  retryCount?: number;

  @ApiProperty({ description: 'Next retry at' })
  @Expose()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }
    return undefined;
  })
  nextRetryAt?: Date;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  @Transform(({ value }) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }
    return undefined;
  })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }
    return undefined;
  })
  updatedAt?: Date;

  @ApiProperty({ description: 'Is deleted' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;
}
