# 📁 SCRIPTS DIRECTORY - FARMHUB BACKEND

Thư mục này chứa tất cả các script tiện ích để quản lý, kiểm tra và tối ưu hóa hệ thống FarmHub.

## 🗂️ **DANH SÁCH SCRIPTS**

### 🔧 **Database & Connection Scripts**

#### 1. **check-database-connection.ts**
- **Mục đích**: Kiểm tra kết nối database của tất cả services
- **Chức năng**: 
  - Quét tất cả service files trong `src/service/`
  - Kiểm tra xem service có extends `TenantBaseService` không
  - Kiểm tra có sử dụng `TenantDataSourceService` không
  - Phát hiện mock data và hardcoded responses
- **Chạy**: `npx ts-node scripts/check-database-connection.ts`

#### 2. **check-users.ts**
- **Mục đích**: Kiểm tra danh sách users trong database
- **Chức năng**:
  - Kết nối database và lấy tất cả users
  - Hiển thị thông tin: ID, username, email, role, trạng thái
  - Kiểm tra có user nào không
- **Chạy**: `npx ts-node scripts/check-users.ts`

#### 3. **create-test-user.ts**
- **Mục đích**: Tạo user test (admin) trong database
- **Chức năng**:
  - Tạo user admin với credentials: admin/admin123
  - Hash password với bcrypt
  - Kiểm tra user đã tồn tại chưa
- **Chạy**: `npx ts-node scripts/create-test-user.ts`

#### 4. **create-user-example.ts**
- **Mục đích**: Tạo user mẫu với các role khác nhau
- **Chức năng**: Tạo nhiều user với các role khác nhau để test

### 🔐 **Authentication & Security Scripts**

#### 5. **decode-jwt.ts**
- **Mục đích**: Decode và verify JWT token
- **Chức năng**:
  - Decode JWT token không cần secret
  - Verify token với secret
  - Kiểm tra thời gian hết hạn
  - Hiển thị payload và timing
- **Chạy**: `npx ts-node scripts/decode-jwt.ts`

#### 6. **verify-password.ts**
- **Mục đích**: Kiểm tra password hash và bcrypt
- **Chức năng**:
  - Lấy user admin từ database
  - So sánh password với hash
  - Tạo hash mới để test
  - Verify bcrypt functionality
- **Chạy**: `npx ts-node scripts/verify-password.ts`

### 🚀 **Redis & Cache Scripts**

#### 7. **test-redis-connection.ts**
- **Mục đích**: Test kết nối Redis Cloud
- **Chức năng**:
  - Kết nối Redis Cloud với credentials
  - Test basic operations (set, get, TTL)
  - Test pattern matching
  - Lấy Redis statistics
  - Cleanup test keys
- **Chạy**: `npx ts-node scripts/test-redis-connection.ts`

#### 8. **test-redis-simple.ts**
- **Mục đích**: Test Redis cache service đơn giản
- **Chức năng**:
  - Test RedisCacheService không cần NestJS
  - Test basic cache operations
  - Test withCache helper
- **Chạy**: `npx ts-node scripts/test-redis-simple.ts`

#### 9. **test-nestjs-redis.ts**
- **Mục đích**: Test Redis với NestJS application
- **Chức năng**:
  - Tạo NestJS application context
  - Inject RedisCacheService
  - Test cache operations trong NestJS
- **Chạy**: `npx ts-node scripts/test-nestjs-redis.ts`

### ⚡ **Performance & Testing Scripts**

#### 10. **test-performance.ts**
- **Mục đích**: Test hiệu năng toàn diện hệ thống
- **Chức năng**:
  - Test database queries (simple, complex joins, aggregation)
  - Test caching performance (hit, miss, invalidation)
  - Test partition queries
  - Test concurrent operations
  - Generate performance report
- **Chạy**: `npx ts-node scripts/test-performance.ts`

#### 11. **test-atomic-simple.ts**
- **Mục đích**: Test atomic transactions đơn giản
- **Chức năng**: Test ACID compliance với TypeORM

#### 12. **test-atomic-order.ts**
- **Mục đích**: Test atomic transactions cho orders
- **Chức năng**: Test order creation với inventory updates

#### 13. **test-atomic-demo.ts**
- **Mục đích**: Demo atomic transactions
- **Chức năng**: Demo rollback và commit scenarios

### 🗄️ **Database Optimization Scripts**

#### 14. **partition_and_index.sql**
- **Mục đích**: Tạo partition và index cho PostgreSQL
- **Chức năng**:
  - Tạo partition tables cho audit_log, order, inventory_log
  - Tạo indexes cho performance
  - Tạo views cho monitoring
  - Tạo functions cho maintenance
- **Chạy**: `psql -h localhost -U postgres -d farmhub -f scripts/partition_and_index.sql`

### 🔄 **Code Generation & Conversion Scripts**

