import { PartialType } from '@nestjs/swagger';
import { CreateWebhookLogDto } from './create-webhookLog.dto';

export class UpdateWebhookLogDto extends PartialType(CreateWebhookLogDto) {}
