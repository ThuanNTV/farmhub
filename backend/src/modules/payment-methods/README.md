# Payment Methods Module

## Chức năng

- Quản lý phương thức thanh toán.
- Các chức năng chính:
  - Tạo phương thức thanh toán mới.
  - Lấy danh sách phương thức thanh toán.
  - Lấy chi tiết phương thức thanh toán.
  - Cập nhật phương thức thanh toán.
  - Xóa mềm phương thức thanh toán.
  - Khôi phục phương thức thanh toán đã xóa.

## Kiến trúc

- **Controller**: `PaymentMethodsController`
- **Service**: `PaymentMethodsService`
- **DTOs**:
  - `CreatePaymentMethodDto`
  - `UpdatePaymentMethodDto`
  - `PaymentMethodResponseDto`
- **Entity**: `PaymentMethod`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /payment-methods`
   - Tạo phương thức thanh toán mới.
2. `GET /payment-methods`
   - Lấy danh sách phương thức thanh toán.
3. `GET /payment-methods/:id`
   - Lấy chi tiết phương thức thanh toán.
4. `PATCH /payment-methods/:id`
   - Cập nhật phương thức thanh toán.
5. `DELETE /payment-methods/:id`
   - Xóa mềm phương thức thanh toán.
6. `PATCH /payment-methods/:id/restore`
   - Khôi phục phương thức thanh toán đã xóa.

## Schema

- **PaymentMethod**:
  - `id`: UUID
  - `name`: string
  - `description`: string
  - `isActive`: boolean
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa phương thức thanh toán.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `PaymentMethodsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
