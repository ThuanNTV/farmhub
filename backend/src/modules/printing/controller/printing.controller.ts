import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PrintingService } from '../service/printing.service';
import { QuotationData } from 'src/common/types/common.types';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';

@ApiTags('Printing')
@Controller('tenant/:storeId/printing')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
export class PrintingController {
  constructor(private readonly printingService: PrintingService) {}

  @Post('invoice')
  @ApiOperation({ summary: 'In hóa đơn' })
  @ApiResponse({ status: 200, description: 'Kết quả in hóa đơn' })
  printInvoice(
    @Param('storeId') storeId: string,
    @Body() body: { orderId: string },
  ) {
    return this.printingService.printInvoice(storeId, body.orderId);
  }

  @Post('receipt')
  @ApiOperation({ summary: 'In phiếu thu' })
  @ApiResponse({ status: 200, description: 'Kết quả in phiếu thu' })
  printReceipt(
    @Param('storeId') storeId: string,
    @Body() body: { paymentId: string },
  ) {
    return this.printingService.printReceipt(storeId, body.paymentId);
  }

  @Post('barcode')
  @ApiOperation({ summary: 'In nhãn mã vạch' })
  @ApiResponse({ status: 200, description: 'Kết quả in nhãn mã vạch' })
  printBarcode(
    @Param('storeId') storeId: string,
    @Body() body: { productId: string },
  ) {
    return this.printingService.printBarcode(storeId, body.productId);
  }

  @Post('quotation')
  @ApiOperation({ summary: 'In báo giá' })
  @ApiResponse({ status: 200, description: 'Kết quả in báo giá' })
  printQuotation(
    @Param('storeId') storeId: string,
    @Body() body: QuotationData,
  ) {
    return this.printingService.printQuotation(storeId, body);
  }
}
