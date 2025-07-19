import { PartialType } from '@nestjs/swagger';
import { CreateVoucherDto } from 'src/modules/vouchers/dto/create-voucher.dto';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}
