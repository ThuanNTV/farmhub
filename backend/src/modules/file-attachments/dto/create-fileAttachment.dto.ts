import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateFileAttachmentDto {
  @ApiProperty()
  @IsString()
  entityType!: string;

  @ApiProperty()
  @IsUUID()
  entityId!: string;

  @ApiProperty()
  @IsString()
  fileUrl!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  uploadedByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
