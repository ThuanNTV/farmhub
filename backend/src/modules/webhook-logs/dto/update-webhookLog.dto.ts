import { PartialType } from '@nestjs/swagger';
import { CreateWebhookLogDto } from 'src/modules/webhook-logs/dto/create-webhookLog.dto';

export class UpdateWebhookLogDto extends PartialType(CreateWebhookLogDto) {}
