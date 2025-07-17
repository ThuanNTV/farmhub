# Recreate Order Module

## Chức năng

- Tạo lại đơn hàng từ đơn hàng cũ (clone).
- Các chức năng chính:
  - Tạo lại đơn hàng từ ID đơn hàng cũ.

## Kiến trúc

- **Controller**: `RecreateOrderController`
- **Service**: `OrdersService`
- **DTOs**: Không có DTOs cụ thể.
- **Entity**: Không có entity cụ thể.
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`

## API

### Endpoints

1. `POST /orders/recreate/:storeId`
   - Tạo lại đơn hàng từ ID đơn hàng cũ.

## Schema

- Không có schema cụ thể.

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo lại đơn hàng.

## Testing

- Unit tests cho `OrdersService`.
- Integration tests cho endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu RECREATE-ORDER

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
