import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserActivityLogResponseDto {
  @ApiProperty({ description: 'Log ID' })
  id?: string;

  @ApiProperty({ description: 'User ID' })
  userId?: string;

  @ApiProperty({ description: 'Activity type' })
  activityType?: string;

  @ApiProperty({ description: 'Activity description' })
  description?: string;

  @ApiProperty({
    description: 'Additional data as JSON string',
    required: false,
  })
  additionalData?: string;

  @ApiProperty({ description: 'IP address', required: false })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  userAgent?: string;

  @ApiProperty({ description: 'Activity timestamp' })
  activityAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt?: Date;

  @Exclude()
  createdByUserId?: string;

  @Exclude()
  updatedByUserId?: string;

  @Exclude()
  isDeleted?: boolean;
}
