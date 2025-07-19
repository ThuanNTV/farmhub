import { PartialType } from '@nestjs/swagger';
import { CreateUserActivityLogDto } from 'src/modules/user-activity-log/dto/create-userActivityLog.dto';

export class UpdateUserActivityLogDto extends PartialType(
  CreateUserActivityLogDto,
) {}
