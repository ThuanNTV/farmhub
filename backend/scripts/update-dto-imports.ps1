# Script to update DTO imports from src/dto/ to modules
# Author: Copilot

Write-Host "=== Starting DTO imports update ===" -ForegroundColor Green

# Define mapping for DTO imports from src/dto/ to modules
$dtoMappings = @{
    # Auth DTOs
    "src/dto/dtoAuth/auth.dto" = "src/modules/auth/dto/auth.dto"
    "src/dto/dtoAuth/login.dto" = "src/modules/auth/dto/login.dto"
    "src/dto/dtoAuth/register.dto" = "src/modules/auth/dto/register.dto"
    
    # User DTOs
    "src/dto/dtoUsers/create-user.dto" = "src/modules/users/dto/create-user.dto"
    "src/dto/dtoUsers/update-user.dto" = "src/modules/users/dto/update-user.dto"
    "src/dto/dtoUsers/user-response.dto" = "src/modules/users/dto/user-response.dto"
    
    # Customer DTOs
    "src/dto/dtoCustomers/create-customer.dto" = "src/modules/customers/dto/create-customer.dto"
    "src/dto/dtoCustomers/update-customer.dto" = "src/modules/customers/dto/update-customer.dto"
    "src/dto/dtoCustomers/customer-response.dto" = "src/modules/customers/dto/customer-response.dto"
    
    # Store DTOs
    "src/dto/dtoStores/create-store.dto" = "src/modules/stores/dto/create-store.dto"
    "src/dto/dtoStores/update-store.dto" = "src/modules/stores/dto/update-store.dto"
    "src/dto/dtoStores/store-response.dto" = "src/modules/stores/dto/store-response.dto"
    
    # Product DTOs
    "src/dto/dtoProducts/create-product.dto" = "src/modules/products/dto/create-product.dto"
    "src/dto/dtoProducts/update-product.dto" = "src/modules/products/dto/update-product.dto"
    "src/dto/dtoProducts/product-response.dto" = "src/modules/products/dto/product-response.dto"
    
    # Order DTOs
    "src/dto/dtoOrders/create-order.dto" = "src/modules/orders/dto/create-order.dto"
    "src/dto/dtoOrders/update-order.dto" = "src/modules/orders/dto/update-order.dto"
    "src/dto/dtoOrders/order-response.dto" = "src/modules/orders/dto/order-response.dto"
    "src/dto/dtoOrders/create-order-atomic.dto" = "src/modules/orders/dto/create-order-atomic.dto"
    
    # Payment DTOs
    "src/dto/dtoPayments/create-payment.dto" = "src/modules/payments/dto/create-payment.dto"
    "src/dto/dtoPayments/update-payment.dto" = "src/modules/payments/dto/update-payment.dto"
    "src/dto/dtoPayments/payment-response.dto" = "src/modules/payments/dto/payment-response.dto"
    
    # Audit DTOs
    "src/dto/dtoAuditLogs/create-audit-log.dto" = "src/modules/audit-logs/dto/create-audit-log.dto"
    "src/dto/dtoAuditLogs/update-audit-log.dto" = "src/modules/audit-logs/dto/update-audit-log.dto"
    "src/dto/dtoAuditLogs/audit-log-response.dto" = "src/modules/audit-logs/dto/audit-log-response.dto"
    
    # Supplier DTOs
    "src/dto/dtoSuppliers/create-supplier.dto" = "src/modules/suppliers/dto/create-supplier.dto"
    "src/dto/dtoSuppliers/update-supplier.dto" = "src/modules/suppliers/dto/update-supplier.dto"
    "src/dto/dtoSuppliers/supplier-response.dto" = "src/modules/suppliers/dto/supplier-response.dto"
    
    # Voucher DTOs
    "src/dto/dtoVouchers/create-voucher.dto" = "src/modules/vouchers/dto/create-voucher.dto"
    "src/dto/dtoVouchers/update-voucher.dto" = "src/modules/vouchers/dto/update-voucher.dto"
    "src/dto/dtoVouchers/voucher-response.dto" = "src/modules/vouchers/dto/voucher-response.dto"
    
    # Notification DTOs
    "src/dto/dtoNotifications/create-notification.dto" = "src/modules/notifications/dto/create-notification.dto"
    "src/dto/dtoNotifications/update-notification.dto" = "src/modules/notifications/dto/update-notification.dto"
    "src/dto/dtoNotifications/notification-response.dto" = "src/modules/notifications/dto/notification-response.dto"
    
    # Return Order DTOs
    "src/dto/dtoReturnOrders/create-return-order.dto" = "src/modules/return-orders/dto/create-return-order.dto"
    "src/dto/dtoReturnOrders/update-return-order.dto" = "src/modules/return-orders/dto/update-return-order.dto"
    "src/dto/dtoReturnOrders/return-order-response.dto" = "src/modules/return-orders/dto/return-order-response.dto"
    
    # Promotion DTOs
    "src/dto/dtoPromotions/create-promotion.dto" = "src/modules/promotions/dto/create-promotion.dto"
    "src/dto/dtoPromotions/update-promotion.dto" = "src/modules/promotions/dto/update-promotion.dto"
    "src/dto/dtoPromotions/promotion-response.dto" = "src/modules/promotions/dto/promotion-response.dto"
    
    # Job Schedule DTOs
    "src/dto/dtoJobSchedules/create-job-schedule.dto" = "src/modules/job-schedules/dto/create-job-schedule.dto"
    "src/dto/dtoJobSchedules/update-job-schedule.dto" = "src/modules/job-schedules/dto/update-job-schedule.dto"
    "src/dto/dtoJobSchedules/job-schedule-response.dto" = "src/modules/job-schedules/dto/job-schedule-response.dto"
    
    # External System Log DTOs
    "src/dto/dtoExternalSystemLogs/create-external-system-log.dto" = "src/modules/external-system-logs/dto/create-external-system-log.dto"
    "src/dto/dtoExternalSystemLogs/update-external-system-log.dto" = "src/modules/external-system-logs/dto/update-external-system-log.dto"
    "src/dto/dtoExternalSystemLogs/external-system-log-response.dto" = "src/modules/external-system-logs/dto/external-system-log-response.dto"
    
    # File Attachment DTOs
    "src/dto/dtoFileAttachments/create-file-attachment.dto" = "src/modules/file-attachments/dto/create-file-attachment.dto"
    "src/dto/dtoFileAttachments/update-file-attachment.dto" = "src/modules/file-attachments/dto/update-file-attachment.dto"
    "src/dto/dtoFileAttachments/file-attachment-response.dto" = "src/modules/file-attachments/dto/file-attachment-response.dto"
    
    # Webhook Log DTOs
    "src/dto/dtoWebhookLogs/create-webhook-log.dto" = "src/modules/webhook-logs/dto/create-webhook-log.dto"
    "src/dto/dtoWebhookLogs/update-webhook-log.dto" = "src/modules/webhook-logs/dto/update-webhook-log.dto"
    "src/dto/dtoWebhookLogs/webhook-log-response.dto" = "src/modules/webhook-logs/dto/webhook-log-response.dto"
    
    # Stock Adjustment DTOs
    "src/dto/dtoStockAdjustments/create-stock-adjustment.dto" = "src/modules/stock-adjustments/dto/create-stock-adjustment.dto"
    "src/dto/dtoStockAdjustments/update-stock-adjustment.dto" = "src/modules/stock-adjustments/dto/update-stock-adjustment.dto"
    "src/dto/dtoStockAdjustments/stock-adjustment-response.dto" = "src/modules/stock-adjustments/dto/stock-adjustment-response.dto"
    
    # Store Setting DTOs
    "src/dto/dtoStoreSettings/create-store-setting.dto" = "src/modules/store-settings/dto/create-store-setting.dto"
    "src/dto/dtoStoreSettings/update-store-setting.dto" = "src/modules/store-settings/dto/update-store-setting.dto"
    "src/dto/dtoStoreSettings/store-setting-response.dto" = "src/modules/store-settings/dto/store-setting-response.dto"
    
    # Price History DTOs
    "src/dto/dtoPriceHistories/create-price-history.dto" = "src/modules/price-histories/dto/create-price-history.dto"
    "src/dto/dtoPriceHistories/update-price-history.dto" = "src/modules/price-histories/dto/update-price-history.dto"
    "src/dto/dtoPriceHistories/price-history-response.dto" = "src/modules/price-histories/dto/price-history-response.dto"
    
    # Loyalty Point Log DTOs
    "src/dto/dtoLoyaltyPointLogs/create-loyalty-point-log.dto" = "src/modules/loyalty-point-logs/dto/create-loyalty-point-log.dto"
    "src/dto/dtoLoyaltyPointLogs/update-loyalty-point-log.dto" = "src/modules/loyalty-point-logs/dto/update-loyalty-point-log.dto"
    "src/dto/dtoLoyaltyPointLogs/loyalty-point-log-response.dto" = "src/modules/loyalty-point-logs/dto/loyalty-point-log-response.dto"
    
    # Installment DTOs
    "src/dto/dtoInstallments/create-installment.dto" = "src/modules/installments/dto/create-installment.dto"
    "src/dto/dtoInstallments/update-installment.dto" = "src/modules/installments/dto/update-installment.dto"
    "src/dto/dtoInstallments/installment-response.dto" = "src/modules/installments/dto/installment-response.dto"
    
    # Inventory Transfer DTOs
    "src/dto/dtoInventoryTransfers/create-inventory-transfer.dto" = "src/modules/inventory-transfers/dto/create-inventory-transfer.dto"
    "src/dto/dtoInventoryTransfers/update-inventory-transfer.dto" = "src/modules/inventory-transfers/dto/update-inventory-transfer.dto"
    "src/dto/dtoInventoryTransfers/inventory-transfer-response.dto" = "src/modules/inventory-transfers/dto/inventory-transfer-response.dto"
    
    # Dispatch Order DTOs
    "src/dto/dtoDispatchOrders/create-dispatch-order.dto" = "src/modules/dispatch-orders/dto/create-dispatch-order.dto"
    "src/dto/dtoDispatchOrders/update-dispatch-order.dto" = "src/modules/dispatch-orders/dto/update-dispatch-order.dto"
    "src/dto/dtoDispatchOrders/dispatch-order-response.dto" = "src/modules/dispatch-orders/dto/dispatch-order-response.dto"
    
    # Debt Transaction DTOs
    "src/dto/dtoDebtTransactions/create-debt-transaction.dto" = "src/modules/debt-transactions/dto/create-debt-transaction.dto"
    "src/dto/dtoDebtTransactions/update-debt-transaction.dto" = "src/modules/debt-transactions/dto/update-debt-transaction.dto"
    "src/dto/dtoDebtTransactions/debt-transaction-response.dto" = "src/modules/debt-transactions/dto/debt-transaction-response.dto"
    
    # Unit DTOs
    "src/dto/dtoUnit/create-unit.dto" = "src/modules/units/dto/create-unit.dto"
    "src/dto/dtoUnit/update-unit.dto" = "src/modules/units/dto/update-unit.dto"
    "src/dto/dtoUnit/unit-response.dto" = "src/modules/units/dto/unit-response.dto"
    
    # Tag DTOs
    "src/dto/dtoTag/create-tag.dto" = "src/modules/tag/dto/create-tag.dto"
    "src/dto/dtoTag/update-tag.dto" = "src/modules/tag/dto/update-tag.dto"
    "src/dto/dtoTag/tag-response.dto" = "src/modules/tag/dto/tag-response.dto"
    
    # User Store Mapping DTOs
    "src/dto/dtoUserStoreMapping/create-userStoreMapping.dto" = "src/modules/user-store-mappings/dto/create-userStoreMapping.dto"
    "src/dto/dtoUserStoreMapping/update-userStoreMapping.dto" = "src/modules/user-store-mappings/dto/update-userStoreMapping.dto"
    "src/dto/dtoUserStoreMapping/userStoreMapping-response.dto" = "src/modules/user-store-mappings/dto/userStoreMapping-response.dto"
    
    # Voucher Usage Log DTOs
    "src/dto/dtoVoucherUsageLog/create-voucherUsageLog.dto" = "src/modules/voucher-usage-log/dto/create-voucherUsageLog.dto"
    "src/dto/dtoVoucherUsageLog/update-voucherUsageLog.dto" = "src/modules/voucher-usage-log/dto/update-voucherUsageLog.dto"
    "src/dto/dtoVoucherUsageLog/voucherUsageLog-response.dto" = "src/modules/voucher-usage-log/dto/voucherUsageLog-response.dto"
    
    # Stock Transfer DTOs
    "src/dto/dtoStockTransfer/create-stockTransfer.dto" = "src/modules/stock-transfer/dto/create-stockTransfer.dto"
    "src/dto/dtoStockTransfer/update-stockTransfer.dto" = "src/modules/stock-transfer/dto/update-stockTransfer.dto"
    "src/dto/dtoStockTransfer/stockTransfer-response.dto" = "src/modules/stock-transfer/dto/stockTransfer-response.dto"
}

