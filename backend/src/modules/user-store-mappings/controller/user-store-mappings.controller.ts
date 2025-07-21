import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  NotFoundException,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserStoreMappingsService } from 'src/modules/user-store-mappings/service/user-store-mappings.service';
import { UserStoreMappingsAdvancedService } from 'src/modules/user-store-mappings/service/user-store-mappings-advanced.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { UserStoreMappingResponseDto } from 'src/modules/user-store-mappings/dto/userStoreMapping-response.dto';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';
import {
  UserStoreMappingFilterDto,
  PaginatedUserStoreMappingResponseDto,
  UserStoreMappingStatsDto,
} from '../dto/user-store-mapping-filter.dto';
import {
  BulkCreateUserStoreMappingDto,
  BulkUpdateUserStoreMappingDto,
  BulkDeleteUserStoreMappingDto,
  BulkOperationResultDto,
} from '../dto/bulk-operations.dto';

@ApiTags('user-store-mappings')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@Controller('user-store-mappings')
export class UserStoreMappingsController {
  constructor(
    private readonly userStoreMappingsService: UserStoreMappingsService,
    private readonly advancedService: UserStoreMappingsAdvancedService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new user store mapping' })
  @ApiResponse({
    status: 201,
    description: 'User store mapping created successfully',
    type: UserStoreMappingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createUserStoreMappingDto: CreateUserStoreMappingDto,
  ): Promise<UserStoreMappingResponseDto> {
    const entity = await this.userStoreMappingsService.create(
      createUserStoreMappingDto.storeId,
      createUserStoreMappingDto,
    );
    return this.userStoreMappingsService.mapToResponseDto(entity);
  }

  @Get()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all user store mappings' })
  @ApiResponse({
    status: 200,
    description: 'Return all user store mappings',
    type: [UserStoreMappingResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<UserStoreMappingResponseDto[]> {
    const entities = await this.userStoreMappingsService.findAll();
    return entities.map((e) =>
      this.userStoreMappingsService.mapToResponseDto(e),
    );
  }

  @Get(':userId/:storeId')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get a user store mapping by user ID and store ID' })
  @ApiResponse({
    status: 200,
    description: 'User store mapping found',
    type: UserStoreMappingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User store mapping not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('userId') userId: string,
    @Param('storeId') storeId: string,
  ): Promise<UserStoreMappingResponseDto> {
    const mapping = await this.userStoreMappingsService.findOne(
      userId,
      storeId,
    );
    return this.userStoreMappingsService.mapToResponseDto(mapping);
  }

  @Patch(':userId/:storeId')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update a user store mapping' })
  @ApiResponse({
    status: 200,
    description: 'User store mapping updated successfully',
    type: UserStoreMappingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User store mapping not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('userId') userId: string,
    @Param('storeId') storeId: string,
    @Body() updateUserStoreMappingDto: UpdateUserStoreMappingDto,
  ): Promise<UserStoreMappingResponseDto> {
    const entity = await this.userStoreMappingsService.update(
      userId,
      storeId,
      updateUserStoreMappingDto,
    );
    return this.userStoreMappingsService.mapToResponseDto(entity);
  }

  @Delete(':userId/:storeId')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete a user store mapping' })
  @ApiResponse({
    status: 200,
    description: 'User store mapping deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User store mapping not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('userId') userId: string,
    @Param('storeId') storeId: string,
  ): Promise<{ message: string }> {
    await this.userStoreMappingsService.remove(userId, storeId);
    return { message: 'Xóa thành công' };
  }

  @Patch(':userId/:storeId/restore')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted user store mapping' })
  @ApiResponse({
    status: 200,
    description: 'User store mapping restored successfully',
    type: UserStoreMappingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User store mapping not found or not deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restore(
    @Param('userId') userId: string,
    @Param('storeId') storeId: string,
  ): Promise<UserStoreMappingResponseDto> {
    const entity = await this.userStoreMappingsService.restore(userId, storeId);
    return this.userStoreMappingsService.mapToResponseDto(entity);
  }

  // ==================== ADVANCED ENDPOINTS ====================

  @Get('search')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({
    summary: 'Search user store mappings with advanced filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'User store mappings retrieved successfully',
    type: PaginatedUserStoreMappingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchMappings(
    @Query() filters: UserStoreMappingFilterDto,
  ): Promise<PaginatedUserStoreMappingResponseDto> {
    return await this.userStoreMappingsService.findWithFilters(filters);
  }

  @Get('user/:userId/stores')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all stores for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User stores retrieved successfully',
    type: [UserStoreMappingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStores(
    @Param('userId') userId: string,
  ): Promise<UserStoreMappingResponseDto[]> {
    const mappings = await this.userStoreMappingsService.findByUserId(userId);
    return mappings.map((mapping) =>
      this.userStoreMappingsService.mapToResponseDto(mapping),
    );
  }

  @Get('store/:storeId/users')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all users for a specific store' })
  @ApiResponse({
    status: 200,
    description: 'Store users retrieved successfully',
    type: [UserStoreMappingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async getStoreUsers(
    @Param('storeId') storeId: string,
  ): Promise<UserStoreMappingResponseDto[]> {
    const mappings = await this.userStoreMappingsService.findByStoreId(storeId);
    return mappings.map((mapping) =>
      this.userStoreMappingsService.mapToResponseDto(mapping),
    );
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({
    summary: 'Get comprehensive statistics about user store mappings',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: UserStoreMappingStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(): Promise<UserStoreMappingStatsDto> {
    return await this.advancedService.getStatistics();
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/create')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk create user store mappings' })
  @ApiResponse({
    status: 200,
    description: 'Bulk create operation completed',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkCreate(
    @Body() dto: BulkCreateUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    return await this.advancedService.bulkCreate(dto);
  }

  @Patch('bulk/update')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update user store mappings' })
  @ApiResponse({
    status: 200,
    description: 'Bulk update operation completed',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUpdate(
    @Body() dto: BulkUpdateUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    return await this.advancedService.bulkUpdate(dto);
  }

  @Delete('bulk/delete')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete user store mappings' })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete operation completed',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkDelete(
    @Body() dto: BulkDeleteUserStoreMappingDto,
  ): Promise<BulkOperationResultDto> {
    return await this.advancedService.bulkDelete(dto);
  }
}
