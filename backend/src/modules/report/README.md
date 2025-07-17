# Checklist kiểm thử & tối ưu REPORT

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

# Report Module

## Chức năng

- Quản lý báo cáo cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Xuất báo cáo tổng hợp (Excel/PDF).
  - Lấy danh sách loại báo cáo hỗ trợ.
  - Xem trước dữ liệu báo cáo.
  - Báo cáo doanh thu chi tiết.
  - Báo cáo đơn hàng chi tiết.
  - Báo cáo khách hàng.
  - Báo cáo sản phẩm.
  - Báo cáo tồn kho.

## Kiến trúc

- **Controller**: `ReportController`
- **Service**: `ReportService`
- **DTOs**: Không có DTOs cụ thể.
- **Entity**: Không có entity cụ thể.
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`

## API

### Endpoints

1. `GET /tenant/:storeId/reports/export`
   - Xuất báo cáo tổng hợp (Excel/PDF).
2. `GET /tenant/:storeId/reports/types`
   - Lấy danh sách loại báo cáo hỗ trợ.
3. `GET /tenant/:storeId/reports/preview`
   - Xem trước dữ liệu báo cáo.
4. `GET /tenant/:storeId/reports/revenue`
   - Báo cáo doanh thu chi tiết.
5. `GET /tenant/:storeId/reports/orders`
   - Báo cáo đơn hàng chi tiết.
6. `GET /tenant/:storeId/reports/customers`
   - Báo cáo khách hàng.
7. `GET /tenant/:storeId/reports/products`
   - Báo cáo sản phẩm.
8. `GET /tenant/:storeId/reports/inventory`
   - Báo cáo tồn kho.

## Schema

- Không có schema cụ thể.

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền truy cập các chức năng báo cáo.

## Testing

- Unit tests cho `ReportService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
