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
import { StockTransferItemsService } from 'src/modules/stock-transfer-items/service/stock-transfer-items.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stockTransferItem.dto';
import { UpdateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/update-stockTransferItem.dto';

@ApiTags('Stock Transfer Items')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/stock-transfer-items')
@UseGuards(EnhancedAuthGuard)
@UseInterceptors(AuditInterceptor)
export class StockTransferItemsController {
  constructor(
    private readonly stockTransferItemsService: StockTransferItemsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock transfer item' })
  @RateLimitAPI()
  async create(
    @Param('storeId') storeId: string,
    @Body() createStockTransferItemDto: CreateStockTransferItemDto,
  ) {
    return this.stockTransferItemsService.create(
      storeId,
      createStockTransferItemDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock transfer items' })
  @RateLimitAPI()
  async findAll(@Param('storeId') storeId: string) {
    return this.stockTransferItemsService.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock transfer item by ID' })
  @ApiParam({ name: 'id', description: 'Stock transfer item ID' })
  @RateLimitAPI()
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.stockTransferItemsService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a stock transfer item' })
  @ApiParam({ name: 'id', description: 'Stock transfer item ID' })
  @RateLimitAPI()
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateStockTransferItemDto: UpdateStockTransferItemDto,
  ) {
    return this.stockTransferItemsService.update(
      storeId,
      id,
      updateStockTransferItemDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stock transfer item' })
  @ApiParam({ name: 'id', description: 'Stock transfer item ID' })
  @RateLimitAPI()
  async remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.stockTransferItemsService.removeStockTransferItem(id, storeId);
  }
}
