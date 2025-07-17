import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class FileAttachmentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the file attachment' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Type of entity this file is attached to' })
  @Expose()
  entityType!: string;

  @ApiProperty({ description: 'ID of the entity this file is attached to' })
  @Expose()
  entityId!: string;

  @ApiProperty({ description: 'URL to access the file' })
  @Expose()
  fileUrl!: string;

  @ApiProperty({
    required: false,
    description: 'User ID who uploaded the file',
  })
  @Exclude() // Sensitive field - exclude from response
  uploadedByUserId?: string;

  @ApiProperty({
    required: false,
    description: 'Additional notes about the file',
  })
  @Expose()
  note?: string;

  @ApiProperty({ description: 'Whether the file is marked as deleted' })
  @Expose()
  isDeleted!: boolean;

  @ApiProperty({ description: 'When the file was created' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ description: 'When the file was last updated' })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({
    required: false,
    description: 'User ID who created the record',
  })
  @Exclude() // Sensitive field - exclude from response
  createdByUserId?: string;

  @ApiProperty({
    required: false,
    description: 'User ID who last updated the record',
  })
  @Exclude() // Sensitive field - exclude from response
  updatedByUserId?: string;
}
