import { PartialType } from '@nestjs/swagger';
import { CreateExternalSystemLogDto } from 'src/modules/external-system-logs/dto/create-externalSystemLog.dto';

export class UpdateExternalSystemLogDto extends PartialType(
  CreateExternalSystemLogDto,
) {}
