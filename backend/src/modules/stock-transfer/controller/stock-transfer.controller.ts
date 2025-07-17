import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
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
import { StockTransferService } from 'src/modules/stock-transfer/service/stock-transfer.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { CreateStockTransferDto } from 'src/modules/stock-transfer/dto/create-stockTransfer.dto';
import { UpdateStockTransferDto } from 'src/modules/stock-transfer/dto/update-stockTransfer.dto';

@ApiTags('StockTransfer')
@Controller('stock-transfers')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(AuditInterceptor)
export class StockTransferController {
  constructor(private readonly stockTransferService: StockTransferService) {}

  @Post()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo phiếu chuyển kho' })
  @ApiResponse({ status: 201, description: 'Phiếu chuyển kho đã tạo' })
  async create(
    @Query('storeId') storeId: string,
    @Body() dto: CreateStockTransferDto,
  ) {
    return await this.stockTransferService.create(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Danh sách phiếu chuyển kho' })
  @ApiQuery({ name: 'storeId', required: true })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('storeId') storeId: string,
    @Query('status') status?: string,
  ) {
    if (status) {
      return await this.stockTransferService.findByStatus(storeId, status);
    }
    return await this.stockTransferService.findAll(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy chi tiết phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Chi tiết phiếu chuyển kho' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async findOne(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.stockTransferService.findOne(storeId, id);
  }

  @Put(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Phiếu chuyển kho đã cập nhật' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async update(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStockTransferDto,
  ) {
    return await this.stockTransferService.update(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Phiếu chuyển kho đã xóa' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async remove(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.stockTransferService.remove(storeId, id);
  }

  @Post(':id/restore')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Phiếu chuyển kho đã khôi phục' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async restore(@Query('storeId') storeId: string, @Param('id') id: string) {
    return await this.stockTransferService.restore(storeId, id);
  }

  @Get(':id/items')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm trong phiếu chuyển kho' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm' })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  async getTransferItems(
    @Query('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return await this.stockTransferService.getTransferItems(storeId, id);
  }
}
