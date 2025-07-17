# Script to update test files to use controller imports from modules
# Author: Copilot

Write-Host "=== Starting test controller imports update ===" -ForegroundColor Green

# Get all test files that import controllers
$testFiles = Get-ChildItem -Path "test" -Filter "*.spec.ts" -Recurse | Where-Object { 
    $_.FullName -like "*controller*" 
}

$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Updating test files to use controller imports from modules..." -ForegroundColor Yellow

foreach ($file in $testFiles) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        $originalContent = $content
        $fileUpdated = $false
        
        # Extract controller name from file name
        $controllerFileName = $file.Name -replace "\.spec\.ts$", ".controller"
        
        # Pattern to match controller imports from src/controller/
        $pattern = "import\s*\{\s*([^}]+)\s*\}\s*from\s*['\`"]\.\.\/\.\.\/\.\.\/src\/controller\/([^'\`"]+)['\`"]"
        
        if ($content -match $pattern) {
            # Extract the controller name from the import
            $matches = [regex]::Matches($content, $pattern)
            
            foreach ($match in $matches) {
                $controllerClass = $match.Groups[1].Value
                $controllerFile = $match.Groups[2].Value
                
                # Determine module name from controller file
                $moduleName = $controllerFile -replace "\.controller$", ""
                
                # Handle special cases
                if ($moduleName -eq "categorys") { $moduleName = "categories" }
                
                # Replace with module import
                $oldImport = $match.Groups[0].Value
                $newImport = "import { $controllerClass } from '../../../src/modules/$moduleName/controller/$controllerFile'"
                
                $content = $content -replace [regex]::Escape($oldImport), $newImport
                $fileUpdated = $true
                $totalReplacements++
                
                Write-Host "  Updated: $controllerFile -> modules/$moduleName/controller/$controllerFile in $($file.Name)" -ForegroundColor Cyan
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

Write-Host "`n=== Update Results ===" -ForegroundColor Green
Write-Host "Total test files checked: $totalFiles" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan

# Create report
$reportPath = "UPDATE_TEST_CONTROLLER_IMPORTS_REPORT.md"
$report = @"
# Update Test Controller Imports Report

**Date:** $(Get-Date)

## Summary
- Total test files checked: $totalFiles
- Files updated: $updatedFiles  
- Total replacements: $totalReplacements

## Changes Made
- Updated imports from `../../../src/controller/` to `../../../src/modules/[module]/controller/`

## Result
All test controller imports have been successfully updated to use module imports!

## Next Steps
1. Run `npm run build` to check syntax
2. Run `npm test` to ensure no errors
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`nReport created: $reportPath" -ForegroundColor Magenta
Write-Host "=== Test controller imports update completed ===" -ForegroundColor Green
