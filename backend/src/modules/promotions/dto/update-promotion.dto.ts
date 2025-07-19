import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from 'src/modules/promotions/dto/create-promotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
