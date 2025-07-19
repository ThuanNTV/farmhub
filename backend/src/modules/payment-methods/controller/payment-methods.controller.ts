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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-paymentMethod.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-paymentMethod.dto';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/paymentMethod-response.dto';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { RequestWithUser } from 'src/common/types/common.types';

@ApiTags('payment-methods')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({
    status: 201,
    description: 'Payment method created successfully',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Payment method name already exists',
  })
  async create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @Request() req: RequestWithUser,
  ): Promise<PaymentMethodResponseDto> {
    const entity = await this.paymentMethodsService.create(
      createPaymentMethodDto,
      req.user.id,
    );
    return this.paymentMethodsService.mapToResponseDto(entity);
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
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Return all payment methods',
    type: [PaymentMethodResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<PaymentMethodResponseDto[]> {
    const entities = await this.paymentMethodsService.findAll();
    return entities.map((e) => this.paymentMethodsService.mapToResponseDto(e));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get a payment method by id' })
  @ApiResponse({
    status: 200,
    description: 'Payment method found',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<PaymentMethodResponseDto> {
    const entity = await this.paymentMethodsService.findOne(id);
    return this.paymentMethodsService.mapToResponseDto(entity);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Payment method name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Request() req: RequestWithUser,
  ): Promise<PaymentMethodResponseDto> {
    const entity = await this.paymentMethodsService.update(
      id,
      updatePaymentMethodDto,
      req.user.id,
    );
    return this.paymentMethodsService.mapToResponseDto(entity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete a payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.paymentMethodsService.remove(id, req.user.id);
    return { message: 'Xóa thành công' };
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method restored successfully',
    type: PaymentMethodResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method not found or not deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restore(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<PaymentMethodResponseDto> {
    const entity = await this.paymentMethodsService.restore(id, req.user.id);
    return this.paymentMethodsService.mapToResponseDto(entity);
  }
}
