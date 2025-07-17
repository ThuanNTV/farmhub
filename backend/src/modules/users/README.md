# Users Module

## Chức năng

- Quản lý người dùng trong hệ thống.
- Các chức năng chính:
  - Tạo người dùng mới.
  - Lấy danh sách người dùng.
  - Lấy chi tiết người dùng.
  - Cập nhật thông tin người dùng.
  - Xóa mềm người dùng.
  - Khôi phục người dùng đã xóa.

## Kiến trúc

- **Controller**: `UsersController`
- **Service**: `UsersService`
- **DTOs**:
  - `CreateUserDto`
  - `UpdateUserDto`
  - `UserResponseDto`
- **Entity**: `User`
- **Guard**: `EnhancedAuthGuard`, `RolesGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /users`
   - Tạo người dùng mới.
2. `GET /users`
   - Lấy danh sách người dùng.
3. `GET /users/:id`
   - Lấy chi tiết người dùng.
4. `PATCH /users/:id`
   - Cập nhật thông tin người dùng.
5. `DELETE /users/:id`
   - Xóa mềm người dùng.
6. `PATCH /users/:id/restore`
   - Khôi phục người dùng đã xóa.

## Schema

- **User**:
  - `id`: UUID
  - `email`: string
  - `role`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL mới có quyền tạo, cập nhật, xóa người dùng.
- STORE_MANAGER chỉ có quyền xem.

## Testing

- Unit tests cho `UsersService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `RolesGuard` để kiểm soát truy cập.
- JWT-based authentication.
