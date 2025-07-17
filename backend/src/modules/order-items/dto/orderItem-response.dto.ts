import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'ID của sản phẩm trong đơn hàng' })
  @Expose({ name: 'orderItemId' })
  orderItemId!: string;

  @ApiProperty({ description: 'ID đơn hàng' })
  @Expose({ name: 'orderId' })
  orderId!: string;

  @ApiProperty({ description: 'ID sản phẩm' })
  @Expose({ name: 'productId' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  @Expose({ name: 'productName' })
  productName!: string;

  @ApiProperty({ description: 'ID đơn vị tính sản phẩm', required: false })
  @Expose({ name: 'productUnitId' })
  productUnitId?: string;

  @ApiProperty({ description: 'Số lượng sản phẩm' })
  @Expose({ name: 'quantity' })
  quantity!: number;

  @ApiProperty({ description: 'Đơn giá' })
  @Expose({ name: 'unitPrice' })
  unitPrice!: number;

  @ApiProperty({ description: 'Thành tiền' })
  @Expose({ name: 'totalPrice' })
  totalPrice!: number;

  @ApiProperty({ required: false, description: 'Ghi chú (nếu có)' })
  @Expose({ name: 'note' })
  note?: string;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({ description: 'Thời điểm tạo' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời điểm cập nhật gần nhất' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Người tạo', required: false })
  @Expose({ name: 'createdByUserId' })
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @Expose({ name: 'updatedByUserId' })
  updatedByUserId?: string;
}
