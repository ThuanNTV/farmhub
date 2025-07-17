# Script to update module imports from src/module/ to src/modules/
# Author: Copilot

Write-Host "=== Starting module imports update ===" -ForegroundColor Green

# Simple mapping from src/module/ to src/modules/
$modulePattern = "src/module/"
$moduleReplacement = "src/modules/"

# File patterns to check
$filePatterns = @("*.ts", "*.js")

# Statistics
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Searching and updating module imports..." -ForegroundColor Yellow

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
            
            # Check if file contains the old pattern
            if ($content -match [regex]::Escape($modulePattern)) {
                $content = $content -replace [regex]::Escape($modulePattern), $moduleReplacement
                $fileUpdated = $true
                
                # Count replacements
                $matches = ([regex]::Escape($modulePattern)).Split($originalContent).Count - 1
                $totalReplacements += $matches
                
                Write-Host "  Updated $matches times: $modulePattern -> $moduleReplacement in $($file.Name)" -ForegroundColor Cyan
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
$reportPath = "UPDATE_MODULE_IMPORTS_REPORT.md"
$report = @"
# Update Module Imports Report

**Date:** $(Get-Date)

## Summary
- Total files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Changes Made
- Updated imports from ``$modulePattern`` to ``$moduleReplacement``

## Result
All module imports have been successfully updated from src/module/ to src/modules/!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Module imports update completed ===" -ForegroundColor Green
