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
import { CreateDebtTransactionDto } from 'src/modules/debt-transactions/dto/create-debtTransaction.dto';
import { UpdateDebtTransactionDto } from 'src/modules/debt-transactions/dto/update-debtTransaction.dto';
import { DebtTransactionsService } from 'src/modules/debt-transactions/service/debt-transactions.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

@ApiTags('Debt Transactions')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/debt-transactions')
@UseGuards(EnhancedAuthGuard)
@UseInterceptors(AuditInterceptor)
@RateLimitAPI()
export class DebtTransactionsController {
  constructor(private readonly service: DebtTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new debt transaction' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateDebtTransactionDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debt transactions' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findAll(@Param('storeId') storeId: string) {
    return this.service.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt transaction by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Debt Transaction ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  findById(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update debt transaction' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Debt Transaction ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDebtTransactionDto,
  ) {
    return this.service.update(storeId, id, dto);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Khôi phục debt transaction đã xóa mềm' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Debt Transaction ID' })
  @Roles(UserRole.ADMIN_GLOBAL)
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.restore(storeId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debt transaction' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Debt Transaction ID' })
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.service.remove(storeId, id);
  }
}
