# Installments Module

## Chức năng chính

- Quản lý các khoản trả góp.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các khoản trả góp.

## Kiến trúc

- **Controller:** `InstallmentsController` xử lý các yêu cầu API.
- **Service:** `InstallmentsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateInstallmentDto`: Dữ liệu đầu vào để tạo khoản trả góp.
  - `UpdateInstallmentDto`: Dữ liệu đầu vào để cập nhật khoản trả góp.
  - `InstallmentResponseDto`: Dữ liệu đầu ra cho khoản trả góp.

## API Endpoints

- **POST** `/tenant/:storeId/installments`
  - Tạo khoản trả góp mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`, `STORE_STAFF`.
- **GET** `/tenant/:storeId/installments`
  - Lấy danh sách các khoản trả góp.
- **PATCH** `/tenant/:storeId/installments/:id`
  - Cập nhật khoản trả góp.
- **DELETE** `/tenant/:storeId/installments/:id`
  - Xóa khoản trả góp.

## Bảo mật

- Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.
