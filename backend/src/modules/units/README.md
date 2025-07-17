# Checklist kiểm thử & tối ưu UNITS

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

# Units Module

## Chức năng

- Quản lý đơn vị đo lường (units) cho sản phẩm.
- Các chức năng chính:
  - Tạo đơn vị đo lường mới.
  - Lấy danh sách đơn vị đo lường.
  - Lấy chi tiết đơn vị đo lường.
  - Cập nhật đơn vị đo lường.
  - Xóa mềm đơn vị đo lường.
  - Khôi phục đơn vị đo lường đã xóa.

## Kiến trúc

- **Controller**: `UnitsController`
- **Service**: `UnitsService`
- **DTOs**:
  - `CreateUnitDto`
  - `UpdateUnitDto`
  - `UnitResponseDto`
- **Entity**: `Unit`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /units`
   - Tạo đơn vị đo lường mới.
2. `GET /units`
   - Lấy danh sách đơn vị đo lường.
3. `GET /units/:id`
   - Lấy chi tiết đơn vị đo lường.
4. `PATCH /units/:id`
   - Cập nhật đơn vị đo lường.
5. `DELETE /units/:id`
   - Xóa mềm đơn vị đo lường.
6. `PATCH /units/:id/restore`
   - Khôi phục đơn vị đo lường đã xóa.

## Schema

- **Unit**:
  - `id`: UUID
  - `name`: string
  - `description`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa đơn vị đo lường.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `UnitsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
