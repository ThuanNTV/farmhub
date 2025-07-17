# File Attachments Module

## Chức năng chính

- Quản lý các tệp đính kèm liên quan đến nhiều loại thực thể.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn tệp đính kèm.

## Kiến trúc

- **Controller:** `FileAttachmentsController` xử lý các yêu cầu API.
- **Service:** `FileAttachmentsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateFileAttachmentDto`: Dữ liệu đầu vào để tạo tệp đính kèm.
  - `UpdateFileAttachmentDto`: Dữ liệu đầu vào để cập nhật tệp đính kèm.
  - `FileAttachmentResponseDto`: Dữ liệu đầu ra cho tệp đính kèm.

## API Endpoints

- **POST** `/tenant/:storeId/file-attachments`
  - Tạo tệp đính kèm mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`, `STORE_STAFF`.
- **GET** `/tenant/:storeId/file-attachments`
  - Lấy danh sách tệp đính kèm.
- **PATCH** `/tenant/:storeId/file-attachments/:id`
  - Cập nhật tệp đính kèm.
- **DELETE** `/tenant/:storeId/file-attachments/:id`
  - Xóa tệp đính kèm.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE file_attachment (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  store_id INT,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Tạo tệp đính kèm:**
   - Khi người dùng tải lên tệp, API sẽ lưu trữ thông tin tệp và liên kết với thực thể tương ứng.
   - Thông tin bao gồm: tên tệp, đường dẫn, loại thực thể, và ID thực thể.
2. **Truy vấn tệp đính kèm:**
   - Người dùng có thể truy vấn danh sách tệp đính kèm theo thực thể hoặc ID tệp.
3. **Xóa mềm tệp đính kèm:**
   - Tệp đính kèm có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL`, `STORE_MANAGER`, hoặc `STORE_STAFF` mới có quyền truy cập.
  - Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.
  - Đảm bảo các endpoint hoạt động đúng với các trường hợp hợp lệ và không hợp lệ.

## 7. Business Rule

- Mỗi tệp đính kèm phải được liên kết với một thực thể cụ thể.
- Tệp đính kèm không được chỉnh sửa sau khi đã tải lên.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa tệp đính kèm.
- Tệp đính kèm phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
