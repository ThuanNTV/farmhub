import { PartialType } from '@nestjs/swagger';
import { CreateVoucherUsageLogDto } from './create-voucherUsageLog.dto';

export class UpdateVoucherUsageLogDto extends PartialType(
  CreateVoucherUsageLogDto,
) {}
