import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { DeliveryStatus, OrderStatus } from 'src/entities/tenant/order.entity';

export class CreateOrderDto {
  @ApiProperty({ description: 'Mã đơn hàng hiển thị (ví dụ: DH0001)' })
  @IsString()
  orderCode!: string; // maps to order_code

  @ApiProperty({ description: 'ID khách hàng', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string; // maps to customer_id

  @ApiProperty({ description: 'Tổng giá trị đơn hàng' })
  @IsNumber()
  totalAmount!: number; // maps to total_amount

  @ApiProperty({ description: 'Chiết khấu', required: false })
  @IsOptional()
  @IsNumber()
  discountAmount?: number; // maps to discount_amount

  @ApiProperty({ description: 'Phí vận chuyển', required: false })
  @IsOptional()
  @IsNumber()
  shippingFee?: number; // maps to shipping_fee

  @ApiProperty({ description: 'VAT (%)', required: false })
  @IsOptional()
  @IsNumber()
  vatPercent?: number; // maps to vat_percent

  @ApiProperty({ description: 'Tiền VAT', required: false })
  @IsOptional()
  @IsNumber()
  vatAmount?: number; // maps to vat_amount

  @ApiProperty({ description: 'Tổng đã thanh toán', required: false })
  @IsOptional()
  @IsNumber()
  totalPaid?: number; // maps to total_paid

  @ApiProperty({ description: 'ID phương thức thanh toán', required: false })
  @IsOptional()
  @IsString()
  paymentMethodId?: string; // maps to payment_method_id

  @ApiProperty({ description: 'Chi tiết thanh toán', required: false })
  @IsOptional()
  @IsString()
  paymentDetails?: string; // maps to payment_details

  @ApiProperty({
    enum: OrderStatus,
    description: 'Trạng thái đơn hàng',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    enum: DeliveryStatus,
    description: 'Trạng thái giao hàng',
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  deliveryStatus?: DeliveryStatus;

  @ApiProperty({
    description: 'Ngày giao hàng dự kiến',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string; // maps to expected_delivery_date

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @IsString()
  deliveryAddress!: string; // maps to delivery_address

  @ApiProperty({ description: 'Số hóa đơn', required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string; // maps to invoice_number

  @ApiProperty({ description: 'Ghi chú đơn hàng', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'ID người xử lý đơn', required: false })
  @IsOptional()
  @IsUUID()
  processedByUserId?: string; // maps to processed_by_user_id

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'ID người tạo', required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}
