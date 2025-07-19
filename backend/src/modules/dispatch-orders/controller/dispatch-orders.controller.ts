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
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { CreateDispatchOrderDto } from 'src/modules/dispatch-orders/dto/create-dispatchOrder.dto';
import { UpdateDispatchOrderDto } from 'src/modules/dispatch-orders/dto/update-dispatchOrder.dto';
import { DispatchOrdersService } from 'src/modules/dispatch-orders/service/dispatch-orders.service';

@ApiTags('Dispatch Orders')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/dispatch-orders')
@UseGuards(EnhancedAuthGuard)
@UseInterceptors(AuditInterceptor)
@RateLimitAPI()
export class DispatchOrdersController {
  constructor(private readonly service: DispatchOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dispatch order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateDispatchOrderDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dispatch orders' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispatch order by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dispatch order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchOrderDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dispatch order' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Dispatch Order ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
