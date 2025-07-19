import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PrintBarcodeRequestDto {
  @ApiProperty({
    description: 'ID sản phẩm cần in mã vạch',
    example: 'product-123',
  })
  @IsNotEmpty()
  @IsString()
  productId!: string;
}

export class PrintBarcodeResponseDto {
  @ApiProperty({
    description: 'Trạng thái in',
    example: 'success',
  })
  status!: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Mã vạch đã được in thành công',
  })
  message!: string;

  @ApiProperty({
    description: 'Mã vạch',
    example: '1234567890123',
  })
  barcode!: string;

  @ApiProperty({
    description: 'URL file PDF mã vạch',
    example: 'https://example.com/barcodes/barcode-123.pdf',
  })
  pdfUrl!: string;

  @ApiProperty({
    description: 'Dữ liệu in',
    example: {
      productCode: 'PROD-001',
      productName: 'Gạo ST25',
      barcode: '1234567890123',
      price: 25000,
    },
  })
  data!: any;
}
