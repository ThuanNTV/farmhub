import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatchOrderItem.dto';
import { UpdateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/update-dispatchOrderItem.dto';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { DispatchOrderItemsService } from 'src/modules/dispatch-order-items/service/dispatch-order-items.service';

@ApiTags('Dispatch Order Items')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/dispatch-order-items')
@UseGuards(EnhancedAuthGuard)
export class DispatchOrderItemsController {
  constructor(private readonly service: DispatchOrderItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dispatch order item' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitAPI()
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateDispatchOrderItemDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dispatch order items' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispatch order item by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order Item ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dispatch order item' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order Item ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RateLimitAPI()
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchOrderItemDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dispatch order item' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order Item ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
