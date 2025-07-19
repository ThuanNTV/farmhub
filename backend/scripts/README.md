# 📁 SCRIPTS DIRECTORY - FARMHUB BACKEND

Thư mục này chứa tất cả các script tiện ích để quản lý, kiểm tra và tối ưu hóa hệ thống FarmHub.

## 🗂️ **CẤU TRÚC THƯ MỤC**

```
scripts/
├── 📁 database/          # Scripts liên quan đến database
├── 📁 auth/             # Scripts xác thực và bảo mật
├── 📁 performance/      # Scripts kiểm tra hiệu năng
├── 📁 maintenance/      # Scripts bảo trì và kiểm tra sức khỏe
├── 📁 utils/           # Scripts tiện ích và chuyển đổi
└── 📄 README.md        # Tài liệu hướng dẫn
```

## 🗂️ **DANH SÁCH SCRIPTS**

### 🗄️ **Database Scripts** (`database/`)

#### 1. **check-database-connection.ts**
- **Mục đích**: Kiểm tra kết nối database của tất cả services
- **Chức năng**:
  - Quét tất cả service files trong `src/service/`
  - Kiểm tra xem service có extends `TenantBaseService` không
  - Kiểm tra có sử dụng `TenantDataSourceService` không
  - Phát hiện mock data và hardcoded responses
- **Chạy**: `npx ts-node scripts/database/check-database-connection.ts`

#### 2. **check-users.ts**
- **Mục đích**: Kiểm tra danh sách users trong database
- **Chức năng**:
  - Kết nối database và lấy tất cả users
  - Hiển thị thông tin: ID, username, email, role, trạng thái
  - Kiểm tra có user nào không
- **Chạy**: `npx ts-node scripts/database/check-users.ts`

#### 3. **create-test-user.ts**
- **Mục đích**: Tạo user test (admin) trong database
- **Chức năng**:
  - Tạo user admin với credentials: admin/admin123
  - Hash password với bcrypt
  - Kiểm tra user đã tồn tại chưa
- **Chạy**: `npx ts-node scripts/database/create-test-user.ts`

#### 4. **create-user-example.ts**
- **Mục đích**: Tạo user mẫu với các role khác nhau
- **Chức năng**: Tạo nhiều user với các role khác nhau để test
- **Chạy**: `npx ts-node scripts/database/create-user-example.ts`

#### 5. **create-migrations.ts**
- **Mục đích**: Tạo database migrations
- **Chức năng**: Generate TypeORM migrations
- **Chạy**: `npx ts-node scripts/database/create-migrations.ts`

#### 6. **partition_and_index.sql**
- **Mục đích**: Tạo partition và index cho PostgreSQL
- **Chức năng**:
  - Tạo partition tables cho audit_log, order, inventory_log
  - Tạo indexes cho performance
  - Tạo views cho monitoring
  - Tạo functions cho maintenance
- **Chạy**: `psql -h localhost -U postgres -d farmhub -f scripts/database/partition_and_index.sql`

### 🔐 **Authentication & Security Scripts** (`auth/`)

#### 7. **decode-jwt.ts**
- **Mục đích**: Decode và verify JWT token
- **Chức năng**:
  - Decode JWT token không cần secret
  - Verify token với secret
  - Kiểm tra thời gian hết hạn
  - Hiển thị payload và timing
- **Chạy**: `npx ts-node scripts/auth/decode-jwt.ts`

#### 8. **verify-password.ts**
- **Mục đích**: Kiểm tra password hash và bcrypt
- **Chức năng**:
  - Lấy user admin từ database
  - So sánh password với hash
  - Tạo hash mới để test
  - Verify bcrypt functionality
- **Chạy**: `npx ts-node scripts/auth/verify-password.ts`

### ⚡ **Performance Scripts** (`performance/`)

#### 9. **test-atomic-demo.ts**
- **Mục đích**: Demo atomic transactions
- **Chức năng**:
  - Demo rollback và commit scenarios
  - Test ACID compliance với TypeORM
  - Test concurrent order processing
  - Simulate inventory management
