import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateOrderItemDto } from 'src/dto/dtoOrderItem/update-orderItem.dto';

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  PartiallyPaid = 'partially_paid',
  Cancelled = 'cancelled',
  Returned = 'returned',
}

export enum DeliveryStatus {
  Processing = 'processing',
  Shipping = 'shipping',
  Delivered = 'delivered',
  Canceled = 'canceled',
}

export enum PaymentType {
  Cash = 'cash',
  Installment = 'installment',
  BankTransfer = 'bank_transfer',
  Card = 'card',
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
  orderCode!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Khách hàng là bắt buộc' })
  customerId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Tổng tiền phải lớn hơn 0' })
  totalAmount!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discountAmount?: number = 0;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  shippingFee?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalPaid!: number;

  @IsEnum(PaymentType, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentType!: PaymentType;

  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus = OrderStatus.Pending;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  deliveryAddress!: string;

  @IsEnum(DeliveryStatus)
  deliveryStatus: DeliveryStatus = DeliveryStatus.Processing;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  processedByUserId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems?: UpdateOrderItemDto[];
}
