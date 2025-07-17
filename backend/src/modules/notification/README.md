# Notification Module

## Chức năng

- Quản lý thông báo cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Lấy danh sách thông báo.
  - Gửi thông báo mới.
  - Lấy chi tiết thông báo.
  - Cập nhật thông báo.
  - Xóa thông báo.
  - Đánh dấu thông báo đã đọc (cá nhân hoặc tất cả).

## Kiến trúc

- **Controller**: `NotificationController`
- **Service**: `NotificationService`
- **DTOs**:
  - `CreateNotificationDto`
  - `UpdateNotificationDto`
- **Entity**: `Notification`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `GET /tenant/:storeId/notifications`
   - Lấy danh sách thông báo.
2. `POST /tenant/:storeId/notifications`
   - Gửi thông báo mới.
3. `GET /tenant/:storeId/notifications/:id`
   - Lấy chi tiết thông báo.
4. `PUT /tenant/:storeId/notifications/:id`
   - Cập nhật thông báo.
5. `DELETE /tenant/:storeId/notifications/:id`
   - Xóa thông báo.
6. `POST /tenant/:storeId/notifications/:id/mark-as-read`
   - Đánh dấu thông báo đã đọc.
7. `POST /tenant/:storeId/notifications/mark-all-as-read`
   - Đánh dấu tất cả thông báo đã đọc.

## Schema

- **Notification**:
  - `id`: UUID
  - `storeId`: UUID
  - `title`: string
  - `message`: string
  - `isRead`: boolean
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền gửi, cập nhật, xóa thông báo.
- STORE_STAFF chỉ có quyền xem và đánh dấu đã đọc.

## Testing

- Unit tests cho `NotificationService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
