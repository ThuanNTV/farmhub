import * as fs from 'fs';
import * as path from 'path';

// Common field mappings from snake_case to camelCase
const fieldMappings = {
  // User fields
  user_id: 'userId',
  user_name: 'userName',
  full_name: 'fullName',
  is_active: 'isActive',
  is_superadmin: 'isSuperadmin',
  last_login_at: 'lastLoginAt',
  password_reset_token: 'passwordResetToken',
  token_expiry_at: 'tokenExpiryAt',

  // Store fields
  store_id: 'storeId',
  store_name: 'storeName',
  schema_name: 'schemaName',
  manager_user_id: 'managerUserId',
  opening_hours: 'openingHours',
  bank_id: 'bankId',
  account_no: 'accountNo',
  account_name: 'accountName',
  is_vat_enabled: 'isVatEnabled',
  vat_rate: 'vatRate',
  invoice_footer: 'invoiceFooter',
  default_paper_size: 'defaultPaperSize',
  backup_schedule: 'backupSchedule',
  default_unit_id: 'defaultUnitId',
  default_discount: 'defaultDiscount',
  default_shipping_fee: 'defaultShippingFee',

  // Setting fields
  setting_key: 'settingKey',
  setting_value: 'settingValue',

  // Common fields
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_at: 'deletedAt',
  is_deleted: 'isDeleted',
  created_by_user_id: 'createdByUserId',
  updated_by_user_id: 'updatedByUserId',

  // Order fields
  order_id: 'orderId',
  order_code: 'orderCode',
  order_date: 'orderDate',
  customer_id: 'customerId',
  payment_method_id: 'paymentMethodId',
  processed_by_user_id: 'processedByUserId',
  payment_details: 'paymentDetails',
  unit_price: 'unitPrice',
  total_price: 'totalPrice',

  // Payment fields
  paid_by_user_id: 'paidByUserId',
  amount: 'amount',

  // Product fields
  product_id: 'productId',
  product_unit_id: 'productUnitId',

  // Voucher fields
  points_cost: 'pointsCost',

  // Webhook fields
  event_type: 'eventType',
  status_code: 'statusCode',
  is_success: 'isSuccess',
  retry_count: 'retryCount',
  next_retry_at: 'nextRetryAt',

  // Inventory fields
  source_store_id: 'sourceStoreId',
  target_store_id: 'targetStoreId',
  approved_by_user_id: 'approvedByUserId',
  received_by_user_id: 'receivedByUserId',

  // File fields
  uploaded_by_user_id: 'uploadedByUserId',

  // Stock fields
  adjusted_by_user_id: 'adjustedByUserId',

  // Installment fields
  collected_by_user_id: 'collectedByUserId',

  // Price history fields
  changed_by_user_id: 'changedByUserId',

  // Supplier fields
  tax_code: 'taxCode',
  contact_person: 'contactPerson',

  // Category fields
  parent_id: 'parentId',

  // Customer fields
  ref_code: 'refCode',
  birthday: 'birthday',

  // Bank fields
  bank_code: 'bankCode',
  bank_name: 'bankName',

  // Unit fields
  unit_name: 'unitName',
  unit_symbol: 'unitSymbol',
};

// Function to process a single file
function processFile(filePath: string): void {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace field references in service files
  for (const [snakeCase, camelCase] of Object.entries(fieldMappings)) {
    // Replace property access (dto.field_name -> dto.fieldName)
    const propertyAccessRegex = new RegExp(`\\b(\\w+)\\.${snakeCase}\\b`, 'g');
    if (propertyAccessRegex.test(content)) {
      content = content.replace(propertyAccessRegex, `$1.${camelCase}`);
      modified = true;
    }

    // Replace object literal properties ({ field_name: value } -> { fieldName: value })
    const objectLiteralRegex = new RegExp(`\\{\\s*${snakeCase}\\s*:`, 'g');
    if (objectLiteralRegex.test(content)) {
      content = content.replace(objectLiteralRegex, `{ ${camelCase}:`);
      modified = true;
    }

    // Replace where clause properties (where: { field_name: value } -> where: { fieldName: value })
    const whereClauseRegex = new RegExp(
      `where:\\s*\\{\\s*${snakeCase}\\s*:`,
      'g',
    );
    if (whereClauseRegex.test(content)) {
      content = content.replace(whereClauseRegex, `where: { ${camelCase}:`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Function to find all service files
function findServiceFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findServiceFiles(fullPath));
    } else if (item.endsWith('.ts') && item.includes('.service.')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
function main() {
  const serviceDir = path.join(__dirname, '..', 'src', 'service');

  if (!fs.existsSync(serviceDir)) {
    console.error('Service directory not found:', serviceDir);
    return;
  }

  const serviceFiles = findServiceFiles(serviceDir);
  console.log(`Found ${serviceFiles.length} service files to process`);

  for (const file of serviceFiles) {
    try {
      processFile(file);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log('✅ TypeScript error fixes completed!');
}

if (require.main === module) {
  main();
}
