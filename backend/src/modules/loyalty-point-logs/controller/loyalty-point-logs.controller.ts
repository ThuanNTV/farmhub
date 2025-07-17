import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { RateLimitGuard } from 'src/common/auth/rate-limit.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { CreateLoyaltyPointLogDto } from 'src/modules/loyalty-point-logs/dto/create-loyaltyPointLog.dto';
import { UpdateLoyaltyPointLogDto } from 'src/modules/loyalty-point-logs/dto/update-loyaltyPointLog.dto';
import { LoyaltyPointLogResponseDto } from 'src/modules/loyalty-point-logs/dto/loyaltyPointLog-response.dto';
import { LoyaltyPointLogsService } from 'src/modules/loyalty-point-logs/service/loyalty-point-logs.service';

@ApiTags('Loyalty Point Logs')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/loyalty-point-logs')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@UseInterceptors(AuditInterceptor)
export class LoyaltyPointLogsController {
  constructor(private readonly service: LoyaltyPointLogsService) {}

  @Post()
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new loyalty point log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'Loyalty point log created successfully',
    type: LoyaltyPointLogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateLoyaltyPointLogDto,
  ): Promise<LoyaltyPointLogResponseDto> {
    return await this.service.createLoyaltyPointLog(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get all loyalty point logs' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty point logs retrieved successfully',
    type: [LoyaltyPointLogResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<LoyaltyPointLogResponseDto[]> {
    return await this.service.findAllLoyaltyPointLogs(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get loyalty point log by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Loyalty Point Log ID' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty point log retrieved successfully',
    type: LoyaltyPointLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Loyalty point log not found' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<LoyaltyPointLogResponseDto> {
    return await this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Update loyalty point log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Loyalty Point Log ID' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty point log updated successfully',
    type: LoyaltyPointLogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Loyalty point log not found' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoyaltyPointLogDto,
  ): Promise<LoyaltyPointLogResponseDto> {
    return await this.service.updateLoyaltyPointLog(storeId, id, dto);
  }

  @Patch(':id/restore')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @ApiOperation({ summary: 'Restore a soft deleted loyalty point log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Loyalty Point Log ID' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty point log restored successfully',
    type: LoyaltyPointLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Loyalty point log not found' })
  async restore(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<LoyaltyPointLogResponseDto> {
    return await this.service.restoreLoyaltyPointLog(storeId, id);
  }

  @Delete(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete loyalty point log' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Loyalty Point Log ID' })
  @ApiResponse({
    status: 204,
    description: 'Loyalty point log deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Loyalty point log not found' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.removeLoyaltyPointLog(storeId, id);
  }
}
