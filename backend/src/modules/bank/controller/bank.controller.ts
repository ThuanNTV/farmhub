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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { BankResponseDto } from 'src/modules/bank/dto/bank-response.dto';
import { CreateBankDto } from 'src/modules/bank/dto/create-bank.dto';
import { UpdateBankDto } from 'src/modules/bank/dto/update-bank.dto';
import { BankService } from 'src/modules/bank/service/bank.service';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { BankFilterDto } from 'src/modules/bank/dto/bank-filter.dto';

@ApiTags('Banks')
@Controller('banks')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo bank mới' })
  @ApiResponse({ status: 201, type: BankResponseDto })
  create(
    @Body() dto: CreateBankDto,
    @Request() req: Request & { user: { userId: string } },
  ) {
    return this.bankService.create(dto, req.user.userId);
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
  @ApiOperation({ summary: 'Lấy danh sách bank' })
  @ApiResponse({ status: 200, type: [BankResponseDto] })
  findAll() {
    return this.bankService.findAll();
  }

  @Get('search')
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm + phân trang ngân hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách có phân trang' })
  findAllWithFilter(@Request() req: Request) {
    const query = (req as any).query as BankFilterDto;
    return this.bankService.findAllWithFilter(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết bank' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  findOne(@Param('id') id: string) {
    return this.bankService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật bank' })
  @ApiResponse({ status: 200, type: BankResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBankDto,
    @Request() req: Request & { user: { userId: string } },
  ) {
    return this.bankService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa mềm bank' })
  @ApiResponse({ status: 204 })
  async remove(
    @Param('id') id: string,
    @Request() req: Request & { user: { userId: string } },
  ) {
    await this.bankService.remove(id, req.user.userId);
    return { message: 'Đã xóa bank' };
  }
}
