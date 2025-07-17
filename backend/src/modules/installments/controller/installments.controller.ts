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
import { CreateInstallmentDto } from 'src/modules/installments/dto/create-installment.dto';
import { UpdateInstallmentDto } from 'src/modules/installments/dto/update-installment.dto';
import { InstallmentResponseDto } from 'src/modules/installments/dto/installment-response.dto';
import { InstallmentsService } from 'src/modules/installments/service/installments.service';

@ApiTags('Installments')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/installments')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@UseInterceptors(AuditInterceptor)
export class InstallmentsController {
  constructor(private readonly service: InstallmentsService) {}

  @Post()
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new installment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'Installment created successfully',
    type: InstallmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateInstallmentDto,
  ): Promise<InstallmentResponseDto> {
    return await this.service.createInstallment(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get all installments' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Installments retrieved successfully',
    type: [InstallmentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<InstallmentResponseDto[]> {
    return await this.service.findAllInstallments(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get installment by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Installment ID' })
  @ApiResponse({
    status: 200,
    description: 'Installment retrieved successfully',
    type: InstallmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Installment not found' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<InstallmentResponseDto> {
    return await this.service.findInstallment(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Update installment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Installment ID' })
  @ApiResponse({
    status: 200,
    description: 'Installment updated successfully',
    type: InstallmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Installment not found' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInstallmentDto,
  ): Promise<InstallmentResponseDto> {
    return await this.service.updateInstallment(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete installment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Installment ID' })
  @ApiResponse({ status: 204, description: 'Installment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Installment not found' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.removeInstallment(storeId, id);
  }

  @Post(':id/restore')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted installment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Installment ID' })
  @ApiResponse({
    status: 200,
    description: 'Installment restored successfully',
    type: InstallmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Installment not found' })
  async restore(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<InstallmentResponseDto> {
    return await this.service.restoreInstallment(storeId, id);
  }
}
