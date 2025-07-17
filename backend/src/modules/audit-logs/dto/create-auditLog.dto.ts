import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { AuditMetadata } from 'src/common/types/common.types';

export class CreateAuditLogDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsString()
  action!: string;

  @ApiProperty()
  @IsString()
  targetTable!: string;

  @ApiProperty()
  @IsUUID()
  targetId!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  metadata?: AuditMetadata;
}