#### 15. **convert-dto-fields.ts**
- **Mục đích**: Convert DTO fields format
- **Chức năng**: Chuyển đổi format fields trong DTO files

#### 16. **convert-entity-fields.ts**
- **Mục đích**: Convert entity fields format
- **Chức năng**: Chuyển đổi format fields trong entity files

#### 17. **convert-entity-fields-v2.ts**
- **Mục đích**: Convert entity fields format (version 2)
- **Chức năng**: Cải tiến version 1

#### 18. **convert-entity-fields-v3.ts**
- **Mục đích**: Convert entity fields format (version 3)
- **Chức năng**: Cải tiến version 2

#### 19. **create-migrations.ts**
- **Mục đích**: Tạo database migrations
- **Chức năng**: Generate TypeORM migrations

### 🛠️ **Development & Maintenance Scripts**

#### 20. **sync-checker.ts**
- **Mục đích**: Kiểm tra synchronization
- **Chức năng**: Kiểm tra đồng bộ giữa các components

#### 21. **fix-typescript-errors.ts**
- **Mục đích**: Fix TypeScript errors
- **Chức năng**: Tự động sửa lỗi TypeScript

#### 22. **optimize-checklist.ts**
- **Mục đích**: Tạo checklist tối ưu hóa
- **Chức năng**: Generate optimization checklists

#### 23. **generate-entity-checklists.ts**
- **Mục đích**: Tạo checklist cho entities
- **Chức năng**: Generate entity-specific checklists

#### 24. **generate-tests.js**
- **Mục đích**: Generate test files
- **Chức năng**: Tạo test files tự động

## 🚀 **CÁCH SỬ DỤNG**

### **1. Setup Environment**
```bash
# Cài đặt dependencies
npm install

# Copy environment file
cp env.example .env

# Cấu hình database và Redis trong .env
```

### **2. Database Setup**
```bash
# Tạo test user
npx ts-node scripts/create-test-user.ts

# Kiểm tra users
npx ts-node scripts/check-users.ts

# Chạy partition script
psql -h localhost -U postgres -d farmhub -f scripts/partition_and_index.sql
```

### **3. Redis Testing**
```bash
# Test Redis connection
npx ts-node scripts/test-redis-connection.ts

# Test Redis với NestJS
npx ts-node scripts/test-nestjs-redis.ts
```

### **4. Performance Testing**
```bash
# Test performance toàn diện
npx ts-node scripts/test-performance.ts

# Test atomic transactions
npx ts-node scripts/test-atomic-demo.ts
```

### **5. Security Testing**
```bash
# Decode JWT token
npx ts-node scripts/decode-jwt.ts

# Verify password
npx ts-node scripts/verify-password.ts
```

### **6. Code Quality**
```bash
# Kiểm tra database connections
npx ts-node scripts/check-database-connection.ts

# Fix TypeScript errors
npx ts-node scripts/fix-typescript-errors.ts
```

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
- Database connection: `check-database-connection.ts`
- Redis connection: `test-redis-connection.ts`
- User verification: `check-users.ts`

### **Performance Monitoring**
- Performance testing: `test-performance.ts`
- Cache statistics: Built into Redis scripts
- Database partitions: `partition_and_index.sql`

### **Security Verification**
- JWT validation: `decode-jwt.ts`
- Password verification: `verify-password.ts`
- User authentication: `create-test-user.ts`

## 🔧 **TROUBLESHOOTING**

### **Database Issues**
```bash
# Kiểm tra connection
npx ts-node scripts/check-database-connection.ts

# Tạo test user
npx ts-node scripts/create-test-user.ts

# Verify password
npx ts-node scripts/verify-password.ts
```

### **Redis Issues**
```bash
# Test Redis connection
npx ts-node scripts/test-redis-connection.ts

# Test với NestJS
npx ts-node scripts/test-nestjs-redis.ts
```

### **Performance Issues**
```bash
# Run performance tests
npx ts-node scripts/test-performance.ts

# Check partitions
psql -h localhost -U postgres -d farmhub -c "\dt audit_log*"
```

## 📝 **NOTES**

- Tất cả scripts đều có error handling và logging
- Scripts sử dụng TypeScript với ts-node
- Database scripts sử dụng TypeORM
- Redis scripts sử dụng ioredis
- Performance scripts có detailed reporting
- Security scripts có proper validation

## 🎯 **BEST PRACTICES**

1. **Luôn chạy health checks trước khi deploy**
2. **Test performance định kỳ**
3. **Verify security settings**
4. **Monitor database partitions**
5. **Check Redis cache hit rates**
6. **Validate JWT tokens**
7. **Test atomic transactions**
8. **Maintain code quality**

---

**📞 Support**: Nếu có vấn đề, kiểm tra logs và chạy các script diagnostic tương ứng. 