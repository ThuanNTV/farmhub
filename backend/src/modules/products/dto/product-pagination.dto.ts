import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Số lượng items mỗi trang', example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Tổng số items', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Tổng số trang', example: 10 })
  totalPages!: number;

  @ApiProperty({ description: 'Có trang tiếp theo không', example: true })
  hasNext!: boolean;

  @ApiProperty({ description: 'Có trang trước không', example: false })
  hasPrev!: boolean;
}

export class ProductPaginationDto {
  @ApiProperty({ 
    description: 'Danh sách sản phẩm', 
    type: [ProductResponseDto] 
  })
  data!: ProductResponseDto[];

  @ApiProperty({ 
    description: 'Thông tin phân trang', 
    type: PaginationMetaDto 
  })
  pagination!: PaginationMetaDto;

  @ApiProperty({ 
    description: 'Thông tin bổ sung', 
    required: false 
  })
  meta?: {
    totalValue?: number; // Tổng giá trị sản phẩm
    averagePrice?: number; // Giá trung bình
    lowStockCount?: number; // Số sản phẩm sắp hết
    categories?: string[]; // Danh sách categories có trong kết quả
  };
}

export class ProductStatsDto {
  @ApiProperty({ description: 'Tổng số sản phẩm', example: 150 })
  totalProducts!: number;

  @ApiProperty({ description: 'Số sản phẩm đang hoạt động', example: 140 })
  activeProducts!: number;

  @ApiProperty({ description: 'Số sản phẩm sắp hết hàng', example: 5 })
  lowStockProducts!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 50000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Giá trung bình', example: 125000 })
  averagePrice!: number;

  @ApiProperty({ description: 'Số danh mục', example: 12 })
  totalCategories!: number;

  @ApiProperty({ description: 'Số thương hiệu', example: 8 })
  totalBrands!: number;
}
