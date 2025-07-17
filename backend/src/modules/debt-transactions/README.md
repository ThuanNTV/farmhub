# Debt Transactions Module

## Chức năng chính

- Quản lý các giao dịch nợ của cửa hàng.
- Hỗ trợ tạo, cập nhật, xóa và truy vấn giao dịch nợ.

## Kiến trúc

- **Controller:** `DebtTransactionsController` xử lý các yêu cầu API.
- **Service:** `DebtTransactionsService` chứa logic nghiệp vụ.
- **DTOs:**
  - `CreateDebtTransactionDto`: Dữ liệu đầu vào để tạo giao dịch nợ.
  - `UpdateDebtTransactionDto`: Dữ liệu đầu vào để cập nhật giao dịch nợ.

## API Endpoints

- **POST** `/tenant/:storeId/debt-transactions`
  - Tạo giao dịch nợ mới.
  - Yêu cầu quyền: `ADMIN_GLOBAL`, `STORE_MANAGER`, `STORE_STAFF`.
- **GET** `/tenant/:storeId/debt-transactions`
  - Lấy danh sách giao dịch nợ.
- **PATCH** `/tenant/:storeId/debt-transactions/:id`
  - Cập nhật giao dịch nợ.
- **DELETE** `/tenant/:storeId/debt-transactions/:id`
  - Xóa giao dịch nợ.

## Bảo mật

- Sử dụng `EnhancedAuthGuard` để bảo vệ các endpoint.
- Chỉ người dùng có vai trò phù hợp mới được truy cập.

## Testing

- Đảm bảo các endpoint được kiểm tra với các trường hợp hợp lệ và không hợp lệ.
- Sử dụng mock service để kiểm tra logic nghiệp vụ.
