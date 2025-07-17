# Vouchers Module

## Chức năng

- Quản lý voucher cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Tạo voucher mới.
  - Lấy danh sách voucher.
  - Lấy chi tiết voucher.
  - Cập nhật voucher.
  - Xóa mềm voucher.
  - Khôi phục voucher đã xóa.

## Kiến trúc

- **Controller**: `VouchersController`
- **Service**: `VouchersService`
- **DTOs**:
  - `CreateVoucherDto`
  - `UpdateVoucherDto`
  - `VoucherResponseDto`
- **Entity**: `Voucher`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/vouchers`
   - Tạo voucher mới.
2. `GET /tenant/:storeId/vouchers`
   - Lấy danh sách voucher.
3. `GET /tenant/:storeId/vouchers/:id`
   - Lấy chi tiết voucher.
4. `PATCH /tenant/:storeId/vouchers/:id`
   - Cập nhật voucher.
5. `DELETE /tenant/:storeId/vouchers/:id`
   - Xóa mềm voucher.
6. `PATCH /tenant/:storeId/vouchers/:id/restore`
   - Khôi phục voucher đã xóa.

## Schema

- **Voucher**:
  - `id`: UUID
  - `storeId`: UUID
  - `code`: string
  - `discount`: number
  - `isActive`: boolean
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa voucher.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `VouchersService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
