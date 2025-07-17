import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VoucherUsageLogService } from 'src/modules/voucher-usage-log/service/voucher-usage-log.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { CreateVoucherUsageLogDto } from 'src/modules/voucher-usage-log/dto/create-voucherUsageLog.dto';
import { UpdateVoucherUsageLogDto } from 'src/modules/voucher-usage-log/dto/update-voucherUsageLog.dto';

@ApiTags('VoucherUsageLogs')
@Controller('voucher-usage-logs')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class VoucherUsageLogController {
  constructor(
    private readonly voucherUsageLogService: VoucherUsageLogService,
  ) {}

  @Get()
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử sử dụng mã giảm giá' })
  @ApiResponse({ status: 200, description: 'Lịch sử sử dụng mã giảm giá' })
  @ApiQuery({ name: 'storeId', required: true })
  async findAll(@Query('storeId') storeId: string) {
    return await this.voucherUsageLogService.findAll(storeId);
  }

  @Post()
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Ghi nhận sử dụng mã giảm giá' })
  @ApiResponse({ status: 201, description: 'Đã ghi nhận sử dụng mã' })
  @ApiQuery({ name: 'storeId', required: true })
  async create(
    @Query('storeId') storeId: string,
    @Body() dto: CreateVoucherUsageLogDto,
  ) {
    return await this.voucherUsageLogService.create(storeId, dto);
  }

  @Get(':id')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết lịch sử sử dụng mã' })
  @ApiResponse({ status: 200, description: 'Chi tiết lịch sử sử dụng mã' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findOne(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.voucherUsageLogService.findOne(storeId, id);
  }

  @Put(':id')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật lịch sử sử dụng mã' })
  @ApiResponse({ status: 200, description: 'Lịch sử đã cập nhật' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async update(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVoucherUsageLogDto,
  ) {
    return await this.voucherUsageLogService.update(storeId, id, dto);
  }

  @Delete(':id')
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa lịch sử sử dụng mã' })
  @ApiResponse({ status: 200, description: 'Lịch sử đã xóa' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async remove(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.voucherUsageLogService.remove(storeId, id);
  }

  @Post(':id/restore')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục lịch sử sử dụng mã' })
  @ApiResponse({ status: 200, description: 'Lịch sử đã khôi phục' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async restore(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.voucherUsageLogService.restore(storeId, id);
  }

  @Get('stats/overview')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Thống kê hiệu quả chương trình' })
  @ApiResponse({ status: 200, description: 'Thống kê hiệu quả chương trình' })
  @ApiQuery({ name: 'storeId', required: true })
  async getStats(@Query('storeId') storeId: string) {
    return await this.voucherUsageLogService.getStats(storeId);
  }

  @Get('filter/advanced')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lọc lịch sử sử dụng mã nâng cao' })
  @ApiResponse({ status: 200, description: 'Kết quả lọc nâng cao' })
  @ApiQuery({ name: 'storeId', required: true })
  @ApiQuery({ name: 'voucherId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async filter(
    @Query('storeId') storeId: string,
    @Query('voucherId') voucherId?: string,
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      voucherId,
      userId,
      orderId,
      startDate,
      endDate,
    };
    return await this.voucherUsageLogService.filter(storeId, filters);
  }

  @Get('by-voucher/:voucherId')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử theo voucher' })
  @ApiResponse({ status: 200, description: 'Lịch sử theo voucher' })
  @ApiParam({ name: 'voucherId', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findByVoucher(
    @Query('storeId') storeId: string,
    @Param('voucherId') voucherId: string,
  ) {
    return await this.voucherUsageLogService.findByVoucher(storeId, voucherId);
  }

  @Get('by-user/:userId')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử theo user' })
  @ApiResponse({ status: 200, description: 'Lịch sử theo user' })
  @ApiParam({ name: 'userId', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findByUser(
    @Query('storeId') storeId: string,
    @Param('userId') userId: string,
  ) {
    return await this.voucherUsageLogService.findByUser(storeId, userId);
  }

  @Get('by-order/:orderId')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử theo order' })
  @ApiResponse({ status: 200, description: 'Lịch sử theo order' })
  @ApiParam({ name: 'orderId', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findByOrder(
    @Query('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ) {
    return await this.voucherUsageLogService.findByOrder(storeId, orderId);
  }
}
