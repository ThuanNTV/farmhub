import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { InventoryTransferStatus } from './create-inventoryTransfer.dto';

export class InventoryTransferResponseDto {
  @ApiProperty({ description: 'ID của phiếu chuyển kho' })
  id!: string;

  @ApiProperty({ description: 'ID cửa hàng chuyển' })
  sourceStoreId!: string;

  @ApiProperty({ description: 'ID cửa hàng nhận' })
  targetStoreId!: string;

  @ApiProperty({ description: 'Mã chuyển kho' })
  transferCode!: string;

  @ApiProperty({ required: false, description: 'Ghi chú nếu có' })
  note?: string;

  @ApiProperty({
    enum: InventoryTransferStatus,
    description: 'Trạng thái phiếu chuyển kho',
  })
  status!: InventoryTransferStatus;

  @ApiProperty({ required: false, description: 'ID người tạo' })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người duyệt' })
  @Exclude()
  approvedByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người nhận hàng' })
  @Exclude()
  receivedByUserId?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật gần nhất' })
  updatedAt!: Date;
}
