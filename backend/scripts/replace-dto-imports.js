import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../src');

// Map DTO thư mục sang module thư mục
const dtoToModuleMap = {
  dtoAuditLog: 'audit-logs',
  dtoUserActivityLog: 'user-activity-log',
  dtoStockTransferItem: 'stock-transfer-items',
  dtoScheduledTask: 'scheduled-task',
  dtoVoucherUsageLog: 'voucher-usage-log',
  dtoStockTransfer: 'stock-transfer',
  dtoUnit: 'units',
  dtoUserStoreMapping: 'user-store-mappings',
  dtoPaymentMethod: 'payment-methods',
  dtoWebhookLog: 'webhook-logs',
  dtoVoucher: 'vouchers',
  dtoSupplier: 'suppliers',
  dtoStoreSetting: 'store-settings',
  dtoStockAdjustment: 'stock-adjustments',
  dtoReturnOrderItem: 'return-order-items',
  dtoReturnOrder: 'return-orders',
  dtoPromotion: 'promotions',
  dtoPriceHistory: 'price-histories',
  dtoPayment: 'payments',
  dtoOrderItems: 'order-items',
  dtoLoyaltyPointLog: 'loyalty-point-logs',
  dtoJobSchedule: 'job-schedules',
  dtoInventoryTransferItem: 'inventory-transfer-items',
  dtoInventoryTransfer: 'inventory-transfers',
  dtoInstallment: 'installments',
  dtoFileAttachment: 'file-attachments',
  dtoExternalSystemLog: 'external-system-logs',
  dtoDispatchOrderItem: 'dispatch-order-items',
  dtoDispatchOrder: 'dispatch-orders',
  dtoDebtTransaction: 'debt-transactions',
};

function replaceImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = false;
  for (const [dto, module] of Object.entries(dtoToModuleMap)) {
    // Regex: src/dto/dtoXxx/...
    const regex = new RegExp(`src/dto/${dto}/`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `src/modules/${module}/dto/`);
      replaced = true;
    }
  }
  if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated imports in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceImportsInFile(fullPath);
    }
  });
}

walkDir(rootDir); 