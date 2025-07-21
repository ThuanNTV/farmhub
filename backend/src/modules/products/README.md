# Products Module

## 📋 Tổng quan

Module quản lý sản phẩm toàn diện cho hệ thống FarmHub, bao gồm các chức năng CRUD cơ bản, tìm kiếm nâng cao, phân tích tồn kho, tích hợp nhà cung cấp và gợi ý sản phẩm.

## 🚀 Chức năng chính

### **Core Features**

- ✅ CRUD sản phẩm (Tạo, Đọc, Cập nhật, Xóa)
- ✅ Quản lý tồn kho và điều chỉnh stock
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Quản lý danh mục và thương hiệu
- ✅ Xử lý hàng loạt (bulk operations)

### **Advanced Features**

- 🔍 **Tìm kiếm nâng cao**: Full-text search với nhiều loại tìm kiếm
- 📊 **Phân tích tồn kho**: Analytics và KPIs chi tiết
- 🤝 **Tích hợp nhà cung cấp**: Quản lý và phân tích hiệu suất
- 💡 **Gợi ý sản phẩm**: AI-powered recommendations
- 📈 **Báo cáo**: Performance, analytics, price trends
- 🔄 **Variants**: Quản lý biến thể sản phẩm
- 🎯 **SEO**: Tối ưu hóa SEO cho sản phẩm

## 🏗️ Kiến trúc

### **Controllers**

- `ProductsController` - API chính cho sản phẩm
- `ProductVariantsController` - Quản lý biến thể
- `ProductSeoController` - Tối ưu SEO

### **Services**

- `ProductsService` - Logic nghiệp vụ chính
- `AdvancedSearchService` - Tìm kiếm nâng cao
- `InventoryAnalyticsService` - Phân tích tồn kho
- `SupplierIntegrationService` - Tích hợp nhà cung cấp
- `SupplierIntegrationExtendedService` - Tích hợp mở rộng
- `ProductRecommendationsService` - Gợi ý sản phẩm
- `ProductVariantsService` - Quản lý biến thể
- `ProductSeoService` - SEO service
- `InventoryTransactionService` - Giao dịch tồn kho

### **DTOs**

#### Core DTOs

- `CreateProductDto` - Tạo sản phẩm
- `UpdateProductDto` - Cập nhật sản phẩm
- `ProductResponseDto` - Response sản phẩm
- `ProductSearchDto` - Tìm kiếm sản phẩm
- `ProductFilterDto` - Lọc sản phẩm
- `ProductPaginationDto` - Phân trang

#### Advanced DTOs

- `AdvancedSearchDto` - Tìm kiếm nâng cao
- `AdvancedSearchResponseDto` - Response tìm kiếm nâng cao
- `BulkUpdateRequestDto` - Cập nhật hàng loạt
- `BulkDeleteRequestDto` - Xóa hàng loạt
- `BulkStockAdjustmentDto` - Điều chỉnh stock hàng loạt
- `InventoryAnalyticsFilterDto` - Lọc phân tích tồn kho
- `ProductRecommendationDto` - Gợi ý sản phẩm

### **Entity**

- `Product` - Entity chính cho sản phẩm

## 🌐 API Endpoints

### **Base URL**: `/tenant/{storeId}/products`

### **Core CRUD**

- `POST /` - Tạo sản phẩm mới
- `GET /` - Lấy danh sách sản phẩm
- `GET /:id` - Lấy chi tiết sản phẩm
- `PATCH /:id` - Cập nhật sản phẩm
- `DELETE /:id` - Xóa sản phẩm
- `PATCH /:id/restore` - Khôi phục sản phẩm

### **Search & Filter**

- `GET /search` - Tìm kiếm sản phẩm
- `POST /filter` - Lọc sản phẩm nâng cao
- `POST /search/advanced` - Tìm kiếm nâng cao
- `GET /search/suggestions` - Gợi ý tìm kiếm

### **Inventory Management**

- `GET /low-stock` - Sản phẩm sắp hết hàng
- `GET /stats` - Thống kê sản phẩm
- `PATCH /:id/stock` - Cập nhật tồn kho
- `POST /bulk-stock-adjustment` - Điều chỉnh stock hàng loạt

### **Category & Brand**

- `GET /barcode/:barcode` - Tìm theo barcode
- `GET /category/:categoryId` - Lấy theo danh mục

### **Bulk Operations**

- `POST /bulk-update` - Cập nhật hàng loạt
- `POST /bulk-delete` - Xóa hàng loạt

### **Analytics & Reports**

- `GET /reports/performance` - Báo cáo hiệu suất
- `GET /reports/analytics` - Báo cáo phân tích
- `GET /reports/inventory-analysis` - Phân tích tồn kho
- `GET /reports/price-trends` - Xu hướng giá
- `POST /reports/export` - Xuất báo cáo

### **Inventory Analytics**

