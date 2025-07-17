import { PartialType } from '@nestjs/swagger';
import { CreateUserActivityLogDto } from './create-userActivityLog.dto';

export class UpdateUserActivityLogDto extends PartialType(
  CreateUserActivityLogDto,
) {}
