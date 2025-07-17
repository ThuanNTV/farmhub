# Promotions Module

## Chức năng

- Quản lý các chương trình khuyến mãi cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Tạo chương trình khuyến mãi mới.
  - Lấy danh sách chương trình khuyến mãi.
  - Lấy chi tiết chương trình khuyến mãi.
  - Cập nhật chương trình khuyến mãi.
  - Xóa mềm chương trình khuyến mãi.
  - Khôi phục chương trình khuyến mãi đã xóa.

## Kiến trúc

- **Controller**: `PromotionsController`
- **Service**: `PromotionsService`
- **DTOs**:
  - `CreatePromotionDto`
  - `UpdatePromotionDto`
- **Entity**: `Promotion`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/promotions`
   - Tạo chương trình khuyến mãi mới.
2. `GET /tenant/:storeId/promotions`
   - Lấy danh sách chương trình khuyến mãi.
3. `GET /tenant/:storeId/promotions/:id`
   - Lấy chi tiết chương trình khuyến mãi.
4. `PATCH /tenant/:storeId/promotions/:id`
   - Cập nhật chương trình khuyến mãi.
5. `PATCH /tenant/:storeId/promotions/:id/restore`
   - Khôi phục chương trình khuyến mãi đã xóa.
6. `DELETE /tenant/:storeId/promotions/:id`
   - Xóa mềm chương trình khuyến mãi.

## Schema

- **Promotion**:
  - `id`: UUID
  - `storeId`: UUID
  - `name`: string
  - `discount`: number
  - `isActive`: boolean
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa chương trình khuyến mãi.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `PromotionsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu PROMOTIONS

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
