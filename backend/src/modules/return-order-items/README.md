# Return Order Items Module

## Chức năng

- Quản lý các mục trong đơn trả hàng.
- Các chức năng chính:
  - Tạo mục trả hàng mới.
  - Lấy danh sách mục trả hàng.
  - Lấy chi tiết mục trả hàng.
  - Cập nhật mục trả hàng.
  - Xóa mềm mục trả hàng.
  - Khôi phục mục trả hàng đã xóa.

## Kiến trúc

- **Controller**: `ReturnOrderItemsController`
- **Service**: `ReturnOrderItemsService`
- **DTOs**:
  - `CreateReturnOrderItemDto`
  - `UpdateReturnOrderItemDto`
  - `ReturnOrderItemResponseDto`
- **Entity**: `ReturnOrderItem`
- **Guard**: `EnhancedAuthGuard`, `RolesGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/return-order-items`
   - Tạo mục trả hàng mới.
2. `GET /tenant/:storeId/return-order-items`
   - Lấy danh sách mục trả hàng.
3. `GET /tenant/:storeId/return-order-items/:id`
   - Lấy chi tiết mục trả hàng.
4. `PATCH /tenant/:storeId/return-order-items/:id`
   - Cập nhật mục trả hàng.
5. `DELETE /tenant/:storeId/return-order-items/:id`
   - Xóa mềm mục trả hàng.
6. `PATCH /tenant/:storeId/return-order-items/:id/restore`
   - Khôi phục mục trả hàng đã xóa.

## Schema

- **ReturnOrderItem**:
  - `id`: UUID
  - `storeId`: UUID
  - `orderId`: UUID
  - `productId`: UUID
  - `quantity`: number
  - `reason`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa mục trả hàng.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `ReturnOrderItemsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `RolesGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu RETURN-ORDER-ITEMS

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
