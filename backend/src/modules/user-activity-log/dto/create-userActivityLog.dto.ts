import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateUserActivityLogDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Activity type' })
  @IsString()
  activityType?: string;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'IP address', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Additional data as JSON string',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalData?: string;

  @ApiProperty({ description: 'Activity timestamp', required: false })
  @IsOptional()
  @IsString()
  activityAt?: string;
}
