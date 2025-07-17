# Stock Transfer Items Module

## Chức năng

- Quản lý các mục trong phiếu chuyển kho.
- Các chức năng chính:
  - Tạo mục chuyển kho mới.
  - Lấy danh sách mục chuyển kho.
  - Lấy chi tiết mục chuyển kho.
  - Cập nhật mục chuyển kho.
  - Xóa mục chuyển kho.

## Kiến trúc

- **Controller**: `StockTransferItemsController`
- **Service**: `StockTransferItemsService`
- **DTOs**:
  - `CreateStockTransferItemDto`
  - `UpdateStockTransferItemDto`
- **Entity**: `StockTransferItem`
- **Guard**: `EnhancedAuthGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/stock-transfer-items`
   - Tạo mục chuyển kho mới.
2. `GET /tenant/:storeId/stock-transfer-items`
   - Lấy danh sách mục chuyển kho.
3. `GET /tenant/:storeId/stock-transfer-items/:id`
   - Lấy chi tiết mục chuyển kho.
4. `PATCH /tenant/:storeId/stock-transfer-items/:id`
   - Cập nhật mục chuyển kho.
5. `DELETE /tenant/:storeId/stock-transfer-items/:id`
   - Xóa mục chuyển kho.

## Schema

- **StockTransferItem**:
  - `id`: UUID
  - `storeId`: UUID
  - `productId`: UUID
  - `quantity`: number
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa mục chuyển kho.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `StockTransferItemsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` để kiểm soát truy cập.
- JWT-based authentication.

# Checklist kiểm thử & tối ưu STOCK-TRANSFER-ITEMS

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
