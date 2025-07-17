# Dispatch Order Items Module

## Chức năng chính

- Quản lý các mục trong đơn hàng giao hàng.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các mục trong đơn hàng giao hàng.

## Kiến trúc

- **Controller:** `DispatchOrderItemsController` xử lý các yêu cầu API.
- **Service:** `DispatchOrderItemsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateDispatchOrderItemDto`: Dữ liệu đầu vào để tạo mục đơn hàng giao hàng.
  - `UpdateDispatchOrderItemDto`: Dữ liệu đầu vào để cập nhật mục đơn hàng giao hàng.

## API Endpoints

- **POST** `/tenant/:storeId/dispatch-order-items`
  - Tạo mục đơn hàng giao hàng mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`, `STORE_STAFF`.
- **GET** `/tenant/:storeId/dispatch-order-items`
  - Lấy danh sách các mục đơn hàng giao hàng.
- **PATCH** `/tenant/:storeId/dispatch-order-items/:id`
  - Cập nhật mục đơn hàng giao hàng.
- **DELETE** `/tenant/:storeId/dispatch-order-items/:id`
  - Xóa mục đơn hàng giao hàng.

## Bảo mật

- Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.
