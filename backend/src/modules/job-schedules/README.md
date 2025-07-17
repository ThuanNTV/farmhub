# Job Schedules Module

## Chức năng chính

- Quản lý các lịch trình công việc định kỳ.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các lịch trình công việc.

## Kiến trúc

- **Controller:** `JobSchedulesController` xử lý các yêu cầu API.
- **Service:** `JobSchedulesService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateJobScheduleDto`: Dữ liệu đầu vào để tạo lịch trình công việc.
  - `UpdateJobScheduleDto`: Dữ liệu đầu vào để cập nhật lịch trình công việc.
  - `JobScheduleResponseDto`: Dữ liệu đầu ra cho lịch trình công việc.

## API Endpoints

- **POST** `/tenant/:storeId/job-schedules`
  - Tạo lịch trình công việc mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`.
- **GET** `/tenant/:storeId/job-schedules`
  - Lấy danh sách các lịch trình công việc.
- **PATCH** `/tenant/:storeId/job-schedules/:id`
  - Cập nhật lịch trình công việc.
- **DELETE** `/tenant/:storeId/job-schedules/:id`
  - Xóa lịch trình công việc.

## Bảo mật

- Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE job_schedule (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Tạo lịch trình công việc:**
   - Khi người dùng tạo lịch trình công việc, API sẽ lưu trữ thông tin lịch trình.
2. **Truy vấn lịch trình công việc:**
   - Người dùng có thể truy vấn danh sách lịch trình công việc theo tên hoặc ID.
3. **Xóa mềm lịch trình công việc:**
   - Lịch trình công việc có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL` hoặc `STORE_MANAGER` mới có quyền truy cập.
  - Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.

## 7. Business Rule

- Mỗi lịch trình công việc phải được định nghĩa với một biểu thức cron hợp lệ.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa lịch trình công việc.
- Lịch trình công việc phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
