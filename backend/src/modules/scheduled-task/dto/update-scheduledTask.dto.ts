import { PartialType } from '@nestjs/swagger';
import { CreateScheduledTaskDto } from 'src/modules/scheduled-task/dto/create-scheduledTask.dto';

export class UpdateScheduledTaskDto extends PartialType(
  CreateScheduledTaskDto,
) {}
