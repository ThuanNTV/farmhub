import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExternalSystemLogResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  storeId!: string;

  @ApiProperty()
  @Expose()
  systemName!: string;

  @ApiProperty({ required: false, type: Object })
  @Expose()
  requestPayload?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @Expose()
  responsePayload?: Record<string, any>;

  @ApiProperty({ required: false })
  @Expose()
  httpMethod?: string;

  @ApiProperty()
  @Expose()
  endpoint!: string;

  @ApiProperty({ required: false })
  @Expose()
  statusCode?: number;

  @ApiProperty()
  @Expose()
  isSuccess!: boolean;

  @ApiProperty({ required: false })
  @Expose()
  errorMessage?: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}
