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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { CustomerResponseDto } from 'src/modules/customers/dto/customer-response.dto';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import { RequireCustomerPermission } from 'src/core/rbac/permission/permissions.decorator';
import { CreateCustomerDto } from 'src/modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from 'src/modules/customers/dto/update-customer.dto';
import { CustomerFilter } from 'src/common/types/common.types';

@ApiTags('Customers')
@Controller('tenant/:storeId/customers')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post(':storeId')
  @RequireCustomerPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo khách hàng mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo khách hàng thành công',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo khách hàng' })
  create(
    @Param('storeId')
    storeId: string,
    @Body()
    createCustomerDto: CreateCustomerDto,
    p0: any,
  ) {
    return this.customersService.createCustomer(storeId, createCustomerDto);
  }

  @Get(':storeId')
  @RequireCustomerPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách khách hàng',
    type: [CustomerResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  findAll(@Param('storeId') storeId: string) {
    if (!storeId || typeof storeId !== 'string' || storeId.trim() === '') {
      throw new BadRequestException('Thiếu hoặc sai định dạng storeId');
    }
    return this.customersService.findAll(storeId);
  }

  @Get(':storeId/:id')
  @RequireCustomerPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin khách hàng theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin khách hàng',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem khách hàng' })
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.customersService.findOne(storeId, id);
  }

  @Patch(':storeId/:id')
  @RequireCustomerPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    // Chuyển đổi birthday từ string sang Date nếu có
    const dto: Partial<UpdateCustomerDto> = { ...updateCustomerDto };
    if (dto.birthday && typeof dto.birthday === 'string') {
      const date = new Date(dto.birthday);
      if (!isNaN(date.getTime())) {
        dto.birthday = date.toISOString().split('T')[0]; // Định dạng yyyy-mm-dd
      }
    }
    return this.customersService.update(storeId, id, dto);
  }

  @Delete(':storeId/:id')
  @RequireCustomerPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa khách hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.customersService.remove(storeId, id);
  }

  @Patch(':storeId/:id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục khách hàng đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Khách hàng không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.customersService.restore(storeId, id);
  }

  @Get(':storeId/search/:keyword')
  @RequireCustomerPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả tìm kiếm',
    type: [CustomerResponseDto],
  })
  search(@Param('storeId') storeId: string, @Param('keyword') keyword: string) {
    return this.customersService.search(storeId, keyword);
  }

  @Post(':storeId/filter')
  @ApiOperation({ summary: 'Tìm kiếm nâng cao khách hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
  filter(@Param('storeId') storeId: string, @Body() filter: CustomerFilter) {
    return this.customersService.filter(storeId, filter);
  }
}
