import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryStatus, OrderStatus } from 'src/entities/tenant/order.entity';

export class OrderItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsUUID()
  product_id!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  @IsString()
  product_name!: string;

  @ApiProperty({ description: 'ID đơn vị sản phẩm', required: false })
  @IsOptional()
  @IsUUID()
  product_unit_id?: string;

  @ApiProperty({ description: 'Số lượng' })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ description: 'Đơn giá' })
  @IsNumber()
  unit_price!: number;
}

export class CreateOrderAtomicDto {
  @ApiProperty({ description: 'Mã đơn hàng hiển thị (ví dụ: DH0001)' })
  @IsString()
  orderCode!: string;

  @ApiProperty({ description: 'ID khách hàng', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Tổng giá trị đơn hàng' })
  @IsNumber()
  totalAmount!: number;

  @ApiProperty({ description: 'Chiết khấu', required: false })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ description: 'Phí vận chuyển', required: false })
  @IsOptional()
  @IsNumber()
  shippingFee?: number;

  @ApiProperty({ description: 'VAT (%)', required: false })
  @IsOptional()
  @IsNumber()
  vatPercent?: number;

  @ApiProperty({ description: 'Tiền VAT', required: false })
  @IsOptional()
  @IsNumber()
  vatAmount?: number;

  @ApiProperty({ description: 'Tổng đã thanh toán', required: false })
  @IsOptional()
  @IsNumber()
  totalPaid?: number;

  @ApiProperty({ description: 'ID phương thức thanh toán' })
  @IsString()
  paymentMethodId!: string;

  @ApiProperty({ description: 'Chi tiết thanh toán', required: false })
  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @ApiProperty({
    enum: OrderStatus,
    description: 'Trạng thái đơn hàng',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'Ngày giao hàng dự kiến', required: false })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @IsString()
  deliveryAddress!: string;

  @ApiProperty({
    enum: DeliveryStatus,
    description: 'Trạng thái giao hàng',
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  deliveryStatus?: DeliveryStatus;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Trạng thái thanh toán', required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Trạng thái xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong đơn hàng',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems!: OrderItemDto[];
}
