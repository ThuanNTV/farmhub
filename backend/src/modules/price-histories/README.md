# Price Histories Module

## Chức năng

- Quản lý lịch sử giá sản phẩm.
- Các chức năng chính:
  - Tạo lịch sử giá mới.
  - Lấy danh sách lịch sử giá.
  - Lấy chi tiết lịch sử giá.
  - Cập nhật lịch sử giá.
  - Xóa mềm lịch sử giá.
  - Khôi phục lịch sử giá đã xóa.

## Kiến trúc

- **Controller**: `PriceHistoriesController`
- **Service**: `PriceHistoriesService`
- **DTOs**:
  - `CreatePriceHistoryDto`
  - `UpdatePriceHistoryDto`
  - `PriceHistoryResponseDto`
- **Entity**: `PriceHistory`
- **Guard**: `JwtAuthGuard`, `RolesGuard`, `RateLimitGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/price-histories`
   - Tạo lịch sử giá mới.
2. `GET /tenant/:storeId/price-histories`
   - Lấy danh sách lịch sử giá.
3. `GET /tenant/:storeId/price-histories/:id`
   - Lấy chi tiết lịch sử giá.
4. `PATCH /tenant/:storeId/price-histories/:id`
   - Cập nhật lịch sử giá.
5. `PATCH /tenant/:storeId/price-histories/:id/restore`
   - Khôi phục lịch sử giá đã xóa.
6. `DELETE /tenant/:storeId/price-histories/:id`
   - Xóa mềm lịch sử giá.

## Schema

- **PriceHistory**:
  - `id`: UUID
  - `storeId`: UUID
  - `productId`: UUID
  - `price`: number
  - `effectiveDate`: Date
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa lịch sử giá.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `PriceHistoriesService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
