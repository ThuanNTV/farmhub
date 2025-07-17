# Module Audit Logs

Module này quản lý các log audit trong hệ thống, phục vụ cho việc theo dõi và kiểm tra các hành động của người dùng và hệ thống.

## 1. Chức năng chính

- **Ghi log audit:** Lưu lại các hành động quan trọng của người dùng và hệ thống.
- **Lấy danh sách log audit:** Truy xuất toàn bộ log audit chưa bị xóa mềm.
- **Xem chi tiết log audit:** Lấy thông tin chi tiết theo ID.
- **Xóa mềm log audit:** Đánh dấu log audit là đã xóa (is_deleted=true).

## 2. Kiến trúc & Thiết kế

- **Controller (`audit-logs.controller.ts`):**
  - Xử lý các request HTTP CRUD cho log audit.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`Roles`), giới hạn tần suất (`RateLimitAPI`), và audit log (`AuditInterceptor`).
- **Service (`audit-logs.service.ts`):**
  - Sử dụng repository pattern với TypeORM.
  - Thao tác với entity `AuditLog` trên database global.
  - Xử lý logic nghiệp vụ: kiểm tra tồn tại, xóa mềm, khôi phục, cập nhật thông tin.
- **DTOs:**
  - `CreateAuditLogDto`, `AuditLogResponseDto` dùng cho input/output và validation.
- **Entity:**
  - `AuditLog` định nghĩa bảng `audit_log` trong database global.

## 3. API Endpoints

| Phương thức | Endpoint          | Mô tả                   | Quyền yêu cầu                            |
| ----------- | ----------------- | ----------------------- | ---------------------------------------- |
| POST        | `/audit-logs`     | Ghi log audit mới       | ADMIN_GLOBAL, STORE_MANAGER              |
| GET         | `/audit-logs`     | Lấy danh sách log audit | ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF |
| GET         | `/audit-logs/:id` | Lấy chi tiết log audit  | ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF |
| DELETE      | `/audit-logs/:id` | Xóa mềm log audit       | ADMIN_GLOBAL, STORE_MANAGER              |

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  store_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Ghi log audit:**
   - Khi người dùng thực hiện hành động quan trọng, hệ thống sẽ tự động ghi lại log.
   - Log bao gồm thông tin: hành động, người thực hiện, thời gian, và trạng thái.
2. **Truy vấn log:**
   - Người quản trị có thể truy vấn log theo các tiêu chí như thời gian, người dùng, hoặc hành động.
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

- Mỗi hành động quan trọng phải được ghi lại trong log.
- Log không được chỉnh sửa sau khi đã ghi.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa log.
- Log phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
