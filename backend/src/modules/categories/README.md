# Module Danh mục sản phẩm (Categories)

Module này quản lý danh mục sản phẩm cho từng cửa hàng (tenant), hỗ trợ phân cấp cha-con, slug duy nhất, và các thuộc tính mở rộng.

## 1. Chức năng chính

- **Tạo danh mục mới:** Thêm danh mục sản phẩm, hỗ trợ phân cấp cha-con.
- **Lấy danh sách danh mục:** Truy xuất toàn bộ danh mục chưa bị xóa mềm.
- **Xem chi tiết danh mục:** Lấy thông tin chi tiết theo ID.
- **Cập nhật danh mục:** Sửa tên, slug, mô tả, hình ảnh, cha-con...
- **Xóa mềm danh mục:** Đánh dấu danh mục là đã xóa (is_deleted=true).
- **Khôi phục danh mục:** Khôi phục danh mục đã bị xóa mềm.

## 2. Kiến trúc & Thiết kế

- **Controller (`categories.controller.ts`):**
  - Xử lý các request HTTP CRUD cho danh mục.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`RequireCategoryPermission`), giới hạn tần suất (`RateLimitAPI`), và audit log (`AuditInterceptor`).
- **Service (`categories.service.ts`):**
  - Kế thừa `TenantBaseService<Category>` để hỗ trợ multi-tenant.
  - Kiểm tra unique cho slug, kiểm tra vòng lặp cha-con, validate dữ liệu.
  - Xử lý logic nghiệp vụ: xóa mềm, khôi phục, cập nhật thông tin.
- **DTOs:**
  - `CreateCategoryDto`, `UpdateCategoryDto`, `CategoryResponseDto` dùng cho input/output và validation.
- **Entity:**
  - `Category` định nghĩa bảng `category` trong database tenant.

## 3. API Endpoints

Tất cả endpoint đều có tiền tố `/tenant/:storeId/categories`.

| Phương thức | Endpoint                | Mô tả                  | Quyền yêu cầu     |
| ----------- | ----------------------- | ---------------------- | ----------------- |
| POST        | `/:storeId`             | Tạo danh mục mới       | categories:create |
| GET         | `/:storeId`             | Lấy danh sách danh mục | categories:list   |
| GET         | `/:storeId/:id`         | Lấy chi tiết danh mục  | categories:read   |
| PATCH       | `/:storeId/:id`         | Cập nhật danh mục      | categories:update |
| DELETE      | `/:storeId/:id`         | Xóa mềm danh mục       | categories:delete |
| PATCH       | `/:storeId/:id/restore` | Khôi phục danh mục     | categories:update |

## 4. Cấu trúc Dữ liệu (Database Schema)

Bảng: `category` (database tenant)

| Tên cột              | Kiểu dữ liệu | Mô tả                      |
| -------------------- | ------------ | -------------------------- |
| `category_id`        | varchar(255) | Khóa chính, mã danh mục    |
| `name`               | varchar(255) | Tên danh mục               |
| `slug`               | varchar(255) | Slug duy nhất              |
| `description`        | varchar      | Mô tả                      |
| `parent_id`          | varchar(255) | ID danh mục cha (nullable) |
| `image`              | varchar(500) | Hình ảnh (JSON string)     |
| `display_order`      | int          | Thứ tự hiển thị            |
| `is_active`          | boolean      | Đang hoạt động             |
| `is_deleted`         | boolean      | Đã xóa mềm                 |
| `created_at`         | timestamp    | Thời gian tạo              |
| `updated_at`         | timestamp    | Thời gian cập nhật         |
| `created_by_user_id` | uuid         | ID người tạo               |
| `updated_by_user_id` | uuid         | ID người cập nhật cuối     |

## 5. Luồng xử lý chính

- Khi tạo/cập nhật/xóa danh mục, hệ thống kiểm tra unique slug, validate cha-con, kiểm tra vòng lặp.
- Xóa danh mục là xóa mềm (`is_deleted=true`), có thể khôi phục lại.
- Danh sách danh mục chỉ trả về các bản ghi chưa bị xóa mềm.

## 6. Bảo mật & Kiểm thử

- Áp dụng xác thực JWT, RBAC, kiểm soát quyền trên từng endpoint.
- Đã có unit test và integration test cho service/controller.
- Đảm bảo dữ liệu không bị trùng slug trong cùng store.
- Audit log mọi thao tác thêm/sửa/xóa.

## 7. Business Rule

- Không cho phép trùng slug trong cùng store.
- Không xóa cứng, chỉ xóa mềm.
- Không cho phép tạo vòng lặp cha-con.
- Chỉ user có quyền mới được thao tác thêm/sửa/xóa/khôi phục.
