import { PartialType } from '@nestjs/swagger';
import { CreateFileAttachmentDto } from './create-fileAttachment.dto';

export class UpdateFileAttachmentDto extends PartialType(
  CreateFileAttachmentDto,
) {}