- **Chạy**: `npx ts-node scripts/performance/test-atomic-demo.ts`

### 🛠️ **Maintenance Scripts** (`maintenance/`)

#### 10. **cleanup-modules.ps1**
- **Mục đích**: Dọn dẹp các module trùng lặp
- **Chức năng**: Xóa các thư mục service trống và module không sử dụng
- **Chạy**: `powershell scripts/maintenance/cleanup-modules.ps1`

#### 11. **check-modules-health.ps1**
- **Mục đích**: Kiểm tra sức khỏe các modules
- **Chức năng**: Kiểm tra cấu trúc và tính toàn vẹn của modules
- **Chạy**: `powershell scripts/maintenance/check-modules-health.ps1`

#### 12. **project-health-check.ps1**
- **Mục đích**: Kiểm tra sức khỏe tổng thể project
- **Chức năng**:
  - Kiểm tra modules, entities, DTOs
  - Tính toán health score
  - Báo cáo tình trạng project
- **Chạy**: `powershell scripts/maintenance/project-health-check.ps1`

#### 13. **fix-typescript-errors.ts**
- **Mục đích**: Fix TypeScript errors
- **Chức năng**: Tự động sửa lỗi TypeScript
- **Chạy**: `npx ts-node scripts/maintenance/fix-typescript-errors.ts`

#### 14. **sync-checker.ts**
- **Mục đích**: Kiểm tra synchronization
- **Chức năng**: Kiểm tra đồng bộ giữa các components
- **Chạy**: `npx ts-node scripts/maintenance/sync-checker.ts`

### � **Utility Scripts** (`utils/`)

#### 15. **convert-dto-fields.ts**
- **Mục đích**: Convert DTO fields format
- **Chức năng**: Chuyển đổi format fields trong DTO files
- **Chạy**: `npx ts-node scripts/utils/convert-dto-fields.ts`

#### 16. **convert-entity-fields-v3.ts**
- **Mục đích**: Convert entity fields format (latest version)
- **Chức năng**: Chuyển đổi format fields trong entity files
- **Chạy**: `npx ts-node scripts/utils/convert-entity-fields-v3.ts`

#### 17. **convert-openapi-to-yaml.js**
- **Mục đích**: Convert OpenAPI spec to YAML
- **Chức năng**: Chuyển đổi OpenAPI specification sang YAML format
- **Chạy**: `node scripts/utils/convert-openapi-to-yaml.js`

#### 18. **generate-entity-checklists.ts**
- **Mục đích**: Tạo checklist cho entities
- **Chức năng**: Generate entity-specific checklists
- **Chạy**: `npx ts-node scripts/utils/generate-entity-checklists.ts`

#### 19. **generate-tests.js**
- **Mục đích**: Generate test files
- **Chức năng**: Tạo test files tự động
- **Chạy**: `node scripts/utils/generate-tests.js`

#### 20. **optimize-checklist.ts**
- **Mục đích**: Tạo checklist tối ưu hóa
- **Chức năng**: Generate optimization checklists
- **Chạy**: `npx ts-node scripts/utils/optimize-checklist.ts`

#### 21. **auto-module.ps1**
- **Mục đích**: Tự động tạo module structure
- **Chức năng**: Generate module boilerplate code
- **Chạy**: `powershell scripts/utils/auto-module.ps1`

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
npx ts-node scripts/database/create-test-user.ts

# Kiểm tra users
npx ts-node scripts/database/check-users.ts

# Chạy partition script
psql -h localhost -U postgres -d farmhub -f scripts/database/partition_and_index.sql
```

### **3. Authentication Testing**
```bash
# Decode JWT token
npx ts-node scripts/auth/decode-jwt.ts

# Verify password
npx ts-node scripts/auth/verify-password.ts
```

### **4. Performance Testing**
```bash
# Test atomic transactions
npx ts-node scripts/performance/test-atomic-demo.ts
```

### **5. Maintenance & Health Checks**
```bash
# Kiểm tra database connections
npx ts-node scripts/database/check-database-connection.ts

