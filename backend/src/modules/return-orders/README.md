# Return Orders Module

## Chức năng

- Quản lý các đơn trả hàng.
- Các chức năng chính:
  - Tạo đơn trả hàng mới.
  - Lấy danh sách đơn trả hàng.
  - Lấy chi tiết đơn trả hàng.
  - Cập nhật đơn trả hàng.
  - Xóa mềm đơn trả hàng.
  - Khôi phục đơn trả hàng đã xóa.

## Kiến trúc

- **Controller**: `ReturnOrdersController`
- **Service**: `ReturnOrdersService`
- **DTOs**:
  - `CreateReturnOrderDto`
  - `UpdateReturnOrderDto`
- **Entity**: `ReturnOrder`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/return-orders`
   - Tạo đơn trả hàng mới.
2. `GET /tenant/:storeId/return-orders`
   - Lấy danh sách đơn trả hàng.
3. `GET /tenant/:storeId/return-orders/:id`
   - Lấy chi tiết đơn trả hàng.
4. `PATCH /tenant/:storeId/return-orders/:id`
   - Cập nhật đơn trả hàng.
5. `PATCH /tenant/:storeId/return-orders/:id/restore`
   - Khôi phục đơn trả hàng đã xóa.
6. `DELETE /tenant/:storeId/return-orders/:id`
   - Xóa mềm đơn trả hàng.

## Schema

- **ReturnOrder**:
  - `id`: UUID
  - `storeId`: UUID
  - `customerId`: UUID
  - `totalAmount`: number
  - `status`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa đơn trả hàng.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `ReturnOrdersService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu RETURN-ORDERS

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
