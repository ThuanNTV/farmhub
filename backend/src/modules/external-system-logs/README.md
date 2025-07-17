# External System Logs Module

## Chức năng chính

- Quản lý các log từ hệ thống bên ngoài.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn log.

## Kiến trúc

- **Controller:** `ExternalSystemLogsController` xử lý các yêu cầu API.
- **Service:** `ExternalSystemLogsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateExternalSystemLogDto`: Dữ liệu đầu vào để tạo log.
  - `UpdateExternalSystemLogDto`: Dữ liệu đầu vào để cập nhật log.

## API Endpoints

- **POST** `/tenant/:storeId/external-system-logs`
  - Tạo log mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`.
- **GET** `/tenant/:storeId/external-system-logs`
  - Lấy danh sách log.
- **PATCH** `/tenant/:storeId/external-system-logs/:id`
  - Cập nhật log.
- **DELETE** `/tenant/:storeId/external-system-logs/:id`
  - Xóa log.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE external_system_log (
  id SERIAL PRIMARY KEY,
  system_name VARCHAR(255) NOT NULL,
  log_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  store_id INT,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Ghi log từ hệ thống bên ngoài:**
   - Khi hệ thống bên ngoài gửi log, API sẽ ghi lại thông tin log vào cơ sở dữ liệu.
   - Log bao gồm thông tin: tên hệ thống, nội dung log, thời gian, và trạng thái.
2. **Truy vấn log:**
   - Người quản trị có thể truy vấn log theo các tiêu chí như thời gian, hệ thống, hoặc nội dung log.
3. **Xóa mềm log:**
   - Log có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL` hoặc `STORE_MANAGER` mới có quyền truy cập đầy đủ.
  - Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
  - Áp dụng `RateLimitAPI` để giới hạn tần suất truy cập.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.
  - Đảm bảo các endpoint hoạt động đúng với các trường hợp hợp lệ và không hợp lệ.

## 7. Business Rule

- Mỗi log từ hệ thống bên ngoài phải được ghi lại đầy đủ.
- Log không được chỉnh sửa sau khi đã ghi.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa log.
- Log phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
