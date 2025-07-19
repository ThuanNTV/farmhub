import { PartialType } from '@nestjs/swagger';
import { CreateLoyaltyPointLogDto } from 'src/modules/loyalty-point-logs/dto/create-loyaltyPointLog.dto';

export class UpdateLoyaltyPointLogDto extends PartialType(
  CreateLoyaltyPointLogDto,
) {}
