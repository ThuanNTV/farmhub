import { PartialType } from '@nestjs/swagger';
import { CreateLoyaltyPointLogDto } from './create-loyaltyPointLog.dto';

export class UpdateLoyaltyPointLogDto extends PartialType(
  CreateLoyaltyPointLogDto,
) {}
