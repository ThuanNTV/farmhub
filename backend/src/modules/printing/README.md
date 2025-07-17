# Checklist kiểm thử & tối ưu PRINTING

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

# Printing Module

## Chức năng

- Quản lý các chức năng in ấn cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - In hóa đơn.
  - In phiếu thu.
  - In nhãn mã vạch.
  - In báo giá.

## Kiến trúc

- **Controller**: `PrintingController`
- **Service**: `PrintingService`
- **DTOs**: Không có DTOs cụ thể.
- **Entity**: Không có entity cụ thể.
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`

## API

### Endpoints

1. `POST /tenant/:storeId/printing/invoice`
   - In hóa đơn.
2. `POST /tenant/:storeId/printing/receipt`
   - In phiếu thu.
3. `POST /tenant/:storeId/printing/barcode`
   - In nhãn mã vạch.
4. `POST /tenant/:storeId/printing/quotation`
   - In báo giá.

## Schema

- Không có schema cụ thể.

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền sử dụng các chức năng in ấn.

## Testing

- Unit tests cho `PrintingService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
