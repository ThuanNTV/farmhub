# Backend Project Health Check

Write-Host "🔍 Backend Project Health Check..." -ForegroundColor Green

# Check modules
Write-Host "`n📁 Checking modules..." -ForegroundColor Blue
$basePath = "d:\Workspaces\Test\backend\src\modules"
$modules = Get-ChildItem -Path $basePath -Directory | Where-Object { $_.Name -notlike "*.md" } | Sort-Object Name

$completeModules = 0
$refactoredModules = 0

foreach ($module in $modules) {
    $modulePath = $module.FullName
    $moduleFile = Get-ChildItem -Path $modulePath -Filter "*.module.ts" -ErrorAction SilentlyContinue
    $serviceFiles = Get-ChildItem -Path (Join-Path $modulePath "service") -Filter "*.ts" -ErrorAction SilentlyContinue
    $hasTransactionFolder = Test-Path (Join-Path $modulePath "service\transaction")
    $hasInventoryFolder = Test-Path (Join-Path $modulePath "service\inventory")
    
    $hasModule = $moduleFile.Count -gt 0
    $hasService = $serviceFiles.Count -gt 0
    
    if ($hasModule -and $hasService) {
        $completeModules++
        
        if ($hasTransactionFolder -or $hasInventoryFolder) {
            $refactoredModules++
            Write-Host "  🏆 $($module.Name) (refactored)" -ForegroundColor Cyan
        } else {
            Write-Host "  ✅ $($module.Name)" -ForegroundColor Green
        }
    }
}

# Check entities
Write-Host "`n🗄️ Checking entities..." -ForegroundColor Blue
$entitiesPath = "d:\Workspaces\Test\backend\src\entities"
$globalEntities = Get-ChildItem -Path (Join-Path $entitiesPath "global") -Filter "*.ts" -ErrorAction SilentlyContinue
$tenantEntities = Get-ChildItem -Path (Join-Path $entitiesPath "tenant") -Filter "*.ts" -ErrorAction SilentlyContinue

Write-Host "  📊 Global entities: $($globalEntities.Count)" -ForegroundColor White
Write-Host "  📊 Tenant entities: $($tenantEntities.Count)" -ForegroundColor White

# Check DTOs
Write-Host "`n📝 Checking DTOs..." -ForegroundColor Blue
$dtoPath = "d:\Workspaces\Test\backend\src\dto"
$dtoFolders = Get-ChildItem -Path $dtoPath -Directory -ErrorAction SilentlyContinue

Write-Host "  📊 DTO categories: $($dtoFolders.Count)" -ForegroundColor White

# Check scripts
Write-Host "`n🔧 Checking scripts..." -ForegroundColor Blue
$scriptsPath = "d:\Workspaces\Test\backend\scripts"
$scriptFiles = Get-ChildItem -Path $scriptsPath -Filter "*.ts" -ErrorAction SilentlyContinue
$psScripts = Get-ChildItem -Path $scriptsPath -Filter "*.ps1" -ErrorAction SilentlyContinue

Write-Host "  📊 TypeScript scripts: $($scriptFiles.Count)" -ForegroundColor White
Write-Host "  📊 PowerShell scripts: $($psScripts.Count)" -ForegroundColor White

# Summary
Write-Host "`n📊 PROJECT HEALTH SUMMARY:" -ForegroundColor Yellow
Write-Host "  ✅ Complete modules: $completeModules" -ForegroundColor Green
Write-Host "  🏆 Refactored modules: $refactoredModules" -ForegroundColor Cyan
Write-Host "  🗄️ Total entities: $($globalEntities.Count + $tenantEntities.Count)" -ForegroundColor White
Write-Host "  📝 DTO categories: $($dtoFolders.Count)" -ForegroundColor White
Write-Host "  🔧 Scripts: $($scriptFiles.Count + $psScripts.Count)" -ForegroundColor White

$healthScore = [math]::Round(($completeModules / $modules.Count) * 100, 1)
Write-Host "`n🎯 PROJECT HEALTH SCORE: $healthScore%" -ForegroundColor $(if ($healthScore -eq 100) { "Green" } else { "Yellow" })

if ($healthScore -eq 100) {
    Write-Host "🎉 EXCELLENT! All modules are complete and healthy!" -ForegroundColor Green
} elseif ($healthScore -gt 90) {
    Write-Host "👍 GOOD! Most modules are complete." -ForegroundColor Yellow
} else {
    Write-Host "⚠️ NEEDS ATTENTION! Some modules need work." -ForegroundColor Red
}

Write-Host "`n✨ Health check completed!" -ForegroundColor Green
