# Order Items Module

## Chức năng

- Quản lý các mục trong đơn hàng.
- Các chức năng chính:
  - Tạo mục đơn hàng mới.
  - Lấy danh sách mục đơn hàng.
  - Lấy danh sách mục đơn hàng theo đơn hàng.
  - Lấy chi tiết mục đơn hàng.
  - Cập nhật mục đơn hàng.
  - Xóa mềm mục đơn hàng.
  - Khôi phục mục đơn hàng đã xóa.

## Kiến trúc

- **Controller**: `OrderItemsController`
- **Service**: `OrderItemsService`
- **DTOs**:
  - `CreateOrderItemDto`
  - `UpdateOrderItemDto`
  - `OrderItemResponseDto`
- **Entity**: `OrderItem`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/order-items`
   - Tạo mục đơn hàng mới.
2. `GET /tenant/:storeId/order-items`
   - Lấy danh sách mục đơn hàng.
3. `GET /tenant/:storeId/order-items/order/:orderId`
   - Lấy danh sách mục đơn hàng theo đơn hàng.
4. `GET /tenant/:storeId/order-items/:id`
   - Lấy chi tiết mục đơn hàng.
5. `PATCH /tenant/:storeId/order-items/:id`
   - Cập nhật mục đơn hàng.
6. `DELETE /tenant/:storeId/order-items/:id`
   - Xóa mềm mục đơn hàng.
7. `PATCH /tenant/:storeId/order-items/:id/restore`
   - Khôi phục mục đơn hàng đã xóa.

## Schema

- **OrderItem**:
  - `id`: UUID
  - `storeId`: UUID
  - `orderId`: UUID
  - `productId`: UUID
  - `quantity`: number
  - `price`: number
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa mục đơn hàng.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `OrderItemsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
