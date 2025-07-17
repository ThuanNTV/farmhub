# Dispatch Orders Module

## Chức năng chính

- Quản lý các đơn hàng giao hàng.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn đơn hàng giao hàng.

## Kiến trúc

- **Controller:** `DispatchOrdersController` xử lý các yêu cầu API.
- **Service:** `DispatchOrdersService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateDispatchOrderDto`: Dữ liệu đầu vào để tạo đơn hàng giao hàng.
  - `UpdateDispatchOrderDto`: Dữ liệu đầu vào để cập nhật đơn hàng giao hàng.

## API Endpoints

- **POST** `/tenant/:storeId/dispatch-orders`
  - Tạo đơn hàng giao hàng mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`, `STORE_STAFF`.
- **GET** `/tenant/:storeId/dispatch-orders`
  - Lấy danh sách các đơn hàng giao hàng.
- **PATCH** `/tenant/:storeId/dispatch-orders/:id`
  - Cập nhật đơn hàng giao hàng.
- **DELETE** `/tenant/:storeId/dispatch-orders/:id`
  - Xóa đơn hàng giao hàng.

## Bảo mật

- Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.
