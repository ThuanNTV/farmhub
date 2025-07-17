import { PartialType } from '@nestjs/swagger';
import { CreateScheduledTaskDto } from './create-scheduledTask.dto';

export class UpdateScheduledTaskDto extends PartialType(
  CreateScheduledTaskDto,
) {}