- `POST /analytics/inventory` - Phân tích tồn kho
- `GET /analytics/inventory/overview` - Tổng quan tồn kho
- `GET /analytics/inventory/turnover` - Luân chuyển tồn kho
- `GET /analytics/inventory/movement` - Chuyển động tồn kho
- `GET /analytics/inventory/kpis` - KPIs tồn kho

### **Supplier Integration**

- `GET /suppliers/:supplierId/products` - Sản phẩm theo NCC
- `GET /suppliers/performance` - Hiệu suất NCC
- `GET /suppliers/analytics` - Phân tích NCC
- `POST /suppliers/assign` - Gán NCC
- `POST /suppliers/unassign` - Hủy gán NCC
- `GET /products/without-supplier` - Sản phẩm chưa có NCC
- `GET /suppliers/summary` - Tóm tắt NCC

### **Product Recommendations**

- `GET /recommendations/:productId` - Gợi ý liên quan
- `POST /recommendations/bulk` - Gợi ý hàng loạt
- `GET /recommendations/:productId/similar` - Sản phẩm tương tự
- `GET /recommendations/:productId/category` - Cùng danh mục
- `GET /recommendations/:productId/brand` - Cùng thương hiệu
- `GET /recommendations/:productId/price-range` - Cùng tầm giá

### **Price History**

- `GET /:id/price-history` - Lịch sử giá

## 📊 Database Schema

### **Product Entity**

```typescript
{
  product_id: string (PK)
  product_code: string (unique)
  name: string
  slug: string
  description: string
  category_id: string (FK)
  brand?: string
  unit_id?: string
  price_retail: number
  price_wholesale?: number
  credit_price?: number
  cost_price?: number
  barcode?: string
  stock: number
  min_stock_level: number
  images?: string (JSON)
  specs?: string (JSON)
  warranty_info?: string
  supplier_id?: string
  is_active: boolean
  is_deleted: boolean
  created_at: Date
  updated_at: Date
  created_by_user_id?: string
  updated_by_user_id?: string
}
```

### **Relationships**

- `Product` → `Category` (Many-to-One)
- `Product` → `Unit` (Many-to-One)
- `Product` → `Supplier` (Many-to-One)

## 🔐 Security & Permissions

### **Authentication**

- JWT-based authentication
- `EnhancedAuthGuard` cho tất cả endpoints
- `PermissionGuard` cho kiểm soát quyền truy cập

### **Permissions**

- `@RequireProductPermission('create')` - Tạo sản phẩm
- `@RequireProductPermission('read')` - Xem sản phẩm
- `@RequireProductPermission('update')` - Cập nhật sản phẩm
- `@RequireProductPermission('delete')` - Xóa sản phẩm
- `@RequireProductPermission('list')` - Danh sách sản phẩm

### **Rate Limiting**

- `@RateLimitAPI()` áp dụng cho tất cả endpoints
- Bảo vệ khỏi spam và abuse

### **Audit Logging**

- `AuditInterceptor` ghi lại tất cả thao tác
- Theo dõi ai làm gì, khi nào

## 🧪 Testing

### **Unit Tests**

- `ProductsService` - Logic nghiệp vụ
- `AdvancedSearchService` - Tìm kiếm nâng cao
- `InventoryAnalyticsService` - Phân tích tồn kho

### **Integration Tests**

- API endpoints testing
- Database integration
- Authentication & authorization

### **E2E Tests**

- Complete user workflows
- Cross-module integration

## 📈 Performance

### **Caching**

- Redis caching cho dữ liệu thường xuyên truy cập
- Cache invalidation strategies

### **Database Optimization**

- Indexes trên các trường tìm kiếm
- Query optimization
- Connection pooling

### **Search Optimization**

- Full-text search indexes
- Search result caching
- Faceted search optimization

## 🔄 Dependencies

### **Internal Modules**

- `CategoriesModule` - Quản lý danh mục
- `SuppliersModule` - Quản lý nhà cung cấp
- `PriceHistoriesModule` - Lịch sử giá
- `ReportModule` - Báo cáo
- `AuditLogsModule` - Audit logging

### **External Libraries**

- `TypeORM` - Database ORM
- `class-validator` - Validation
- `class-transformer` - Data transformation
- `@nestjs/swagger` - API documentation

## 🚀 Deployment

### **Environment Variables**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=farmhub
DB_PASSWORD=password
DB_DATABASE=farmhub
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Docker Support**

- Dockerfile included
- Docker Compose for development
- Production-ready containers

## 📚 Documentation

- Swagger/OpenAPI documentation tự động
- Postman collection
- API examples và use cases

## 🔮 Future Enhancements

- [ ] AI-powered demand forecasting
- [ ] Advanced inventory optimization
- [ ] Multi-warehouse support
- [ ] Real-time inventory tracking
- [ ] Mobile app integration
- [ ] Barcode scanning integration
