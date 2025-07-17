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
import { CreateInventoryTransferDto } from 'src/modules/inventory-transfers/dto/create-inventoryTransfer.dto';
import { UpdateInventoryTransferDto } from 'src/modules/inventory-transfers/dto/update-inventoryTransfer.dto';
import { InventoryTransferResponseDto } from 'src/modules/inventory-transfers/dto/inventoryTransfer-response.dto';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';

@ApiTags('Inventory Transfers')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/inventory-transfers')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@UseInterceptors(AuditInterceptor)
export class InventoryTransfersController {
  constructor(private readonly service: InventoryTransfersService) {}

  @Post()
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inventory transfer' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'Inventory transfer created successfully',
    type: InventoryTransferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateInventoryTransferDto,
  ): Promise<InventoryTransferResponseDto> {
    return await this.service.createInventoryTransfer(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get all inventory transfers' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory transfers retrieved successfully',
    type: [InventoryTransferResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<InventoryTransferResponseDto[]> {
    return await this.service.findAllInventoryTransfers(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get inventory transfer by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Inventory Transfer ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory transfer retrieved successfully',
    type: InventoryTransferResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory transfer not found' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<InventoryTransferResponseDto> {
    return await this.service.findInventoryTransfer(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Update inventory transfer' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Inventory Transfer ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory transfer updated successfully',
    type: InventoryTransferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory transfer not found' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryTransferDto,
  ): Promise<InventoryTransferResponseDto> {
    return await this.service.updateInventoryTransfer(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory transfer' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Inventory Transfer ID' })
  @ApiResponse({
    status: 204,
    description: 'Inventory transfer deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory transfer not found' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.removeInventoryTransfer(storeId, id);
  }

  @Post(':id/restore')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted inventory transfer' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Inventory Transfer ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory transfer restored successfully',
    type: InventoryTransferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory transfer not found' })
  async restore(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<InventoryTransferResponseDto> {
    return await this.service.restoreInventoryTransfer(storeId, id);
  }
}
