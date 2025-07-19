import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PrintInvoiceRequestDto {
  @ApiProperty({
    description: 'ID đơn hàng cần in hóa đơn',
    example: 'order-123',
  })
  @IsNotEmpty()
  @IsString()
  orderId!: string;
}

export class PrintInvoiceResponseDto {
  @ApiProperty({
    description: 'Trạng thái in',
    example: 'success',
  })
  status!: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Hóa đơn đã được in thành công',
  })
  message!: string;

  @ApiProperty({
    description: 'ID hóa đơn',
    example: 'invoice-456',
  })
  invoiceId!: string;

  @ApiProperty({
    description: 'URL file PDF hóa đơn',
    example: 'https://example.com/invoices/invoice-456.pdf',
  })
  pdfUrl!: string;

  @ApiProperty({
    description: 'Dữ liệu in',
    example: {
      orderCode: 'ORD-001',
      customerName: 'Nguyễn Văn A',
      totalAmount: 500000,
      items: [],
    },
  })
  data!: any;
}
