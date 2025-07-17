import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class InventoryTransferItemResponseDto {
  @ApiProperty({ description: 'ID của bản ghi chi tiết chuyển kho' })
  id?: string;

  @ApiProperty({ description: 'ID của phiếu chuyển kho liên kết' })
  transferId?: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  productId?: string;

  @ApiProperty({ description: 'Số lượng sản phẩm chuyển' })
  quantity?: number;

  @ApiProperty({ required: false, description: 'Đơn giá sản phẩm (nếu có)' })
  unitPrice?: number;

  @ApiProperty({ required: false, description: 'ID người tạo bản ghi' })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người cập nhật gần nhất' })
  updatedByUserId?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt?: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt?: Date;
}
