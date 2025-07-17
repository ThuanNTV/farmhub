# Checklist kiểm thử & tối ưu SUPPLIERS

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

# Suppliers Module

## Chức năng

- Quản lý thông tin nhà cung cấp.
- Các chức năng chính:
  - Tạo nhà cung cấp mới.
  - Lấy danh sách nhà cung cấp.
  - Lấy chi tiết nhà cung cấp.
  - Cập nhật thông tin nhà cung cấp.
  - Xóa mềm nhà cung cấp.
  - Khôi phục nhà cung cấp đã xóa.

## Kiến trúc

- **Controller**: `SuppliersController`
- **Service**: `SuppliersService`
- **DTOs**:
  - `CreateSupplierDto`
  - `UpdateSupplierDto`
- **Entity**: `Supplier`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/suppliers`
   - Tạo nhà cung cấp mới.
2. `GET /tenant/:storeId/suppliers`
   - Lấy danh sách nhà cung cấp.
3. `GET /tenant/:storeId/suppliers/:id`
   - Lấy chi tiết nhà cung cấp.
4. `PATCH /tenant/:storeId/suppliers/:id`
   - Cập nhật thông tin nhà cung cấp.
5. `DELETE /tenant/:storeId/suppliers/:id`
   - Xóa mềm nhà cung cấp.
6. `PATCH /tenant/:storeId/suppliers/:id/restore`
   - Khôi phục nhà cung cấp đã xóa.

## Schema

- **Supplier**:
  - `id`: UUID
  - `storeId`: UUID
  - `name`: string
  - `contactInfo`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa nhà cung cấp.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `SuppliersService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
