# Webhook Logs Module

## Chức năng

- Quản lý lịch sử webhook cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Tạo log webhook mới.
  - Lấy danh sách log webhook.
  - Lấy chi tiết log webhook.
  - Lọc log webhook theo loại hoặc sự kiện.
  - Cập nhật log webhook.
  - Xóa mềm log webhook.
  - Khôi phục log webhook đã xóa.

## Kiến trúc

- **Controller**: `WebhookLogsController`
- **Service**: `WebhookLogsService`
- **DTOs**:
  - `CreateWebhookLogDto`
  - `UpdateWebhookLogDto`
- **Entity**: `WebhookLog`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/webhook-logs`
   - Tạo log webhook mới.
2. `GET /tenant/:storeId/webhook-logs`
   - Lấy danh sách log webhook.
3. `GET /tenant/:storeId/webhook-logs/stats`
   - Lấy thống kê webhook.
4. `GET /tenant/:storeId/webhook-logs/event-type/:eventType`
   - Lọc log webhook theo sự kiện.
5. `GET /tenant/:storeId/webhook-logs/type/:type`
   - Lọc log webhook theo loại.
6. `GET /tenant/:storeId/webhook-logs/:id`
   - Lấy chi tiết log webhook.
7. `PATCH /tenant/:storeId/webhook-logs/:id`
   - Cập nhật log webhook.
8. `DELETE /tenant/:storeId/webhook-logs/:id`
   - Xóa mềm log webhook.
9. `PATCH /tenant/:storeId/webhook-logs/:id/restore`
   - Khôi phục log webhook đã xóa.

## Schema

- **WebhookLog**:
  - `id`: UUID
  - `storeId`: UUID
  - `eventType`: string
  - `type`: string
  - `payload`: JSON
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa log webhook.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `WebhookLogsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
