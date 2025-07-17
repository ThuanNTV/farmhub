# Stock Adjustments Module

## Chức năng

- Quản lý điều chỉnh tồn kho cho từng cửa hàng (multi-tenant).
- Các chức năng chính:
  - Tạo điều chỉnh tồn kho mới.
  - Lấy danh sách điều chỉnh tồn kho.
  - Lấy chi tiết điều chỉnh tồn kho.
  - Cập nhật điều chỉnh tồn kho.
  - Xóa mềm điều chỉnh tồn kho.
  - Khôi phục điều chỉnh tồn kho đã xóa.

## Kiến trúc

- **Controller**: `StockAdjustmentsController`
- **Service**: `StockAdjustmentsService`
- **DTOs**:
  - `CreateStockAdjustmentDto`
  - `UpdateStockAdjustmentDto`
- **Entity**: `StockAdjustment`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/stock-adjustments`
   - Tạo điều chỉnh tồn kho mới.
2. `GET /tenant/:storeId/stock-adjustments`
   - Lấy danh sách điều chỉnh tồn kho.
3. `GET /tenant/:storeId/stock-adjustments/:id`
   - Lấy chi tiết điều chỉnh tồn kho.
4. `PATCH /tenant/:storeId/stock-adjustments/:id`
   - Cập nhật điều chỉnh tồn kho.
5. `DELETE /tenant/:storeId/stock-adjustments/:id`
   - Xóa mềm điều chỉnh tồn kho.
6. `PATCH /tenant/:storeId/stock-adjustments/:id/restore`
   - Khôi phục điều chỉnh tồn kho đã xóa.

## Schema

- **StockAdjustment**:
  - `id`: UUID
  - `storeId`: UUID
  - `productId`: UUID
  - `quantity`: number
  - `reason`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa điều chỉnh tồn kho.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `StockAdjustmentsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
