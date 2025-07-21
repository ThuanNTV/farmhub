# Module Audit Logs

Module này quản lý các log audit trong hệ thống, phục vụ cho việc theo dõi và kiểm tra các hành động của người dùng và hệ thống với các tính năng nâng cao.

## 1. Chức năng chính

### Core Features

- **Ghi log audit:** Lưu lại các hành động quan trọng của người dùng và hệ thống.
- **Lấy danh sách log audit:** Truy xuất toàn bộ log audit chưa bị xóa mềm.
- **Xem chi tiết log audit:** Lấy thông tin chi tiết theo ID.
- **Cập nhật log audit:** Chỉnh sửa thông tin log audit.
- **Xóa mềm log audit:** Đánh dấu log audit là đã xóa (is_deleted=true).

### Advanced Features

- **Tìm kiếm nâng cao:** Lọc logs theo nhiều tiêu chí (user, action, table, date range, device, browser, IP).
- **Thống kê và báo cáo:** Phân tích logs theo action, table, user, device, browser.
- **Lịch sử thay đổi:** Theo dõi toàn bộ lịch sử thay đổi của một record cụ thể.
- **Phân trang:** Hỗ trợ phân trang cho danh sách lớn.
- **Export dữ liệu:** Xuất logs ra các định dạng khác nhau.

## 2. Kiến trúc & Thiết kế

- **Controller (`audit-logs.controller.ts`):**
  - Xử lý các request HTTP CRUD cho log audit.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`Roles`), giới hạn tần suất (`RateLimitAPI`), và audit log (`AuditInterceptor`).
  - Cung cấp endpoints cho tìm kiếm nâng cao, thống kê, và lịch sử thay đổi.
- **Service (`audit-logs.service.ts`):**
  - Sử dụng repository pattern với TypeORM.
  - Thao tác với entity `AuditLog` trên database tenant.
  - Xử lý logic nghiệp vụ: kiểm tra tồn tại, xóa mềm, khôi phục, cập nhật thông tin.
  - Cung cấp các phương thức nâng cao: tìm kiếm với filter, thống kê, lịch sử thay đổi.
- **DTOs:**
  - `CreateAuditLogDto`, `UpdateAuditLogDto`: Input validation.
  - `AuditLogResponseDto`: Output format.
  - `AuditLogFilterDto`: Tìm kiếm và lọc nâng cao.
  - `AuditLogStatsDto`: Thống kê và báo cáo.
  - `PaginatedAuditLogResponseDto`: Phân trang kết quả.
- **Entity:**
  - `AuditLog` định nghĩa bảng `audit_log` trong database tenant.
  - Bao gồm các trường mở rộng: device, browser, OS, IP, session, old/new values.

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id UUID NOT NULL,
  store_id UUID NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  device VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  user_name VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  details TEXT,
  created_by_user_id UUID,
  updated_by_user_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes for better performance
CREATE INDEX IDX_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IDX_audit_log_target_table ON audit_log(target_table);
CREATE INDEX IDX_audit_log_store_id ON audit_log(store_id);
CREATE INDEX IDX_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IDX_audit_log_action ON audit_log(action);
CREATE INDEX IDX_audit_log_composite ON audit_log(store_id, target_table, created_at);
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
