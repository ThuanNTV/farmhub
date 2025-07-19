import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecreateOrderRequestDto {
  @ApiProperty({
    description: 'ID đơn hàng gốc cần tạo lại',
    example: 'order-123',
  })
  @IsNotEmpty()
  @IsString()
  orderId!: string;
}

export class RecreateOrderResponseDto {
  @ApiProperty({
    description: 'Trạng thái tạo lại đơn hàng',
    example: 'success',
  })
  status!: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Đơn hàng đã được tạo lại thành công',
  })
  message!: string;

  @ApiProperty({
    description: 'ID đơn hàng gốc',
    example: 'order-123',
  })
  originalOrderId!: string;

  @ApiProperty({
    description: 'ID đơn hàng mới được tạo',
    example: 'order-456',
  })
  newOrderId!: string;

  @ApiProperty({
    description: 'Mã đơn hàng mới',
    example: 'ORD-2024-001',
  })
  newOrderCode!: string;

  @ApiProperty({
    description: 'Dữ liệu đơn hàng mới',
    example: {
      orderId: 'order-456',
      orderCode: 'ORD-2024-001',
      customerId: 'customer-123',
      totalAmount: 500000,
      status: 'pending',
      items: [],
    },
  })
  orderData!: any;
}
