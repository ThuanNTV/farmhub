import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PrintReceiptRequestDto {
  @ApiProperty({
    description: 'ID thanh toán cần in biên lai',
    example: 'payment-123',
  })
  @IsNotEmpty()
  @IsString()
  paymentId: string;
}

export class PrintReceiptResponseDto {
  @ApiProperty({
    description: 'Trạng thái in',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Biên lai đã được in thành công',
  })
  message: string;

  @ApiProperty({
    description: 'ID biên lai',
    example: 'receipt-456',
  })
  receiptId: string;

  @ApiProperty({
    description: 'URL file PDF biên lai',
    example: 'https://example.com/receipts/receipt-456.pdf',
  })
  pdfUrl: string;

  @ApiProperty({
    description: 'Dữ liệu in',
    example: {
      paymentCode: 'PAY-001',
      customerName: 'Nguyễn Văn A',
      amount: 500000,
      paymentMethod: 'cash'
    },
  })
  data: any;
}
