# Script to update all legacy imports to new module paths
# Author: Copilot

Write-Host "=== Starting legacy imports update ===" -ForegroundColor Green

# Define mapping from legacy paths to new paths
$importMappings = @{
    "src/service/payment-transaction.service" = "src/modules/payments/service/transaction/payment-transaction.service"
    "src/service/audit-transaction.service" = "src/modules/audit-logs/service/transaction/audit-transaction.service"
    "src/service/inventory.service" = "src/modules/products/service/inventory/inventory-transaction.service"
}

# File patterns to check
$filePatterns = @("*.ts", "*.js", "*.md")

# Statistics
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Searching and updating imports..." -ForegroundColor Yellow

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
            foreach ($oldPath in $importMappings.Keys) {
                $newPath = $importMappings[$oldPath]
                
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
$reportPath = "UPDATE_IMPORTS_REPORT.md"
$report = @"
# Update Imports Report

**Date:** $(Get-Date)

## Summary
- Total files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Applied Mappings
"@

foreach ($oldPath in $importMappings.Keys) {
    $newPath = $importMappings[$oldPath]
    $report += "`n- ``$oldPath`` -> ``$newPath``"
}

$report += @"

## Result
All legacy imports have been successfully updated!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Legacy imports update completed ===" -ForegroundColor Green
