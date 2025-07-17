# Payments Module

## Chức năng

- Quản lý thanh toán trong hệ thống.
- Các chức năng chính:
  - Tạo giao dịch thanh toán mới.
  - Lấy danh sách giao dịch thanh toán.
  - Lấy chi tiết giao dịch thanh toán.
  - Cập nhật thông tin giao dịch thanh toán.
  - Xóa mềm giao dịch thanh toán.
  - Khôi phục giao dịch thanh toán đã xóa.

## Kiến trúc

- **Controller**: `PaymentsController`
- **Service**: `PaymentsService`
- **DTOs**:
  - `CreatePaymentDto`
  - `UpdatePaymentDto`
  - `PaymentResponseDto`
- **Entity**: `Payment`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /payments`
   - Tạo giao dịch thanh toán mới.
2. `GET /payments`
   - Lấy danh sách giao dịch thanh toán.
3. `GET /payments/:id`
   - Lấy chi tiết giao dịch thanh toán.
4. `PATCH /payments/:id`
   - Cập nhật thông tin giao dịch thanh toán.
5. `DELETE /payments/:id`
   - Xóa mềm giao dịch thanh toán.
6. `PATCH /payments/:id/restore`
   - Khôi phục giao dịch thanh toán đã xóa.

## Schema

- **Payment**:
  - `id`: UUID
  - `orderId`: UUID
  - `amount`: number
  - `status`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa giao dịch thanh toán.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `PaymentsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
