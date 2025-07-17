import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';

export enum InventoryTransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateInventoryTransferDto {
  @ApiProperty({ description: 'ID của cửa hàng chuyển hàng (source)' })
  @IsUUID()
  sourceStoreId!: string;

  @ApiProperty({ description: 'ID của cửa hàng nhận hàng (target)' })
  @IsUUID()
  targetStoreId!: string;

  @ApiProperty({ description: 'Mã phiếu chuyển kho (transfer code)' })
  @IsString()
  transferCode!: string;

  @ApiProperty({ required: false, description: 'Ghi chú nếu có' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    enum: InventoryTransferStatus,
    default: InventoryTransferStatus.PENDING,
    description: 'Trạng thái chuyển kho',
  })
  @IsEnum(InventoryTransferStatus)
  status: InventoryTransferStatus = InventoryTransferStatus.PENDING;

  @ApiProperty({ required: false, description: 'ID người tạo' })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người duyệt' })
  @IsOptional()
  @IsUUID()
  approvedByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người nhận hàng' })
  @IsOptional()
  @IsUUID()
  receivedByUserId?: string;
}
