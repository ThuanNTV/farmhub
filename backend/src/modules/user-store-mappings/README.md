# User Store Mappings Module

## Chức năng

- Quản lý mối quan hệ giữa người dùng và cửa hàng.
- Các chức năng chính:
  - Tạo mối quan hệ mới.
  - Lấy danh sách mối quan hệ.
  - Lấy chi tiết mối quan hệ.
  - Cập nhật mối quan hệ.
  - Xóa mềm mối quan hệ.
  - Khôi phục mối quan hệ đã xóa.

## Kiến trúc

- **Controller**: `UserStoreMappingsController`
- **Service**: `UserStoreMappingsService`
- **DTOs**:
  - `CreateUserStoreMappingDto`
  - `UpdateUserStoreMappingDto`
  - `UserStoreMappingResponseDto`
- **Entity**: `UserStoreMapping`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /user-store-mappings`
   - Tạo mối quan hệ mới.
2. `GET /user-store-mappings`
   - Lấy danh sách mối quan hệ.
3. `GET /user-store-mappings/:userId/:storeId`
   - Lấy chi tiết mối quan hệ.
4. `PATCH /user-store-mappings/:userId/:storeId`
   - Cập nhật mối quan hệ.
5. `DELETE /user-store-mappings/:userId/:storeId`
   - Xóa mềm mối quan hệ.
6. `PATCH /user-store-mappings/:userId/:storeId/restore`
   - Khôi phục mối quan hệ đã xóa.

## Schema

- **UserStoreMapping**:
  - `userId`: UUID
  - `storeId`: UUID
  - `role`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa mối quan hệ.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `UserStoreMappingsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
