# Module Dashboard Analytics

Module này cung cấp các API phân tích dữ liệu tổng hợp cho dashboard quản trị của từng cửa hàng (tenant), bao gồm heatmap, biểu đồ tổng hợp, phân tích ngành nghề, xu hướng bán hàng.

## 1. Chức năng chính

- **Heatmap:** Thống kê số lượng đơn hàng theo giờ và ngày trong tuần.
- **Biểu đồ tổng hợp:** Tổng hợp số liệu theo nhiều loại (doanh thu, số đơn, v.v.).
- **Phân tích ngành nghề:** Thống kê theo ngành nghề khách hàng hoặc sản phẩm.
- **Phân tích xu hướng:** Theo dõi xu hướng đơn hàng, doanh thu, giá trị trung bình theo thời gian.

## 2. Kiến trúc & Thiết kế

- **Controller (`dashboard-analytics.controller.ts`):**
  - Xử lý các request HTTP GET cho các loại phân tích.
  - Áp dụng xác thực (`EnhancedAuthGuard`), phân quyền (`PermissionGuard`).
- **Service (`dashboard-analytics.service.ts`):**
  - Truy vấn dữ liệu tổng hợp từ database tenant qua các truy vấn SQL động.
  - Validate tham số đầu vào (ngày, loại biểu đồ).
  - Trả về dữ liệu đã xử lý phù hợp cho dashboard frontend.
- **Không sử dụng DTO riêng:** Các API trả về dữ liệu động, không cố định schema.

## 3. API Endpoints

Tất cả endpoint đều có tiền tố `/tenant/:storeId/dashboard-analytics`.

| Phương thức | Endpoint    | Mô tả                        |
| ----------- | ----------- | ---------------------------- |
| GET         | `/heatmap`  | Lấy dữ liệu heatmap đơn hàng |
| GET         | `/chart`    | Lấy dữ liệu biểu đồ tổng hợp |
| GET         | `/industry` | Phân tích theo ngành nghề    |
| GET         | `/trend`    | Phân tích xu hướng           |

## 4. Luồng xử lý chính

- Validate tham số đầu vào (ngày, loại biểu đồ).
- Truy vấn dữ liệu tổng hợp từ các bảng đơn hàng, khách hàng, sản phẩm...
- Trả về dữ liệu đã xử lý cho dashboard frontend.

## 5. Bảo mật & Kiểm thử

- Áp dụng xác thực JWT, RBAC, kiểm soát quyền trên từng endpoint.
- Đã có unit test cho service.
- Không trả về dữ liệu nhạy cảm.

## 6. Business Rule

- Chỉ trả về dữ liệu của đúng tenant.
- Không cho phép truy vấn vượt quá giới hạn thời gian cho phép.
- Validate kỹ các tham số truy vấn để tránh SQL injection.
