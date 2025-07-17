import { PartialType } from '@nestjs/swagger';
import { CreateStockTransferDto } from './create-stockTransfer.dto';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StockTransferStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateStockTransferDto extends PartialType(
  CreateStockTransferDto,
) {
  @ApiProperty({
    description: 'Trạng thái chuyển kho',
    enum: StockTransferStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(StockTransferStatus)
  status?: StockTransferStatus;

  @ApiProperty({ description: 'Ngày giao hàng thực tế', required: false })
  @IsOptional()
  actualDeliveryDate?: string;

  @ApiProperty({ description: 'ID người cập nhật', required: false })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;

  @ApiProperty({ description: 'ID người phê duyệt', required: false })
  @IsOptional()
  @IsUUID()
  approvedByUserId?: string;
}
