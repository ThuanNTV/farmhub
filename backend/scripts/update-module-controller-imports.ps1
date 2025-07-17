# Script to update module files to use local controller imports
# Author: Copilot

Write-Host "=== Starting module controller imports update ===" -ForegroundColor Green

# Get all module files
$moduleFiles = Get-ChildItem -Path "src/modules" -Filter "*.module.ts" -Recurse

$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Updating module files to use local controller imports..." -ForegroundColor Yellow

foreach ($file in $moduleFiles) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        $originalContent = $content
        $fileUpdated = $false
        
        # Get module name from file path
        $moduleName = $file.Directory.Name
        
        # Pattern to match controller imports from src/controller/
        $pattern = "import\s*\{\s*([^}]+)\s*\}\s*from\s*['\`"]src/controller/([^'\`"]+)['\`"]"
        
        if ($content -match $pattern) {
            # Replace with local controller import
            $content = $content -replace $pattern, "import { `$1 } from './controller/`$2'"
            $fileUpdated = $true
            
            # Count replacements
            $matches = [regex]::Matches($originalContent, $pattern).Count
            $totalReplacements += $matches
            
            Write-Host "  Updated $matches imports in $($file.Name)" -ForegroundColor Cyan
        }
        
        # Also check for relative imports like ../controller/
        $relativePattern = "import\s*\{\s*([^}]+)\s*\}\s*from\s*['\`"]\.\./controller/([^'\`"]+)['\`"]"
        
        if ($content -match $relativePattern) {
            # Replace with local controller import
            $content = $content -replace $relativePattern, "import { `$1 } from './controller/`$2'"
            $fileUpdated = $true
            
            # Count replacements
            $matches = [regex]::Matches($originalContent, $relativePattern).Count
            $totalReplacements += $matches
            
            Write-Host "  Updated $matches relative imports in $($file.Name)" -ForegroundColor Cyan
        }
        
        # Save file if changed
        if ($fileUpdated) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $updatedFiles++
            Write-Host "  Saved: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Update Results ===" -ForegroundColor Green
Write-Host "Total module files checked: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan

# Create report
$reportPath = "UPDATE_MODULE_CONTROLLER_IMPORTS_REPORT.md"
$report = @"
# Update Module Controller Imports Report

**Date:** $(Get-Date)

## Summary
- Total module files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Changes Made
- Updated imports from `src/controller/` to `./controller/`
- Updated imports from `../controller/` to `./controller/`

## Result
All module controller imports have been successfully updated to use local imports!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Module controller imports update completed ===" -ForegroundColor Green
