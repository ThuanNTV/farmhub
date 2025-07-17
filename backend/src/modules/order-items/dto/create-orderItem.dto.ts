import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID của đơn hàng' })
  @IsUUID()
  orderId!: string; // maps to order_id

  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsUUID()
  productId!: string; // maps to product_id

  @ApiProperty({ description: 'Tên sản phẩm tại thời điểm đặt hàng' })
  @IsString()
  productName!: string; // maps to product_name

  @ApiProperty({ description: 'ID đơn vị tính sản phẩm', required: false })
  @IsOptional()
  @IsString()
  productUnitId?: string; // maps to product_unit_id

  @ApiProperty({ description: 'Số lượng sản phẩm đặt' })
  @IsInt()
  quantity!: number;

  @ApiProperty({ description: 'Đơn giá' })
  @IsNumber()
  unitPrice!: number; // maps to unit_price

  @ApiProperty({ description: 'Thành tiền' })
  @IsNumber()
  totalPrice!: number; // maps to total_price

  @ApiProperty({
    required: false,
    description: 'Ghi chú cho sản phẩm trong đơn hàng',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
