import { PartialType } from '@nestjs/swagger';
import { CreateVoucherUsageLogDto } from 'src/modules/voucher-usage-log/dto/create-voucherUsageLog.dto';

export class UpdateVoucherUsageLogDto extends PartialType(
  CreateVoucherUsageLogDto,
) {}
