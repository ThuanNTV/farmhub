# Module Dashboard (Tổng quan)

Module này cung cấp các API thống kê tổng quan cho dashboard quản trị của từng cửa hàng (tenant), bao gồm doanh thu, đơn hàng, khách hàng, sản phẩm bán chạy.

## 1. Chức năng chính

- **Thống kê tổng quan:** Tổng hợp số liệu doanh thu, số đơn, số khách hàng, top sản phẩm bán chạy.
- **Thống kê doanh thu:** Tổng doanh thu và doanh thu theo ngày.
- **Thống kê đơn hàng:** Tổng số đơn và phân loại theo trạng thái.
- **Thống kê khách hàng:** Tổng số khách hàng, phân tích chi tiêu.
- **Top sản phẩm bán chạy:** Danh sách sản phẩm bán chạy nhất.

## 2. Kiến trúc & Thiết kế

- **Controller (`dashboard.controller.ts`):**
  - Xử lý các request HTTP GET cho các loại thống kê.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`PermissionGuard`).
- **Service (`dashboard.service.ts`):**
  - Tổng hợp dữ liệu từ các service con: OrdersService, CustomersService, ProductsService.
  - Xử lý logic tổng hợp, tính toán số liệu, gom nhóm dữ liệu.
- **Không sử dụng DTO riêng:** Các API trả về dữ liệu động, không cố định schema.

## 3. API Endpoints

Tất cả endpoint đều có tiền tố `/tenant/:storeId/dashboard`.

| Phương thức | Endpoint                 | Mô tả                             |
| ----------- | ------------------------ | --------------------------------- |
| GET         | `/overview`              | Thống kê tổng quan hệ thống       |
| GET         | `/revenue`               | Thống kê doanh thu theo thời gian |
| GET         | `/orders`                | Thống kê đơn hàng                 |
| GET         | `/customers`             | Thống kê khách hàng               |
| GET         | `/best-selling-products` | Top sản phẩm bán chạy             |

## 4. Luồng xử lý chính

- Gọi các service con để lấy dữ liệu gốc (orders, customers, products).
- Tổng hợp, tính toán số liệu và trả về cho dashboard frontend.

## 5. Bảo mật & Kiểm thử

- Áp dụng xác thực JWT, RBAC, kiểm soát quyền trên từng endpoint.
- Đã có unit test cho service.
- Không trả về dữ liệu nhạy cảm.

## 6. Business Rule

- Chỉ trả về dữ liệu của đúng tenant.
- Không cho phép truy vấn vượt quá giới hạn thời gian cho phép.
- Validate kỹ các tham số truy vấn để tránh lỗi logic.
