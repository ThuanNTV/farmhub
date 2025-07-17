# Products Module

## Chức năng

- Quản lý sản phẩm trong hệ thống.
- Các chức năng chính:
  - Tạo sản phẩm mới.
  - Lấy danh sách sản phẩm.
  - Lấy chi tiết sản phẩm.
  - Cập nhật thông tin sản phẩm.
  - Xóa mềm sản phẩm.
  - Khôi phục sản phẩm đã xóa.

## Kiến trúc

- **Controller**: `ProductsController`
- **Service**: `ProductsService`
- **DTOs**:
  - `CreateProductDto`
  - `UpdateProductDto`
  - `ProductResponseDto`
- **Entity**: `Product`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /products`
   - Tạo sản phẩm mới.
2. `GET /products`
   - Lấy danh sách sản phẩm.
3. `GET /products/:id`
   - Lấy chi tiết sản phẩm.
4. `PATCH /products/:id`
   - Cập nhật thông tin sản phẩm.
5. `DELETE /products/:id`
   - Xóa mềm sản phẩm.
6. `PATCH /products/:id/restore`
   - Khôi phục sản phẩm đã xóa.

## Schema

- **Product**:
  - `id`: UUID
  - `name`: string
  - `price`: number
  - `stock`: number
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa sản phẩm.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `ProductsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
