# Inventory Transfers Module

## Chức năng chính

- Quản lý các phiếu chuyển kho.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn các phiếu chuyển kho.

## Kiến trúc

- **Controller:** `InventoryTransfersController` xử lý các yêu cầu API.
- **Service:** `InventoryTransfersService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateInventoryTransferDto`: Dữ liệu đầu vào để tạo phiếu chuyển kho.
  - `UpdateInventoryTransferDto`: Dữ liệu đầu vào để cập nhật phiếu chuyển kho.
  - `InventoryTransferResponseDto`: Dữ liệu đầu ra cho phiếu chuyển kho.

## API Endpoints

- **POST** `/tenant/:storeId/inventory-transfers`
  - Tạo phiếu chuyển kho mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`.
- **GET** `/tenant/:storeId/inventory-transfers`
  - Lấy danh sách các phiếu chuyển kho.
- **PATCH** `/tenant/:storeId/inventory-transfers/:id`
  - Cập nhật phiếu chuyển kho.
- **DELETE** `/tenant/:storeId/inventory-transfers/:id`
  - Xóa phiếu chuyển kho.

## Bảo mật

- Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.

## 4. Cấu trúc Dữ liệu (Database Schema)

```sql
CREATE TABLE inventory_transfer (
  id SERIAL PRIMARY KEY,
  transfer_code VARCHAR(255) NOT NULL,
  source_warehouse_id INT NOT NULL,
  destination_warehouse_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

## 5. Luồng xử lý chính

1. **Tạo phiếu chuyển kho:**
   - Khi người dùng tạo phiếu chuyển kho, API sẽ lưu trữ thông tin phiếu chuyển kho.
2. **Truy vấn phiếu chuyển kho:**
   - Người dùng có thể truy vấn danh sách phiếu chuyển kho theo mã hoặc ID phiếu.
3. **Xóa mềm phiếu chuyển kho:**
   - Phiếu chuyển kho có thể được đánh dấu là đã xóa nhưng vẫn lưu trữ trong cơ sở dữ liệu để kiểm tra sau này.

## 6. Bảo mật & Kiểm thử

- **Bảo mật:**
  - Chỉ người dùng có vai trò `ADMIN_GLOBAL` hoặc `STORE_MANAGER` mới có quyền truy cập.
  - Sử dụng `JwtAuthGuard`, `RolesGuard`, và `RateLimitGuard` để bảo vệ các endpoint.
- **Kiểm thử:**
  - Viết unit test cho các service và controller.
  - Sử dụng mock database để kiểm tra các trường hợp nghiệp vụ.

## 7. Business Rule

- Mỗi phiếu chuyển kho phải được liên kết với các kho nguồn và đích cụ thể.
- Chỉ người dùng có quyền mới được truy vấn hoặc xóa phiếu chuyển kho.
- Phiếu chuyển kho phải được lưu trữ ít nhất 1 năm trước khi xóa vĩnh viễn.
