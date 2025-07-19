import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class PrintQuotationRequestDto {
  @ApiProperty({
    description: 'Dữ liệu báo giá',
    example: {
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      items: [
        {
          productName: 'Gạo ST25',
          quantity: 10,
          unitPrice: 25000,
          totalPrice: 250000
        }
      ],
      totalAmount: 250000,
      validUntil: '2024-02-15'
    },
  })
  @IsNotEmpty()
  @IsObject()
  quotationData: any;
}

export class PrintQuotationResponseDto {
  @ApiProperty({
    description: 'Trạng thái in',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Báo giá đã được in thành công',
  })
  message: string;

  @ApiProperty({
    description: 'ID báo giá',
    example: 'quotation-456',
  })
  quotationId: string;

  @ApiProperty({
    description: 'URL file PDF báo giá',
    example: 'https://example.com/quotations/quotation-456.pdf',
  })
  pdfUrl: string;

  @ApiProperty({
    description: 'Dữ liệu in',
    example: {
      quotationCode: 'QUO-001',
      customerName: 'Nguyễn Văn A',
      totalAmount: 250000,
      items: []
    },
  })
  data: any;
}
