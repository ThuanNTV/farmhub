# Scheduled Task Module

## Chức năng

- Quản lý các tác vụ định kỳ cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Lấy danh sách tác vụ định kỳ.
  - Tạo tác vụ định kỳ mới.
  - Lấy chi tiết tác vụ.
  - Cập nhật tác vụ.
  - Xóa tác vụ.

## Kiến trúc

- **Controller**: `ScheduledTaskController`
- **Service**: `ScheduledTaskService`
- **DTOs**: Không có DTOs cụ thể.
- **Entity**: Không có entity cụ thể.
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `GET /tenant/:storeId/scheduled-tasks`
   - Lấy danh sách tác vụ định kỳ.
2. `POST /tenant/:storeId/scheduled-tasks`
   - Tạo tác vụ định kỳ mới.
3. `POST /tenant/:storeId/scheduled-tasks/get`
   - Lấy chi tiết tác vụ.
4. `POST /tenant/:storeId/scheduled-tasks/update`
   - Cập nhật tác vụ.
5. `POST /tenant/:storeId/scheduled-tasks/remove`
   - Xóa tác vụ.

## Schema

- Không có schema cụ thể.

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa tác vụ định kỳ.

## Testing

- Unit tests cho `ScheduledTaskService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu SCHEDULED-TASK

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
