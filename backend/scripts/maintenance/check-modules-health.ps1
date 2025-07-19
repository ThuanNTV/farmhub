# Check remaining modules health

Write-Host "Checking remaining modules health..." -ForegroundColor Green

$basePath = "d:\Workspaces\Test\backend\src\modules"
$modules = Get-ChildItem -Path $basePath -Directory | Sort-Object Name

$completeModules = @()
$incompleteModules = @()

foreach ($module in $modules) {
    # Skip markdown files
    if ($module.Name -like "*.md") {
        continue
    }
    
    $modulePath = $module.FullName
    $moduleFile = Get-ChildItem -Path $modulePath -Filter "*.module.ts" -ErrorAction SilentlyContinue
    $serviceFiles = Get-ChildItem -Path (Join-Path $modulePath "service") -Filter "*.ts" -ErrorAction SilentlyContinue
    $controllerFiles = Get-ChildItem -Path (Join-Path $modulePath "controller") -Filter "*.ts" -ErrorAction SilentlyContinue
    
    $hasModule = $moduleFile.Count -gt 0
    $hasService = $serviceFiles.Count -gt 0
    $hasController = $controllerFiles.Count -gt 0
    
    if ($hasModule -and $hasService -and $hasController) {
        Write-Host "  ✅ $($module.Name)" -ForegroundColor Green
        $completeModules += $module.Name
    } elseif ($hasModule -and $hasService) {
        Write-Host "  ⚠️ $($module.Name) (no controller)" -ForegroundColor Yellow
        $incompleteModules += $module.Name
    } elseif ($hasModule) {
        Write-Host "  ⚠️ $($module.Name) (no service)" -ForegroundColor Yellow
        $incompleteModules += $module.Name
    } else {
        Write-Host "  ❌ $($module.Name) (no module file)" -ForegroundColor Red
        $incompleteModules += $module.Name
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Complete modules: $($completeModules.Count)" -ForegroundColor Green
Write-Host "  Incomplete modules: $($incompleteModules.Count)" -ForegroundColor Yellow
Write-Host "  Total modules: $($modules.Count - 1)" -ForegroundColor Blue  # -1 for CLEANUP_ANALYSIS.md
