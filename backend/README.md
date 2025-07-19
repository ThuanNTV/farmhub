<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

# 🚀 FARMHUB - NESTJS BACKEND

## 1. Giới thiệu tổng quan

FarmHub là hệ thống quản lý nông nghiệp toàn diện, xây dựng trên [NestJS](https://nestjs.com/) với TypeScript. Hệ thống hỗ trợ quản lý đa cửa hàng, đơn hàng, sản phẩm, khách hàng, thanh toán, báo cáo, tối ưu hiệu năng, bảo mật, audit log, và nhiều tính năng mở rộng khác.

- **Đối tượng sử dụng:** Doanh nghiệp nông nghiệp, chuỗi cửa hàng, nhà quản lý, nhân viên bán hàng, kế toán, quản trị hệ thống.
- **Mục tiêu:** Tối ưu vận hành, minh bạch dữ liệu, mở rộng linh hoạt, dễ tích hợp.

## 2. Tính năng chính

- Quản lý đơn hàng, sản phẩm, khách hàng, nhà cung cấp, kho, giao nhận, thanh toán, khuyến mãi, báo cáo.
- Hệ thống phân quyền đa cấp (multi-tenant, RBAC).
- Audit log, user activity log, external system log.
- Tối ưu hiệu năng: Redis cache, partitioning, indexing, query tuning.
- Hỗ trợ backup, DR, kiểm thử, CI/CD, DevOps.
- Hệ thống API chuẩn RESTful, tài liệu OpenAPI.
- Hỗ trợ mở rộng module, tích hợp hệ thống ngoài.

## 3. Kiến trúc hệ thống

- **Backend:** NestJS, TypeScript, PostgreSQL, Redis, TypeORM.
- **Kiến trúc module hóa:** src/modules (mỗi module 1 domain nghiệp vụ).
- **Tiện ích chung:** src/common (auth, guard, cache, audit, queue, helper, decorator, types...).
- **Tầng service/controller/dto/entity tách biệt rõ ràng.**
- **Tài liệu chi tiết:** [docs/03_architecture.md](./docs/03_architecture.md)

## 4. Cấu trúc thư mục

```
src/
  modules/         # Các module nghiệp vụ (orders, products, payments, ...)
  common/          # Tiện ích chung (auth, guard, cache, audit, ...)
  controllers/     # Controller dùng chung
  service/         # Service dùng chung
  dto/             # Định nghĩa DTO
  entities/        # Định nghĩa entity
  config/          # Cấu hình hệ thống
  utils/           # Tiện ích, helper
  middleware/      # Middleware
  migration/       # Migration DB
docs/              # Tài liệu dự án
scripts/           # Script hỗ trợ (health check, seed, migration, ...)
test/              # Test (unit, e2e, integration)
.env.example       # Mẫu cấu hình môi trường
```

## 5. Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

## 6. Cài đặt & cấu hình

```bash
# Clone project
git clone <repo-url>
cd backend

# Cài đặt package
npm install

# Cài thêm Redis cache dependencies
npm install cache-manager ioredis cache-manager-ioredis

# Tạo file .env từ mẫu
cp env.example .env
# Chỉnh sửa thông tin DB, Redis, JWT trong .env
```

## 7. Hướng dẫn chạy

```bash
# Chạy dev
npm run start:dev

# Chạy production
npm run start:prod

# Chạy với PM2 (production)
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 monit
```

## 8. Hướng dẫn test

```bash
# Unit test
npm run test

# E2E test
npm run test:e2e

# Coverage
npm run test:cov

# Performance test
npm run test:performance
```

## 9. Database & Migration

```bash
# Tạo partition, index cho DB
psql -h localhost -U postgres -d farmhub -f scripts/partition_and_index.sql

# Kiểm tra partition
psql -h localhost -U postgres -d farmhub -c "\dt audit_log*"
```
- Hướng dẫn chi tiết: [docs/13_deployment_guide.md](./docs/13_deployment_guide.md), [docs/07_database_architecture_refactor.md](./docs/07_database_architecture_refactor.md)

## 10. Tối ưu hiệu năng

- Redis caching: cache sản phẩm, config, báo cáo.
- Partitioning: chia nhỏ bảng lớn theo tháng.
- Indexing, query tuning: tối ưu truy vấn.
- Transaction: đảm bảo ACID cho nghiệp vụ quan trọng.
- Xem thêm: [docs/12_performance_optimization.md](./docs/12_performance_optimization.md)

## 11. Module & API chính

- **products:** Quản lý sản phẩm (CRUD, soft delete, restore, phân quyền).
- **orders:** Quản lý đơn hàng, trạng thái, thanh toán, giao nhận.
- **customers:** Quản lý khách hàng, lịch sử mua hàng.
- **payments:** Quản lý thanh toán, phương thức, đối soát.
- **audit-logs:** Ghi nhận hoạt động hệ thống.
- **user-activity-log:** Theo dõi thao tác người dùng.
- **external-system-logs:** Ghi nhận log tích hợp hệ thống ngoài.
- **...** (xem chi tiết từng module trong `src/modules/` và tài liệu [docs/checklist/](./docs/checklist/))

## 12. Tiện ích chung (common)

- **Auth & Guard:** JWT, Local, EnhancedAuthGuard, PermissionGuard, RateLimitGuard.
- **Cache:** RedisCacheService, CacheDecorator.
- **Audit:** AuditLogAsyncService, AuditInterceptor.
- **Queue:** AuditLogQueueService, processor.
- **Helper:** DtoMapperHelper.
- **Decorator:** RateLimitDecorator.
- **Interceptor:** AllExceptionsFilter, TransformInterceptor.
- **Type:** CommonTypes.
- **Check:** DatabaseTest, CheckEntities, TypeOfPg.

## 13. Checklist & Best Practice

- [Checklist phát triển](./docs/09_development_checklist.md)
- [Checklist logging, performance, backup, DR, CI/CD, ...](./docs/checklist/)
- [Logging best practice](./docs/04_logging_best_practices_nestjs.md)
- [Atomic transaction guide](./docs/10_atomic_transaction_guide.md)

## 14. Tài liệu chi tiết

- [Tổng quan dự án](./docs/01_project_overview.md)
- [Yêu cầu chức năng](./docs/02_functional_requirements.md)
- [Kiến trúc hệ thống](./docs/03_architecture.md)
- [API Contract (OpenAPI)](./docs/05_api_contract.yaml)
- [Tối ưu hiệu năng](./docs/12_performance_optimization.md)
- [Hướng dẫn triển khai](./docs/13_deployment_guide.md)
- [Hướng dẫn transaction](./docs/10_atomic_transaction_guide.md)
- [Kiến trúc database](./docs/07_database_architecture_refactor.md)
- [Troubleshooting](./docs/troubleshooting/)

## 15. Đóng góp & phát triển

- Quy trình phát triển, code style, review, CI/CD: [docs/09_development_checklist.md](./docs/09_development_checklist.md)
- Checklist module: [docs/checklist/99_template_module_checklist.md](./docs/checklist/99_template_module_checklist.md)
- Đóng góp vui lòng tạo PR, báo lỗi qua Github Issue hoặc liên hệ team core.

## 16. Liên hệ & Hỗ trợ

- **Báo lỗi, hỗ trợ:** Xem [docs/troubleshooting/](./docs/troubleshooting/)
- **Tài liệu tham khảo:** [NestJS](https://docs.nestjs.com), [TypeORM](https://typeorm.io/), [Redis](https://redis.io/documentation), [PostgreSQL](https://www.postgresql.org/docs/)
- **Liên hệ team phát triển:** ThuanNguyen (Developer)
    - Email: thuanntv721@gmail.com
    - GitHub: [https://github.com/ThuanNTV](https://github.com/ThuanNTV)

## 17. License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

**Lưu ý:**  
- Mọi thay đổi lớn cần cập nhật lại tài liệu và checklist liên quan.
- Đọc kỹ các hướng dẫn, checklist trước khi phát triển hoặc triển khai.
- Đảm bảo bảo mật, backup, DR, kiểm thử đầy đủ trước khi đưa vào production.
