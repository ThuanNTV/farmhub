# Inventory Transfer Items Module

## Chức năng chính

- Quản lý các mục trong phiếu chuyển kho.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các mục trong phiếu chuyển kho.

## Kiến trúc

- **Controller:** `InventoryTransferItemsController` xử lý các yêu cầu API.
- **Service:** `InventoryTransferItemsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateInventoryTransferItemDto`: Dữ liệu đầu vào để tạo mục chuyển kho.
  - `UpdateInventoryTransferItemDto`: Dữ liệu đầu vào để cập nhật mục chuyển kho.

## API Endpoints

- **POST** `/tenant/:storeId/inventory-transfer-items`
  - Tạo mục chuyển kho mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`.
- **GET** `/tenant/:storeId/inventory-transfer-items`
  - Lấy danh sách các mục chuyển kho.
- **PATCH** `/tenant/:storeId/inventory-transfer-items/:id`
  - Cập nhật mục chuyển kho.
- **DELETE** `/tenant/:storeId/inventory-transfer-items/:id`
  - Xóa mục chuyển kho.

## Bảo mật

- Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE inventory_transfer_item (
  id SERIAL PRIMARY KEY,
  transfer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Tạo mục chuyển kho:**
   - Khi người dùng thêm mục vào phiếu chuyển kho, API sẽ lưu trữ thông tin mục chuyển kho.
2. **Truy vấn mục chuyển kho:**
   - Người dùng có thể truy vấn danh sách mục chuyển kho theo phiếu hoặc ID mục.
3. **Xóa mềm mục chuyển kho:**
   - Mục chuyển kho có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL` hoặc `STORE_MANAGER` mới có quyền truy cập.
  - Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.

## 7. Business Rule

- Mỗi mục chuyển kho phải được liên kết với một phiếu chuyển kho cụ thể.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa mục chuyển kho.
- Mục chuyển kho phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
