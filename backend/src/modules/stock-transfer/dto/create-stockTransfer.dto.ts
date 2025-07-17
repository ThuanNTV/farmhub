import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockTransferItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Số lượng chuyển' })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ description: 'Đơn giá', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Mã chuyển kho' })
  @IsString()
  transferCode!: string;

  @ApiProperty({ description: 'ID kho nguồn' })
  @IsUUID()
  fromStoreId!: string;

  @ApiProperty({ description: 'ID kho đích' })
  @IsUUID()
  toStoreId!: string;

  @ApiProperty({ description: 'Ngày chuyển kho' })
  @IsDateString()
  transferDate!: string;

  @ApiProperty({ description: 'Ngày giao hàng dự kiến', required: false })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Danh sách sản phẩm' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockTransferItemDto)
  items!: CreateStockTransferItemDto[];

  @ApiProperty({ description: 'ID người tạo', required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}
