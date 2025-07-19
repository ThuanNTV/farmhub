import { PartialType } from '@nestjs/swagger';
import { CreatePriceHistoryDto } from 'src/modules/price-histories/dto/create-priceHistory.dto';

export class UpdatePriceHistoryDto extends PartialType(CreatePriceHistoryDto) {}
