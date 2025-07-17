import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsNumber } from 'class-validator';

export class CreateInventoryTransferItemDto {
  @ApiProperty({ description: 'ID của phiếu chuyển kho' })
  @IsUUID()
  transferId?: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Số lượng sản phẩm chuyển' })
  @IsInt()
  quantity?: number;

  @ApiProperty({ required: false, description: 'Đơn giá sản phẩm (nếu có)' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ required: false, description: 'ID người tạo' })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người cập nhật' })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
