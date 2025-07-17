# Stores Module

## Chức năng

- Quản lý thông tin cửa hàng.
- Các chức năng chính:
  - Tạo cửa hàng mới.
  - Lấy danh sách cửa hàng.
  - Lấy chi tiết cửa hàng.
  - Cập nhật thông tin cửa hàng.
  - Xóa mềm cửa hàng.
  - Khôi phục cửa hàng đã xóa.

## Kiến trúc

- **Controller**: `StoresController`
- **Service**: `StoresService`
- **DTOs**:
  - `CreateStoreDto`
  - `UpdateStoreDto`
  - `StoreResponseDto`
- **Entity**: `Store`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/stores`
   - Tạo cửa hàng mới.
2. `GET /tenant/:storeId/stores`
   - Lấy danh sách cửa hàng.
3. `GET /tenant/:storeId/stores/:id`
   - Lấy chi tiết cửa hàng.
4. `PATCH /tenant/:storeId/stores/:id`
   - Cập nhật thông tin cửa hàng.
5. `DELETE /tenant/:storeId/stores/:id`
   - Xóa mềm cửa hàng.
6. `PATCH /tenant/:storeId/stores/:id/restore`
   - Khôi phục cửa hàng đã xóa.

## Schema

- **Store**:
  - `id`: UUID
  - `storeId`: UUID
  - `name`: string
  - `address`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa cửa hàng.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `StoresService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
