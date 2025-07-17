import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDtoDir = path.join(__dirname, '../src/dto');
const modulesDir = path.join(__dirname, '../src/modules');

const dtoToModuleMap = [
  { dto: 'dtoAuditLog', module: 'audit-logs' },
  { dto: 'dtoUserActivityLog', module: 'user-activity-log' },
  { dto: 'dtoStockTransferItem', module: 'stock-transfer-items' },
  { dto: 'dtoScheduledTask', module: 'scheduled-task' },
  { dto: 'dtoVoucherUsageLog', module: 'voucher-usage-log' },
  { dto: 'dtoStockTransfer', module: 'stock-transfer' },
  { dto: 'dtoUnit', module: 'units' },
  { dto: 'dtoUserStoreMapping', module: 'user-store-mappings' },
  { dto: 'dtoPaymentMethod', module: 'payment-methods' },
  { dto: 'dtoWebhookLog', module: 'webhook-logs' },
  { dto: 'dtoVoucher', module: 'vouchers' },
  { dto: 'dtoSupplier', module: 'suppliers' },
  { dto: 'dtoStoreSetting', module: 'store-settings' },
  { dto: 'dtoStockAdjustment', module: 'stock-adjustments' },
  { dto: 'dtoReturnOrderItem', module: 'return-order-items' },
  { dto: 'dtoReturnOrder', module: 'return-orders' },
  { dto: 'dtoPromotion', module: 'promotions' },
  { dto: 'dtoPriceHistory', module: 'price-histories' },
  { dto: 'dtoPayment', module: 'payments' },
  { dto: 'dtoOrderItems', module: 'order-items' },
  { dto: 'dtoLoyaltyPointLog', module: 'loyalty-point-logs' },
  { dto: 'dtoJobSchedule', module: 'job-schedules' },
  { dto: 'dtoInventoryTransferItem', module: 'inventory-transfer-items' },
  { dto: 'dtoInventoryTransfer', module: 'inventory-transfers' },
  { dto: 'dtoInstallment', module: 'installments' },
  { dto: 'dtoFileAttachment', module: 'file-attachments' },
  { dto: 'dtoExternalSystemLog', module: 'external-system-logs' },
  { dto: 'dtoDispatchOrderItem', module: 'dispatch-order-items' },
  { dto: 'dtoDispatchOrder', module: 'dispatch-orders' },
  { dto: 'dtoDebtTransaction', module: 'debt-transactions' },
];

dtoToModuleMap.forEach(({ dto, module }) => {
  const src = path.join(srcDtoDir, dto);
  const dest = path.join(modulesDir, module, 'dto');
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      fs.renameSync(srcFile, destFile);
      console.log(`Moved ${srcFile} -> ${destFile}`);
    });
    // Xóa thư mục gốc nếu rỗng
    if (fs.readdirSync(src).length === 0) {
      fs.rmdirSync(src);
    }
  }
}); 