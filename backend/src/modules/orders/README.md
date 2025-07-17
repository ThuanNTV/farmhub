# Orders Module

## Chức năng

- Quản lý đơn hàng của hệ thống.
- Các chức năng chính:
  - Tạo đơn hàng mới.
  - Lấy danh sách đơn hàng.
  - Lấy chi tiết đơn hàng.
  - Cập nhật đơn hàng.
  - Xóa mềm đơn hàng.
  - Khôi phục đơn hàng đã xóa.

## Kiến trúc

- **Controller**: `OrdersController`
- **Service**: `OrdersService`
- **DTOs**:
  - `CreateOrderDto`
  - `UpdateOrderDto`
  - `OrderResponseDto`
- **Entity**: `Order`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /orders`
   - Tạo đơn hàng mới.
2. `GET /orders`
   - Lấy danh sách đơn hàng.
3. `GET /orders/:id`
   - Lấy chi tiết đơn hàng.
4. `PATCH /orders/:id`
   - Cập nhật đơn hàng.
5. `DELETE /orders/:id`
   - Xóa mềm đơn hàng.
6. `PATCH /orders/:id/restore`
   - Khôi phục đơn hàng đã xóa.

## Schema

- **Order**:
  - `id`: UUID
  - `customerId`: UUID
  - `totalAmount`: number
  - `status`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa đơn hàng.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `OrdersService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
