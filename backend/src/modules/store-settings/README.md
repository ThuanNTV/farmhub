# Store Settings Module

Quản lý cài đặt cửa hàng theo từng tenant (multi-tenant).

## Kiến trúc & Thành phần

- Controller: `StoreSettingsController`
- Service: `StoreSettingsService` (kế thừa `TenantBaseService`)
- DTOs: `CreateStoreSettingDto`, `UpdateStoreSettingDto`, `StoreSettingFilterDto`, `StoreSettingResponseDto`

- Entity: `StoreSetting`
- Guard: `EnhancedAuthGuard`, `PermissionGuard`
- Interceptor: `AuditInterceptor`
- RBAC: `@Roles(...)` theo endpoint

## API & Phân quyền

Các endpoint (tenant route: `/tenant/:storeId/store-settings`):

- POST `/` — Tạo cài đặt mới. Quyền: ADMIN_GLOBAL, STORE_MANAGER
- GET `/` — Danh sách + filter/pagination (query: `key`, `value`, `page`=1, `limit`=20). Quyền: ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF
- GET `/key/:key` — Lấy theo key. Quyền: ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF
- GET `/value/:key` — Lấy chỉ giá trị theo key. Quyền: ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF
- GET `/category/:category` — Danh sách theo tiền tố category (match `setting_key` bắt đầu với `category.`). Quyền: ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF
- GET `/:id` — Lấy theo ID. Quyền: ADMIN_GLOBAL, STORE_MANAGER, STORE_STAFF
- PATCH `/:id` — Cập nhật theo ID. Quyền: ADMIN_GLOBAL, STORE_MANAGER
- PATCH `/key/:key` — Cập nhật theo key (upsert khi chưa tồn tại). Quyền: ADMIN_GLOBAL, STORE_MANAGER
- DELETE `/:id` — Xóa mềm. Quyền: ADMIN_GLOBAL
- DELETE `/key/:key` — Xóa mềm theo key. Quyền: ADMIN_GLOBAL
- PATCH `/:id/restore` — Khôi phục bản ghi đã xóa mềm. Quyền: ADMIN_GLOBAL, STORE_MANAGER

## Filter & Pagination

- `GET /` hỗ trợ: `key` (LIKE), `value` (LIKE), `page` (>=1), `limit` (>=1)
- Mặc định: `page=1`, `limit=20`
- Sắp xếp: `setting_key` ASC

## Validation chính

- `settingKey`: chỉ cho phép `[a-zA-Z0-9._-]`, độ dài `1..255`
- `settingValue`: nếu bắt đầu bằng `{` hoặc `[` thì phải là JSON hợp lệ; tối đa `65535` ký tự
- Không cho phép trùng `settingKey` (is_deleted=false) khi tạo/cập nhật đổi key

## Ghi chú Entity

- Trường chính: `setting_key`, `setting_value`, `store_id`, `is_deleted`, timestamps, `created_by_user_id`, `updated_by_user_id`
- Có index trên `store_id`
- Không có cột `category` riêng; phân loại theo tiền tố của `setting_key` (ví dụ: `email.smtp_host` ⇒ category `email`)

## Testing & Coverage

- Unit tests: controller và service (mock repo thông qua mock `getRepo`)
- E2E: smoke test cho route list với guard override
- Chạy test module-scoped với coverage (khuyến nghị):

```powershell
npx jest --config test/jest.config.ts test/unit/modules/store-settings --coverage --collectCoverageFrom="src/modules/store-settings/**/*.{ts,js}"
```

- Mục tiêu: coverage module ≥ 80% (controller ~100%, service >90% hiện tại). Global threshold có thể không áp dụng khi chạy toàn repo; nên dùng lệnh scoped trên khi cần kiểm tra module này.

## Bảo mật

- JWT + guards (`EnhancedAuthGuard`, `PermissionGuard`), RBAC bằng `@Roles`
- Rate limiting theo decorator (nếu bật ở controller)

## Checklist nhanh

- [ ] Thêm test case cho nhánh lỗi mới (nếu mở rộng validation)
- [ ] Đảm bảo không hardcode config; dùng `TenantDataSourceService`
- [ ] Review index/hiệu năng với bảng lớn; xem xét cache nếu cần

# Store Settings Module

## Chức năng

- Quản lý cài đặt cửa hàng.
- Các chức năng chính:
  - Tạo cài đặt mới.
  - Lấy danh sách cài đặt.
  - Lấy chi tiết cài đặt theo ID hoặc key.
  - Cập nhật cài đặt theo ID hoặc key.
  - Xóa mềm cài đặt.
  - Khôi phục cài đặt đã xóa.

## Kiến trúc

- **Controller**: `StoreSettingsController`
- **Service**: `StoreSettingsService`
- **DTOs**:
  - `CreateStoreSettingDto`
  - `UpdateStoreSettingDto`
- **Entity**: `StoreSetting`
- **Guard**: `EnhancedAuthGuard`, `PermissionGuard`
- **Interceptor**: `AuditInterceptor`

## API

### Endpoints

1. `POST /tenant/:storeId/store-settings`
   - Tạo cài đặt mới.
2. `GET /tenant/:storeId/store-settings`
   - Lấy danh sách cài đặt.
3. `GET /tenant/:storeId/store-settings/key/:key`
   - Lấy chi tiết cài đặt theo key.
4. `GET /tenant/:storeId/store-settings/:id`
   - Lấy chi tiết cài đặt theo ID.
5. `PATCH /tenant/:storeId/store-settings/:id`
   - Cập nhật cài đặt theo ID.
6. `PATCH /tenant/:storeId/store-settings/key/:key`
   - Cập nhật cài đặt theo key.
7. `DELETE /tenant/:storeId/store-settings/:id`
   - Xóa mềm cài đặt.
8. `PATCH /tenant/:storeId/store-settings/:id/restore`
   - Khôi phục cài đặt đã xóa.

## Schema

- **StoreSetting**:
  - `id`: UUID
  - `storeId`: UUID
  - `key`: string
  - `value`: string
  - `category`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa cài đặt.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `StoreSettingsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).

# Checklist kiểm thử & tối ưu STORE-SETTINGS

## 1. Entity & Quan hệ

- [ ] Kiểm tra entity, quan hệ, ràng buộc dữ liệu.
- [ ] Kiểm tra migration, seed dữ liệu mẫu.

## 2. API & Luồng nghiệp vụ

- [ ] Test API tạo, sửa, xóa, lấy danh sách, chi tiết.
- [ ] Test validate input, lỗi edge case.
- [ ] Test phân quyền, RBAC, multi-tenant (nếu có).
- [ ] Test transaction, rollback khi lỗi.

## 3. Tích hợp & Liên kết module khác

- [ ] Kiểm thử liên kết với các module liên quan (nếu có).
- [ ] Test đồng bộ dữ liệu, event, webhook.

## 4. Test case & Automation

- [ ] Viết test case unit, integration, e2e cho các luồng chính.
- [ ] Test coverage > 80%.

## 5. Hiệu năng & Bảo mật

- [ ] Test hiệu năng API, DB (nếu cần).
- [ ] Test bảo mật (SQLi, XSS, CORS, auth, rate limit).

## 6. Đề xuất bổ sung

- [ ] Đề xuất tối ưu, refactor, bổ sung tính năng mới (nếu có).

---
