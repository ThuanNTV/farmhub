import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { DeliveryStatus, OrderStatus } from 'src/entities/tenant/order.entity';

export class OrderResponseDto {
  @ApiProperty({ description: 'ID đơn hàng (UUID)' })
  @Expose({ name: 'orderId' })
  orderId!: string;

  @ApiProperty({ description: 'Mã đơn hàng (ví dụ: DH-0001)' })
  @Expose({ name: 'orderCode' })
  orderCode!: string;

  @ApiProperty({ description: 'ID khách hàng', required: false })
  @Expose({ name: 'customerId' })
  customerId?: string;

  @ApiProperty({ description: 'Tổng giá trị đơn hàng' })
  @Expose({ name: 'totalAmount' })
  totalAmount!: number;

  @ApiProperty({ description: 'Chiết khấu', required: false })
  @Expose({ name: 'discountAmount' })
  discountAmount?: number;

  @ApiProperty({ description: 'Phí vận chuyển', required: false })
  @Expose({ name: 'shippingFee' })
  shippingFee?: number;

  @ApiProperty({ description: 'VAT (%)', required: false })
  @Expose({ name: 'vatPercent' })
  vatPercent?: number;

  @ApiProperty({ description: 'Tiền VAT', required: false })
  @Expose({ name: 'vatAmount' })
  vatAmount?: number;

  @ApiProperty({ description: 'Tổng đã thanh toán', required: false })
  @Expose({ name: 'totalPaid' })
  totalPaid?: number;

  @ApiProperty({ description: 'ID phương thức thanh toán', required: false })
  @Expose({ name: 'paymentMethodId' })
  paymentMethodId?: string;

  @ApiProperty({ description: 'Chi tiết thanh toán', required: false })
  @Expose({ name: 'paymentDetails' })
  paymentDetails?: string;

  @ApiProperty({ enum: OrderStatus, description: 'Trạng thái đơn hàng' })
  @Expose({ name: 'status' })
  status!: OrderStatus;

  @ApiProperty({ enum: DeliveryStatus, description: 'Trạng thái giao hàng' })
  @Expose({ name: 'deliveryStatus' })
  deliveryStatus!: DeliveryStatus;

  @ApiProperty({
    description: 'Ngày giao hàng dự kiến',
    required: false,
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'expectedDeliveryDate' })
  expectedDeliveryDate?: Date;

  @ApiProperty({ description: 'Địa chỉ giao hàng' })
  @Expose({ name: 'deliveryAddress' })
  deliveryAddress!: string;

  @ApiProperty({ description: 'Số hóa đơn', required: false })
  @Expose({ name: 'invoiceNumber' })
  invoiceNumber?: string;

  @ApiProperty({ description: 'Ghi chú đơn hàng', required: false })
  @Expose({ name: 'note' })
  note?: string;

  @ApiProperty({ description: 'ID người xử lý đơn', required: false })
  @Exclude()
  processedByUserId?: string;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({
    description: 'Thời gian tạo đơn hàng',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;
}
