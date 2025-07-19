import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateBankDto } from 'src/modules/bank/dto/create-bank.dto';

export class UpdateBankDto extends PartialType(CreateBankDto) {
  @ApiProperty({ description: 'Tên ngân hàng', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'ID ngân hàng', required: false })
  @IsString()
  @IsOptional()
  id?: string;
}
