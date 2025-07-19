import { PartialType } from '@nestjs/swagger';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';

export class UpdateAuditLogDto extends PartialType(CreateAuditLogDto) {}
