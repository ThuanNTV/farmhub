# Tag Module

## Chức năng

- Quản lý nhãn (tags) cho sản phẩm hoặc các đối tượng khác.
- Các chức năng chính:
  - Tạo nhãn mới.
  - Lấy danh sách nhãn.
  - Lấy chi tiết nhãn.
  - Cập nhật nhãn.
  - Xóa mềm nhãn.
  - Khôi phục nhãn đã xóa.

## Kiến trúc

- **Controller**: `TagController`
- **Service**: `TagService`
- **DTOs**:
  - `CreateTagDto`
  - `UpdateTagDto`
- **Entity**: `Tag`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tags`
   - Tạo nhãn mới.
2. `GET /tags`
   - Lấy danh sách nhãn.
3. `GET /tags/:id`
   - Lấy chi tiết nhãn.
4. `PUT /tags/:id`
   - Cập nhật nhãn.
5. `DELETE /tags/:id`
   - Xóa mềm nhãn.
6. `POST /tags/:id/restore`
   - Khôi phục nhãn đã xóa.

## Schema

- **Tag**:
  - `id`: UUID
  - `storeId`: UUID
  - `name`: string
  - `isActive`: boolean
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa nhãn.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `TagService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.

# Checklist kiểm thử & tối ưu TAG

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
