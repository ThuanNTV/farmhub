import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class StockTransferItemResponseDto {
  @ApiProperty({ description: 'ID item' })
  id!: string;

  @ApiProperty({ description: 'ID sản phẩm' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  productName!: string;

  @ApiProperty({ description: 'Số lượng chuyển' })
  quantity!: number;

  @ApiProperty({ description: 'Số lượng đã chuyển' })
  transferredQuantity!: number;

  @ApiProperty({ description: 'Đơn giá', required: false })
  unitPrice?: number;

  @ApiProperty({ description: 'Tổng giá', required: false })
  totalPrice?: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  notes?: string;
}

export class StockTransferResponseDto {
  @ApiProperty({ description: 'ID chuyển kho' })
  id!: string;

  @ApiProperty({ description: 'ID cửa hàng' })
  storeId!: string;

  @ApiProperty({ description: 'Mã chuyển kho' })
  transferCode!: string;

  @ApiProperty({ description: 'ID kho nguồn' })
  fromStoreId!: string;

  @ApiProperty({ description: 'Tên kho nguồn' })
  fromStoreName!: string;

  @ApiProperty({ description: 'ID kho đích' })
  toStoreId!: string;

  @ApiProperty({ description: 'Tên kho đích' })
  toStoreName!: string;

  @ApiProperty({ description: 'Trạng thái' })
  status!: string;

  @ApiProperty({ description: 'Ngày chuyển kho' })
  transferDate!: Date;

  @ApiProperty({ description: 'Ngày giao hàng dự kiến', required: false })
  expectedDeliveryDate?: Date;

  @ApiProperty({ description: 'Ngày giao hàng thực tế', required: false })
  actualDeliveryDate?: Date;

  @ApiProperty({ description: 'Ghi chú', required: false })
  notes?: string;

  @ApiProperty({ description: 'Tổng số sản phẩm' })
  totalItems!: number;

  @ApiProperty({ description: 'Tổng số lượng' })
  totalQuantity!: number;

  @ApiProperty({ description: 'ID người tạo', required: false })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ description: 'ID người cập nhật', required: false })
  @Exclude()
  updatedByUserId?: string;

  @ApiProperty({ description: 'ID người phê duyệt', required: false })
  @Exclude()
  approvedByUserId?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Danh sách sản phẩm',
    type: [StockTransferItemResponseDto],
  })
  items!: StockTransferItemResponseDto[];
}
