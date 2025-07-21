# User Store Mappings Module

## Overview

The User Store Mappings module manages the relationships between users and stores in the FarmHub system. It provides comprehensive functionality for creating, managing, and querying user-store associations with role-based access control.

## Features

### ✅ Core Functionality

- **CRUD Operations**: Create, read, update, delete user-store mappings
- **Role Management**: Assign and manage user roles within stores
- **Soft Delete**: Safe deletion with restore capability
- **Audit Trail**: Complete audit logging for all operations

### ✅ Advanced Features

- **Advanced Search**: Filter mappings with multiple criteria
- **Pagination**: Efficient pagination for large datasets
- **Bulk Operations**: Batch create, update, and delete operations
- **Statistics**: Comprehensive analytics and reporting
- **Performance Optimization**: Optimized queries with proper indexing

### ✅ Business Rules

- **Duplicate Prevention**: Prevents duplicate user-store mappings
- **Role Validation**: Enforces role-specific business rules
- **Manager Limits**: Maximum 3 managers per store
- **Global Admin Restrictions**: Global admins limited to one store

## Architecture

### Core Components

- **Controller**: `UserStoreMappingsController` - API endpoints
- **Services**:
  - `UserStoreMappingsService` - Core business logic
  - `UserStoreMappingsAdvancedService` - Advanced operations
- **DTOs**: Comprehensive data transfer objects
- **Entity**: `UserStoreMapping` - Database entity with optimized indexes
- **Guards**: `EnhancedAuthGuard`, `PermissionGuard` - Security
- **Interceptors**: `AuditInterceptor` - Audit logging

## API

### Endpoints

1. `POST /user-store-mappings`
   - Tạo mối quan hệ mới.
2. `GET /user-store-mappings`
   - Lấy danh sách mối quan hệ.
3. `GET /user-store-mappings/:userId/:storeId`
   - Lấy chi tiết mối quan hệ.
4. `PATCH /user-store-mappings/:userId/:storeId`
   - Cập nhật mối quan hệ.
5. `DELETE /user-store-mappings/:userId/:storeId`
   - Xóa mềm mối quan hệ.
6. `PATCH /user-store-mappings/:userId/:storeId/restore`
   - Khôi phục mối quan hệ đã xóa.

## Schema

- **UserStoreMapping**:
  - `userId`: UUID
  - `storeId`: UUID
  - `role`: string
  - `createdAt`: Date
  - `updatedAt`: Date

## Business Rules

- Chỉ ADMIN_GLOBAL hoặc STORE_MANAGER mới có quyền tạo, cập nhật, xóa mối quan hệ.
- STORE_STAFF chỉ có quyền xem.

## Testing

- Unit tests cho `UserStoreMappingsService`.
- Integration tests cho các endpoint.

## Security

- Sử dụng `EnhancedAuthGuard` và `PermissionGuard` để kiểm soát truy cập.
- JWT-based authentication.
- Role-based access control (RBAC).
