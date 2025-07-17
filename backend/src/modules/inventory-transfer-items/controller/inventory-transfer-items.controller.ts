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
import { CreateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/create-inventoryTransferItem.dto';
import { UpdateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/update-inventoryTransferItem.dto';
import { InventoryTransferItemsService } from 'src/modules/inventory-transfer-items/service/inventory-transfer-items.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';

@ApiTags('Inventory Transfer Items')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/inventory-transfer-items')
@UseGuards(EnhancedAuthGuard)
export class InventoryTransferItemsController {
  constructor(
    private readonly inventoryTransferItemsService: InventoryTransferItemsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory transfer item' })
  @RateLimitAPI()
  async create(
    @Param('storeId') storeId: string,
    @Body() createInventoryTransferItemDto: CreateInventoryTransferItemDto,
  ) {
    return this.inventoryTransferItemsService.create(
      storeId,
      createInventoryTransferItemDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory transfer items' })
  @RateLimitAPI()
  async findAll(@Param('storeId') storeId: string) {
    return this.inventoryTransferItemsService.findAll(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory transfer item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory transfer item ID' })
  @RateLimitAPI()
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.inventoryTransferItemsService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory transfer item' })
  @ApiParam({ name: 'id', description: 'Inventory transfer item ID' })
  @RateLimitAPI()
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateInventoryTransferItemDto: UpdateInventoryTransferItemDto,
  ) {
    return this.inventoryTransferItemsService.update(
      storeId,
      id,
      updateInventoryTransferItemDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inventory transfer item' })
  @ApiParam({ name: 'id', description: 'Inventory transfer item ID' })
  @RateLimitAPI()
  async remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.inventoryTransferItemsService.removeInventoryTransferItem(
      id,
      storeId,
    );
  }
}
