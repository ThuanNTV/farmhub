import { PartialType } from '@nestjs/swagger';
import { CreateAuditLogDto } from './create-auditLog.dto';

export class UpdateAuditLogDto extends PartialType(CreateAuditLogDto) {}
