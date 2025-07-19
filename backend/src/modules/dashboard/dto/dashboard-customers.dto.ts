import { ApiProperty } from '@nestjs/swagger';

export class TopCustomerDto {
  @ApiProperty({
    description: 'ID khách hàng',
    example: 'customer-123',
  })
  customer_id: string;

  @ApiProperty({
    description: 'Tên khách hàng',
    example: 'Nguyễn Văn A',
  })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0901234567',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'customer@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Mã số thuế',
    example: '0123456789',
    required: false,
  })
  tax_code?: string;

  @ApiProperty({
    description: 'Loại khách hàng',
    example: 'individual',
  })
  customer_type: string;

  @ApiProperty({
    description: 'Giới tính',
    enum: ['male', 'female', 'other'],
    example: 'male',
    required: false,
  })
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'Ngày sinh',
    example: '1990-01-15',
    required: false,
  })
  birthday?: Date;

  @ApiProperty({
    description: 'Mã giới thiệu',
    example: 'REF123',
    required: false,
  })
  ref_code?: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Khách hàng VIP',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'Hạn mức tín dụng',
    example: 10000000,
    required: false,
  })
  credit_limit?: number;

  @ApiProperty({
    description: 'Tổng nợ hiện tại',
    example: 2500000,
    required: false,
  })
  total_debt?: number;

  @ApiProperty({
    description: 'Ngày đến hạn nợ',
    example: '2024-02-15',
    required: false,
  })
  debt_due_date?: Date;

  @ApiProperty({
    description: 'Ngày mua hàng cuối cùng',
    example: '2024-01-20',
    required: false,
  })
  last_purchase_date?: Date;

  @ApiProperty({
    description: 'Trạng thái',
    example: 'active',
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Có hoạt động không',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Đã bị xóa chưa',
    example: false,
  })
  is_deleted: boolean;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2023-12-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-20T00:00:00Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'ID người tạo',
    example: 'user-456',
    required: false,
  })
  created_by_user_id?: string;

  @ApiProperty({
    description: 'ID người cập nhật',
    example: 'user-789',
    required: false,
  })
  updated_by_user_id?: string;

  @ApiProperty({
    description: 'Tổng số tiền đã chi tiêu',
    example: 15000000,
  })
  totalSpent: number;
}

export class DashboardCustomersResponseDto {
  @ApiProperty({
    description: 'Tổng số khách hàng',
    example: 89,
  })
  total: number;

  @ApiProperty({
    description: 'Số khách hàng mới',
    example: 12,
  })
  newCustomers: number;

  @ApiProperty({
    description: 'Top khách hàng chi tiêu nhiều nhất',
    type: [TopCustomerDto],
  })
  topCustomers: TopCustomerDto[];
}
