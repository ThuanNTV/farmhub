import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateReturnOrderItemDto } from 'src/modules/return-order-items/dto/create-returnOrderItem.dto';
import { UpdateReturnOrderItemDto } from 'src/modules/return-order-items/dto/update-returnOrderItem.dto';
import { ReturnOrderItemResponseDto } from 'src/modules/return-order-items/dto/returnOrderItem-response.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequestWithUser } from 'src/common/types/common.types';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { ReturnOrderItemsService } from '../service/return-order-items.service';

@ApiTags('return-order-items')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('tenant/:storeId/return-order-items')
export class ReturnOrderItemsController {
  constructor(
    private readonly returnOrderItemsService: ReturnOrderItemsService,
  ) {}

  @Post()
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo return order item' })
  @ApiResponse({
    status: 201,
    description: 'Tạo thành công',
    type: ReturnOrderItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo' })
  async create(
    @Param('storeId') storeId: string,
    @Body() createReturnOrderItemDto: CreateReturnOrderItemDto,
    @Request() req: RequestWithUser,
  ) {
    return this.returnOrderItemsService.createReturnOrderItem(
      storeId,
      createReturnOrderItemDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách return order items' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách return order items',
    type: [ReturnOrderItemResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  async findAll(@Param('storeId') storeId: string) {
    const entities = await this.returnOrderItemsService.findAll(storeId);
    return entities.map((entity) =>
      this.returnOrderItemsService.mapToResponseDto(entity),
    );
  }

  @Get(':id')
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin return order item theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin return order item',
    type: ReturnOrderItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Return order item không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    const entity = await this.returnOrderItemsService.findOne(storeId, id);
    if (!entity) {
      throw new NotFoundException(`ReturnOrderItem with id ${id} not found`);
    }
    return this.returnOrderItemsService.mapToResponseDto(entity);
  }

  @Patch(':id')
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật return order item' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ReturnOrderItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Return order item không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateReturnOrderItemDto: UpdateReturnOrderItemDto,
    @Request() req: RequestWithUser,
  ) {
    return this.returnOrderItemsService.update(
      storeId,
      id,
      updateReturnOrderItemDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa return order item' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Return order item không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    await this.returnOrderItemsService.remove(storeId, id, req.user.id);
    return { message: 'Return order item deleted successfully' };
  }

  @Patch(':id/restore')
  @UseGuards(EnhancedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @ApiBearerAuth('access-token')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục return order item đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Return order item không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  async restore(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.returnOrderItemsService.restore(storeId, id, req.user.id);
  }
}
