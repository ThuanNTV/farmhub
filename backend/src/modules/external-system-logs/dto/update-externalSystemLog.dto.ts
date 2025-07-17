import { PartialType } from '@nestjs/swagger';
import { CreateExternalSystemLogDto } from './create-externalSystemLog.dto';

export class UpdateExternalSystemLogDto extends PartialType(
  CreateExternalSystemLogDto,
) {}
