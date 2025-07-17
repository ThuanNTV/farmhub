# Loyalty Point Logs Module

## Chức năng chính

- Quản lý các log điểm thưởng khách hàng.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các log điểm thưởng.

## Kiến trúc

- **Controller:** `LoyaltyPointLogsController` xử lý các yêu cầu API.
- **Service:** `LoyaltyPointLogsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateLoyaltyPointLogDto`: Dữ liệu đầu vào để tạo log điểm thưởng.
  - `UpdateLoyaltyPointLogDto`: Dữ liệu đầu vào để cập nhật log điểm thưởng.
  - `LoyaltyPointLogResponseDto`: Dữ liệu đầu ra cho log điểm thưởng.

## API Endpoints

- **POST** `/tenant/:storeId/loyalty-point-logs`
  - Tạo log điểm thưởng mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`.
- **GET** `/tenant/:storeId/loyalty-point-logs`
  - Lấy danh sách các log điểm thưởng.
- **PATCH** `/tenant/:storeId/loyalty-point-logs/:id`
  - Cập nhật log điểm thưởng.
- **DELETE** `/tenant/:storeId/loyalty-point-logs/:id`
  - Xóa log điểm thưởng.

## Bảo mật

- Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE loyalty_point_log (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  points INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Tạo log điểm thưởng:**
   - Khi khách hàng thực hiện giao dịch, API sẽ ghi lại log điểm thưởng.
2. **Truy vấn log điểm thưởng:**
   - Người dùng có thể truy vấn danh sách log điểm thưởng theo khách hàng hoặc ID log.
3. **Xóa mềm log điểm thưởng:**
   - Log điểm thưởng có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL` hoặc `STORE_MANAGER` mới có quyền truy cập.
  - Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.

## 7. Business Rule

- Mỗi log điểm thưởng phải được liên kết với một khách hàng cụ thể.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa log điểm thưởng.
- Log điểm thưởng phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
