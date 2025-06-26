import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateOrderItemDto {
  @IsOptional()
  @IsUUID()
  orderItemId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  productName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  productUnit!: string;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  quantity!: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Đơn giá không hợp lệ' })
  @IsPositive({ message: 'Đơn giá phải lớn hơn 0' })
  unitPrice!: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Tổng giá không hợp lệ' })
  @Min(0, { message: 'Tổng giá không được âm' })
  totalPrice?: number;
}