# File patterns to check (exclude test files to avoid conflicts)
$filePatterns = @("*.ts", "*.js")

# Statistics
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Searching and updating DTO imports..." -ForegroundColor Yellow

foreach ($pattern in $filePatterns) {
    $files = Get-ChildItem -Path "." -Filter $pattern -Recurse | Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*dist*" -and
        $_.FullName -notlike "*coverage*" -and
        $_.FullName -notlike "*.git*"
    }
    
    foreach ($file in $files) {
        $totalFiles++
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            $originalContent = $content
            $fileUpdated = $false
            
            # Apply all mappings
            foreach ($oldPath in $dtoMappings.Keys) {
                $newPath = $dtoMappings[$oldPath]
                
                if ($content -match [regex]::Escape($oldPath)) {
                    $content = $content -replace [regex]::Escape($oldPath), $newPath
                    $fileUpdated = $true
                    
                    # Count replacements
                    $matches = ([regex]::Escape($oldPath)).Split($originalContent).Count - 1
                    $totalReplacements += $matches
                    
                    Write-Host "  Updated $matches times: $oldPath -> $newPath in $($file.Name)" -ForegroundColor Cyan
                }
            }
            
            # Save file if changed
            if ($fileUpdated) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $updatedFiles++
                Write-Host "  Saved: $($file.FullName)" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`n=== Update Results ===" -ForegroundColor Green
Write-Host "Total files checked: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan

# Create report
$reportPath = "UPDATE_DTO_IMPORTS_REPORT.md"
$report = @"
# Update DTO Imports Report

**Date:** $(Get-Date)

## Summary
- Total files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Applied Mappings
"@

foreach ($oldPath in $dtoMappings.Keys) {
    $newPath = $dtoMappings[$oldPath]
    $report += "`n- ``$oldPath`` -> ``$newPath``"
}

$report += @"

## Result
All DTO imports have been successfully updated!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== DTO imports update completed ===" -ForegroundColor Green
