import { PartialType } from '@nestjs/swagger';
import { CreatePriceHistoryDto } from './create-priceHistory.dto';

export class UpdatePriceHistoryDto extends PartialType(CreatePriceHistoryDto) {}
