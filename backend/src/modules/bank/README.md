# Module Ngân hàng (Bank)

Module này quản lý danh sách ngân hàng dùng chung cho toàn hệ thống (global), phục vụ cho các nghiệp vụ liên quan đến tài khoản ngân hàng, thanh toán, đối soát...

## 1. Chức năng chính

- **Tạo ngân hàng mới:** Thêm ngân hàng vào danh mục chung.
- **Lấy danh sách ngân hàng:** Truy xuất toàn bộ ngân hàng chưa bị xóa mềm.
- **Xem chi tiết ngân hàng:** Lấy thông tin chi tiết theo ID.
- **Cập nhật thông tin ngân hàng:** Sửa tên ngân hàng.
- **Xóa mềm ngân hàng:** Đánh dấu ngân hàng là đã xóa (is_deleted=true).
- **Khôi phục ngân hàng:** Khôi phục ngân hàng đã bị xóa mềm.

## 2. Kiến trúc & Thiết kế

- **Controller (`bank.controller.ts`):**
  - Xử lý các request HTTP CRUD cho ngân hàng.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`Roles`, `RequireUserPermission`), giới hạn tần suất (`RateLimitAPI`), và audit log (`AuditInterceptor`).
- **Service (`bank.service.ts`):**
  - Sử dụng repository pattern với TypeORM.
  - Thao tác với entity `Bank` trên database global.
  - Xử lý logic nghiệp vụ: kiểm tra tồn tại, xóa mềm, khôi phục, cập nhật thông tin.
- **DTOs:**
  - `CreateBankDto`, `UpdateBankDto`, `BankResponseDto` dùng cho input/output và validation.
- **Entity:**
  - `Bank` định nghĩa bảng `bank` trong database global.

## 3. API Endpoints

| Phương thức | Endpoint             | Mô tả                   | Quyền yêu cầu                            |
| ----------- | -------------------- | ----------------------- | ---------------------------------------- |
| POST        | `/banks`             | Tạo ngân hàng mới       | ADMIN_GLOBAL, STORE_MANAGER              |
| GET         | `/banks`             | Lấy danh sách ngân hàng | Tất cả vai trò                           |
| GET         | `/banks/:id`         | Lấy chi tiết ngân hàng  | ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF |
| PATCH       | `/banks/:id`         | Cập nhật ngân hàng      | ADMIN_GLOBAL, STORE_MANAGER              |
| DELETE      | `/banks/:id`         | Xóa mềm ngân hàng       | ADMIN_GLOBAL, STORE_MANAGER              |
| PATCH       | `/banks/:id/restore` | Khôi phục ngân hàng     | ADMIN_GLOBAL, STORE_MANAGER              |

## 4. Cấu trúc Dữ liệu (Database Schema)

Bảng: `bank` (database global)

| Tên cột              | Kiểu dữ liệu | Mô tả                    |
| -------------------- | ------------ | ------------------------ |
| `id`                 | varchar(50)  | Khóa chính, mã ngân hàng |
| `name`               | varchar(255) | Tên ngân hàng            |
| `created_at`         | timestamp    | Thời gian tạo            |
| `updated_at`         | timestamp    | Thời gian cập nhật       |
| `created_by_user_id` | uuid         | ID người tạo             |
| `updated_by_user_id` | uuid         | ID người cập nhật cuối   |
| `is_deleted`         | boolean      | Đã xóa mềm hay chưa      |

## 5. Luồng xử lý chính

- Khi tạo/cập nhật/xóa ngân hàng, hệ thống ghi nhận user thao tác qua trường `created_by_user_id`/`updated_by_user_id`.
- Xóa ngân hàng là xóa mềm (`is_deleted=true`), có thể khôi phục lại.
- Danh sách ngân hàng chỉ trả về các bản ghi chưa bị xóa mềm.

## 6. Bảo mật & Kiểm thử

- Áp dụng xác thực JWT, RBAC, kiểm soát quyền trên từng endpoint.
- Đã có unit test và integration test cho service/controller.
- Đảm bảo dữ liệu không bị trùng mã ngân hàng.
- Audit log mọi thao tác thêm/sửa/xóa.

## 7. Business Rule

- Không cho phép trùng mã ngân hàng (`id`).
- Không xóa cứng, chỉ xóa mềm.
- Chỉ user có quyền mới được thao tác thêm/sửa/xóa/khôi phục.
