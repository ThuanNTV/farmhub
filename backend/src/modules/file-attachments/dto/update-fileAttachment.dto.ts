import { PartialType } from '@nestjs/swagger';
import { CreateFileAttachmentDto } from 'src/modules/file-attachments/dto/create-fileAttachment.dto';

export class UpdateFileAttachmentDto extends PartialType(
  CreateFileAttachmentDto,
) {}
