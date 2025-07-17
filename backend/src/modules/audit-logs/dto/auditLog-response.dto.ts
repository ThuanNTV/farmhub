import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuditLogResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  @Expose()
  user_id!: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  action!: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  target_table!: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  @Expose()
  target_id!: string;

  @ApiProperty({ type: 'array', items: { type: 'string' }, required: false })
  @Expose()
  metadata?: any;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  created_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  updated_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  @Expose()
  deleted_at?: Date;

  @ApiProperty({ type: 'boolean' })
  @Expose()
  is_deleted!: boolean;
}