# Kiểm tra sức khỏe project
powershell scripts/maintenance/project-health-check.ps1

# Fix TypeScript errors
npx ts-node scripts/maintenance/fix-typescript-errors.ts

# Dọn dẹp modules
powershell scripts/maintenance/cleanup-modules.ps1
```

### **6. Utilities**
```bash
# Convert entity fields
npx ts-node scripts/utils/convert-entity-fields-v3.ts

# Generate tests
node scripts/utils/generate-tests.js

# Convert OpenAPI to YAML
node scripts/utils/convert-openapi-to-yaml.js
```

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**
- Database connection: `scripts/database/check-database-connection.ts`
- User verification: `scripts/database/check-users.ts`
- Project health: `scripts/maintenance/project-health-check.ps1`
- Module health: `scripts/maintenance/check-modules-health.ps1`

### **Performance Monitoring**
- Atomic transactions: `scripts/performance/test-atomic-demo.ts`
- Database partitions: `scripts/database/partition_and_index.sql`

### **Security Verification**
- JWT validation: `scripts/auth/decode-jwt.ts`
- Password verification: `scripts/auth/verify-password.ts`
- User authentication: `scripts/database/create-test-user.ts`

## 🔧 **TROUBLESHOOTING**

### **Database Issues**
```bash
# Kiểm tra connection
npx ts-node scripts/database/check-database-connection.ts

# Tạo test user
npx ts-node scripts/database/create-test-user.ts

# Verify password
npx ts-node scripts/auth/verify-password.ts
```

### **Performance Issues**
```bash
# Run atomic transaction tests
npx ts-node scripts/performance/test-atomic-demo.ts

# Check partitions
psql -h localhost -U postgres -d farmhub -c "\dt audit_log*"
```

### **Code Quality Issues**
```bash
# Fix TypeScript errors
npx ts-node scripts/maintenance/fix-typescript-errors.ts

# Check synchronization
npx ts-node scripts/maintenance/sync-checker.ts

# Project health check
powershell scripts/maintenance/project-health-check.ps1
```

## 📝 **NOTES**

- Tất cả scripts đều có error handling và logging
- Scripts sử dụng TypeScript với ts-node
- Database scripts sử dụng TypeORM
- Performance scripts có detailed reporting
- Security scripts có proper validation
- Scripts được tổ chức theo chức năng trong các thư mục con

## 🎯 **BEST PRACTICES**

1. **Luôn chạy health checks trước khi deploy**
   ```bash
   powershell scripts/maintenance/project-health-check.ps1
   npx ts-node scripts/database/check-database-connection.ts
   ```

2. **Test performance định kỳ**
   ```bash
   npx ts-node scripts/performance/test-atomic-demo.ts
   ```

3. **Verify security settings**
   ```bash
   npx ts-node scripts/auth/decode-jwt.ts
   npx ts-node scripts/auth/verify-password.ts
   ```

4. **Monitor database partitions**
   ```bash
   psql -h localhost -U postgres -d farmhub -f scripts/database/partition_and_index.sql
   ```

5. **Maintain code quality**
   ```bash
   npx ts-node scripts/maintenance/fix-typescript-errors.ts
   npx ts-node scripts/maintenance/sync-checker.ts
   ```

6. **Use utilities for code conversion**
   ```bash
   npx ts-node scripts/utils/convert-entity-fields-v3.ts
   node scripts/utils/generate-tests.js
   ```

## 🗂️ **SCRIPT ORGANIZATION**

Scripts được tổ chức theo chức năng:
- **database/**: Tất cả scripts liên quan đến database và user management
- **auth/**: Scripts xác thực, JWT, và bảo mật
- **performance/**: Scripts test hiệu năng và atomic transactions
- **maintenance/**: Scripts bảo trì, health check, và cleanup
- **utils/**: Scripts tiện ích, conversion, và code generation

---

**📞 Support**: Nếu có vấn đề, kiểm tra logs và chạy các script diagnostic tương ứng trong thư mục phù hợp.