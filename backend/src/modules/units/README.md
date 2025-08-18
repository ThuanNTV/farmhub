# Checklist kiểm thử & tối ưu UNITS

## 1. Entity & Quan hệ

- [x] Kiểm tra entity, quan hệ, ràng buộc dữ liệu.
- [ ] Kiểm tra migration, seed dữ liệu mẫu.

## 2. API & Luồng nghiệp vụ

- [x] Test API tạo, sửa, xóa, lấy danh sách, chi tiết (ở mức unit).
- [x] Test validate input, lỗi edge case (ở mức unit).
- [ ] Test phân quyền, RBAC, multi-tenant (nếu có).
- [ ] Test transaction, rollback khi lỗi.

## 3. Tích hợp & Liên kết module khác

- [ ] Kiểm thử liên kết với các module liên quan (nếu có).
- [ ] Test đồng bộ dữ liệu, event, webhook.

## 4. Test case & Automation

- [ ] Viết test case unit, integration, e2e cho các luồng chính.
- [x] Test coverage > 80% (module Units, đo module-scoped).

## 5. Hiệu năng & Bảo mật

- [ ] Test hiệu năng API, DB (nếu cần).
- [ ] Test bảo mật (SQLi, XSS, CORS, auth, rate limit).

## 6. Đề xuất bổ sung

- [ ] Đề xuất tối ưu, refactor, bổ sung tính năng mới (nếu có).

---

# Units Module

## Chức năng

- Quản lý đơn vị đo lường (units) cho sản phẩm.
- Các chức năng chính:
  - Tạo đơn vị đo lường mới.
  - Lấy danh sách đơn vị đo lường.
  - Lấy chi tiết đơn vị đo lường.
  - Cập nhật đơn vị đo lường.
  - Xóa mềm đơn vị đo lường.
  - Khôi phục đơn vị đo lường đã xóa.

## Kiến trúc

- **Controller**: `UnitsController`
- **Service**: `UnitsService`
- **DTOs**:
  - `CreateUnitDto`
  - `UpdateUnitDto`
  - `UnitResponseDto`
  - `UnitFilterDto` (search/pagination)
- **Entity**: `Unit`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`
- **Decorator khác**: `RateLimitAPI` áp cho các endpoint để hạn chế tần suất gọi API.

## API

### Endpoints

1. `POST /units`
   - Tạo đơn vị đo lường mới.
2. `GET /units`
   - Lấy danh sách đơn vị đo lường.
   - Trả về mảng `UnitResponseDto`.
3. `GET /units/search`
   - Tìm kiếm + phân trang.
   - Query: `search?: string`, `page?: number (>=1, mặc định 1)`, `limit?: number (1..100, mặc định 20)`.
   - Response: `{ data: UnitResponseDto[]; total: number; page: number; limit: number }`.
4. `GET /units/:id`
   - Lấy chi tiết đơn vị đo lường.
5. `PATCH /units/:id`
   - Cập nhật đơn vị đo lường.
6. `DELETE /units/:id`
   - Xóa mềm đơn vị đo lường.
7. `PATCH /units/:id/restore`
   - Khôi phục đơn vị đo lường đã xóa.

## Schema

- **Unit**:
  - `id`: UUID
  - `name`: string
  - `description`: string
  - `createdAt`: Date
  - `updatedAt`: Date
  - `deletedAt`: Date | null (soft delete)
  - `isDeleted`: boolean (soft delete flag)
  - `createdByUserId`: string | null
  - `updatedByUserId`: string | null

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa đơn vị đo lường.
- STORE_STAFF chỉ có quyền xem.
- Tên đơn vị đo lường là duy nhất (unique name) theo ngữ cảnh global.
- Xóa là soft delete; có thể khôi phục bằng endpoint `/restore`.
- Audit log chỉ ghi cho các phương thức mutating (POST/PATCH/DELETE) khi có user hợp lệ.
- Rate limit áp dụng cho các endpoint qua `@RateLimitAPI()`.

## Testing

- Unit tests: `UnitsService` (create/duplicate, findAll, findAllWithFilter, findOne not found, update unique, remove, restore) và `UnitsController` (đầy đủ các nhánh chính, xử lý lỗi).
- E2E: e2e nhẹ cho Units Controller (GET /units, GET /units/search) với mock `AuditInterceptor`, `EnhancedAuthGuard`, `PermissionGuard` và `RateLimitAPI` để tránh phụ thuộc hạ tầng (DB/Redis/Bull).
- Coverage: đảm bảo ≥ 80% cho phạm vi module Units (khi đo module-scoped coverage).

Lưu ý e2e: sử dụng jest.mock tại các path `src/common/auth/audit.interceptor`, `src/common/auth/enhanced-auth.guard`, `src/core/rbac/permission/permission.guard`, `src/common/decorator/rate-limit.decorator` để DI không khởi tạo các phụ thuộc thật.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
