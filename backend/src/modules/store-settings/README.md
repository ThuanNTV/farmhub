# Store Settings Module

## Chức năng

- Quản lý cài đặt cửa hàng.
- Các chức năng chính:
  - Tạo cài đặt mới.
  - Lấy danh sách cài đặt.
  - Lấy chi tiết cài đặt theo ID hoặc key.
  - Cập nhật cài đặt theo ID hoặc key.
  - Xóa mềm cài đặt.
  - Khôi phục cài đặt đã xóa.

## Kiến trúc

- **Controller**: `StoreSettingsController`
- **Service**: `StoreSettingsService`
- **DTOs**:
  - `CreateStoreSettingDto`
  - `UpdateStoreSettingDto`
- **Entity**: `StoreSetting`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/store-settings`
   - Tạo cài đặt mới.
2. `GET /tenant/:storeId/store-settings`
   - Lấy danh sách cài đặt.
3. `GET /tenant/:storeId/store-settings/key/:key`
   - Lấy chi tiết cài đặt theo key.
4. `GET /tenant/:storeId/store-settings/:id`
   - Lấy chi tiết cài đặt theo ID.
5. `PATCH /tenant/:storeId/store-settings/:id`
   - Cập nhật cài đặt theo ID.
6. `PATCH /tenant/:storeId/store-settings/key/:key`
   - Cập nhật cài đặt theo key.
7. `DELETE /tenant/:storeId/store-settings/:id`
   - Xóa mềm cài đặt.
8. `PATCH /tenant/:storeId/store-settings/:id/restore`
   - Khôi phục cài đặt đã xóa.

## Schema

- **StoreSetting**:
  - `id`: UUID
  - `storeId`: UUID
  - `key`: string
  - `value`: string
  - `category`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa cài đặt.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `StoreSettingsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu STORE-SETTINGS

## 1. Entity & Quan hệ

- [ ] Kiểm tra entity, quan hệ, ràng buộc dữ liệu.
- [ ] Kiểm tra migration, seed dữ liệu mẫu.

## 2. API & Luồng nghiệp vụ

- [ ] Test API tạo, sửa, xóa, lấy danh sách, chi tiết.
- [ ] Test validate input, lỗi edge case.
- [ ] Test phân quyền, RBAC, multi-tenant (nếu có).
- [ ] Test transaction, rollback khi lỗi.

## 3. Tích hợp & Liên kết module khác

- [ ] Kiểm thử liên kết với các module liên quan (nếu có).
- [ ] Test đồng bộ dữ liệu, event, webhook.

## 4. Test case & Automation

- [ ] Viết test case unit, integration, e2e cho các luồng chính.
- [ ] Test coverage > 80%.

## 5. Hiệu năng & Bảo mật

- [ ] Test hiệu năng API, DB (nếu cần).
- [ ] Test bảo mật (SQLi, XSS, CORS, auth, rate limit).

## 6. Đề xuất bổ sung

- [ ] Đề xuất tối ưu, refactor, bổ sung tính năng mới (nếu có).

---
