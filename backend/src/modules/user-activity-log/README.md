# User Activity Log Module

## Chức năng

- Ghi nhận và quản lý lịch sử hoạt động của người dùng.
- Các chức năng chính:
  - Lấy danh sách lịch sử hoạt động.
  - Ghi nhận hoạt động mới.
  - Lấy chi tiết hoạt động.
  - Lọc lịch sử hoạt động.

## Kiến trúc

- **Controller**: `UserActivityLogController`
- **Service**: `UserActivityLogService`
- **DTOs**:
  - `UserActivityLogResponseDto`
- **Entity**: `UserActivityLog`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`, `RolesGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `GET /user-activity-logs/:storeId`
   - Lấy danh sách lịch sử hoạt động.
2. `POST /user-activity-logs/:storeId`
   - Ghi nhận hoạt động mới.
3. `POST /user-activity-logs/:storeId/get`
   - Lấy chi tiết hoạt động.
4. `POST /user-activity-logs/filter`
   - Lọc lịch sử hoạt động.

## Schema

- **UserActivityLog**:
  - `id`: UUID
  - `storeId`: UUID
  - `userId`: UUID
  - `action`: string
  - `timestamp`: Date
  - `details`: JSON

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền ghi nhận và lọc lịch sử hoạt động.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `UserActivityLogService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard`, `PermissionGuard`, và `RolesGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
