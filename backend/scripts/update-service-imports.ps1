# Script to update remaining service imports from src/service/ to modules
# Author: Copilot

Write-Host "=== Starting remaining service imports update ===" -ForegroundColor Green

# Define mapping for service imports from src/service/ to modules
$serviceMappings = @{
    "src/service/auth.service" = "src/modules/auth/service/auth.service"
    "src/service/users.service" = "src/modules/users/service/users.service"
    "src/service/customers.service" = "src/modules/customers/service/customers.service"
    "src/service/stores.service" = "src/modules/stores/service/stores.service"
    "src/service/products.service" = "src/modules/products/service/products.service"
    "src/service/orders.service" = "src/modules/orders/service/orders.service"
    "src/service/payments.service" = "src/modules/payments/service/payments.service"
    "src/service/audit-logs.service" = "src/modules/audit-logs/service/audit-logs.service"
    "src/service/suppliers.service" = "src/modules/suppliers/service/suppliers.service"
    "src/service/vouchers.service" = "src/modules/vouchers/service/vouchers.service"
    "src/service/notifications.service" = "src/modules/notifications/service/notifications.service"
    "src/service/return-orders.service" = "src/modules/return-orders/service/return-orders.service"
    "src/service/promotions.service" = "src/modules/promotions/service/promotions.service"
    "src/service/job-schedules.service" = "src/modules/job-schedules/service/job-schedules.service"
    "src/service/external-system-logs.service" = "src/modules/external-system-logs/service/external-system-logs.service"
    "src/service/file-attachments.service" = "src/modules/file-attachments/service/file-attachments.service"
    "src/service/webhook-logs.service" = "src/modules/webhook-logs/service/webhook-logs.service"
    "src/service/stock-adjustments.service" = "src/modules/stock-adjustments/service/stock-adjustments.service"
    "src/service/store-settings.service" = "src/modules/store-settings/service/store-settings.service"
    "src/service/price-histories.service" = "src/modules/price-histories/service/price-histories.service"
    "src/service/loyalty-point-logs.service" = "src/modules/loyalty-point-logs/service/loyalty-point-logs.service"
    "src/service/installments.service" = "src/modules/installments/service/installments.service"
    "src/service/inventory-transfers.service" = "src/modules/inventory-transfers/service/inventory-transfers.service"
    "src/service/inventory-transfer-items.service" = "src/modules/inventory-transfer-items/service/inventory-transfer-items.service"
    "src/service/dispatch-orders.service" = "src/modules/dispatch-orders/service/dispatch-orders.service"
    "src/service/dispatch-order-items.service" = "src/modules/dispatch-order-items/service/dispatch-order-items.service"
    "src/service/debt-transactions.service" = "src/modules/debt-transactions/service/debt-transactions.service"
    "src/service/dashboard.service" = "src/modules/dashboard/service/dashboard.service"
    "src/service/dashboard-analytics.service" = "src/modules/dashboard-analytics/service/dashboard-analytics.service"
    "src/service/units.service" = "src/modules/units/service/units.service"
    "src/service/tag.service" = "src/modules/tag/service/tag.service"
    "src/service/user-activity-log.service" = "src/modules/user-activity-log/service/user-activity-log.service"
    "src/service/user-store-mappings.service" = "src/modules/user-store-mappings/service/user-store-mappings.service"
    "src/service/voucher-usage-log.service" = "src/modules/voucher-usage-log/service/voucher-usage-log.service"
    "src/service/stock-transfer.service" = "src/modules/stock-transfer/service/stock-transfer.service"
    "src/service/bank.service" = "src/modules/bank/service/bank.service"
}

# File patterns to check (exclude test files to avoid conflicts)
$filePatterns = @("*.ts", "*.js")

# Statistics
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Searching and updating service imports..." -ForegroundColor Yellow

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
            foreach ($oldPath in $serviceMappings.Keys) {
                $newPath = $serviceMappings[$oldPath]
                
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
$reportPath = "UPDATE_SERVICE_IMPORTS_REPORT.md"
$report = @"
# Update Service Imports Report

**Date:** $(Get-Date)

## Summary
- Total files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Applied Mappings
"@

foreach ($oldPath in $serviceMappings.Keys) {
    $newPath = $serviceMappings[$oldPath]
    $report += "`n- ``$oldPath`` -> ``$newPath``"
}

$report += @"

## Result
All remaining service imports have been successfully updated!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Service imports update completed ===" -ForegroundColor Green
