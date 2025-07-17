# Script to update controller imports in test files and modules
# Author: Copilot

Write-Host "=== Starting controller imports update ===" -ForegroundColor Green

# Define mapping for controller imports
$controllerMappings = @{
    "src/controller/payments.controller" = "src/modules/payments/controller/payments.controller"
    "src/controller/audit-logs.controller" = "src/modules/audit-logs/controller/audit-logs.controller"
    "src/controller/products.controller" = "src/modules/products/controller/products.controller"
    "src/controller/orders.controller" = "src/modules/orders/controller/orders.controller"
    "src/controller/customers.controller" = "src/modules/customers/controller/customers.controller"
    "src/controller/suppliers.controller" = "src/modules/suppliers/controller/suppliers.controller"
    "src/controller/stores.controller" = "src/modules/stores/controller/stores.controller"
    "src/controller/categories.controller" = "src/modules/categories/controller/categories.controller"
    "src/controller/users.controller" = "src/modules/users/controller/users.controller"
    "src/controller/vouchers.controller" = "src/modules/vouchers/controller/vouchers.controller"
    "src/controller/notifications.controller" = "src/modules/notifications/controller/notifications.controller"
    "src/controller/auth.controller" = "src/modules/auth/controller/auth.controller"
    "src/controller/return-orders.controller" = "src/modules/return-orders/controller/return-orders.controller"
    "src/controller/promotions.controller" = "src/modules/promotions/controller/promotions.controller"
    "src/controller/job-schedules.controller" = "src/modules/job-schedules/controller/job-schedules.controller"
    "src/controller/external-system-logs.controller" = "src/modules/external-system-logs/controller/external-system-logs.controller"
    "src/controller/file-attachments.controller" = "src/modules/file-attachments/controller/file-attachments.controller"
    "src/controller/webhook-logs.controller" = "src/modules/webhook-logs/controller/webhook-logs.controller"
    "src/controller/stock-adjustments.controller" = "src/modules/stock-adjustments/controller/stock-adjustments.controller"
    "src/controller/store-settings.controller" = "src/modules/store-settings/controller/store-settings.controller"
    "src/controller/price-histories.controller" = "src/modules/price-histories/controller/price-histories.controller"
    "src/controller/loyalty-point-logs.controller" = "src/modules/loyalty-point-logs/controller/loyalty-point-logs.controller"
    "src/controller/order-items.controller" = "src/modules/order-items/controller/order-items.controller"
}

# File patterns to check
$filePatterns = @("*.ts", "*.js")

# Statistics
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Searching and updating controller imports..." -ForegroundColor Yellow

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
            foreach ($oldPath in $controllerMappings.Keys) {
                $newPath = $controllerMappings[$oldPath]
                
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
$reportPath = "UPDATE_CONTROLLER_IMPORTS_REPORT.md"
$report = @"
# Update Controller Imports Report

**Date:** $(Get-Date)

## Summary
- Total files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Applied Mappings
"@

foreach ($oldPath in $controllerMappings.Keys) {
    $newPath = $controllerMappings[$oldPath]
    $report += "`n- ``$oldPath`` -> ``$newPath``"
}

$report += @"

## Result
All controller imports have been successfully updated!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Controller imports update completed ===" -ForegroundColor Green
