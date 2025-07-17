# Voucher Usage Log Module

## Chức năng

- Quản lý lịch sử sử dụng voucher trong hệ thống.
- Các chức năng chính:
  - Ghi nhận lịch sử sử dụng voucher.
  - Lấy danh sách lịch sử sử dụng voucher.
  - Lấy chi tiết lịch sử sử dụng voucher.

## Kiến trúc

- **Controller**: `VoucherUsageLogController`
- **Service**: `VoucherUsageLogService`
- **DTOs**:
  - `CreateVoucherUsageLogDto`
  - `VoucherUsageLogResponseDto`
- **Entity**: `VoucherUsageLog`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /voucher-usage-log`
   - Ghi nhận lịch sử sử dụng voucher.
2. `GET /voucher-usage-log`
   - Lấy danh sách lịch sử sử dụng voucher.
3. `GET /voucher-usage-log/:id`
   - Lấy chi tiết lịch sử sử dụng voucher.

## Schema

- **VoucherUsageLog**:
  - `id`: UUID
  - `voucherId`: UUID
  - `orderId`: UUID
  - `usedAt`: Date
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền xem lịch sử sử dụng voucher.

## Testing

- Unit tests cho `VoucherUsageLogService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
