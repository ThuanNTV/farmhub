# PowerShell Script to Cleanup Duplicate Modules

Write-Host "🧹 Starting Module Cleanup..." -ForegroundColor Green

# Define modules to remove (empty service folders)
$modulesToRemove = @(
    "audit-log",
    "customer", 
    "product",
    "order",
    "payment",
    "external-system-log",
    "supplier",
    "store",
    "category",
    "user",
    "unit",
    "voucher",
    "file",
    "job-schedule",
    "return-order"
)

# Base path
$basePath = "d:\Workspaces\Test\backend\src\modules"

# Check and remove duplicate modules
foreach ($module in $modulesToRemove) {
    $modulePath = Join-Path $basePath $module
    $servicePath = Join-Path $modulePath "service"
    
    if (Test-Path $modulePath) {
        Write-Host "Checking module: $module" -ForegroundColor Yellow
        
        # Check if service folder exists and is empty
        if (Test-Path $servicePath) {
            $serviceFiles = Get-ChildItem -Path $servicePath -Force
            
            if ($serviceFiles.Count -eq 0) {
                Write-Host "  ❌ Service folder is empty - REMOVING" -ForegroundColor Red
                Remove-Item -Path $modulePath -Recurse -Force
                Write-Host "  ✅ Removed: $module" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Service folder has files - KEEPING" -ForegroundColor Cyan
            }
        } else {
            Write-Host "  ❌ No service folder - REMOVING" -ForegroundColor Red
            Remove-Item -Path $modulePath -Recurse -Force
            Write-Host "  ✅ Removed: $module" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  Module not found: $module" -ForegroundColor Gray
    }
}

Write-Host "🎉 Cleanup completed!" -ForegroundColor Green

# List remaining modules
Write-Host "📋 Remaining modules:" -ForegroundColor Blue
Get-ChildItem -Path $basePath -Directory | Sort-Object Name | ForEach-Object {
    $hasModule = Test-Path (Join-Path $_.FullName "*.module.ts")
    $hasService = (Get-ChildItem -Path (Join-Path $_.FullName "service") -ErrorAction SilentlyContinue).Count -gt 0
    
    if ($hasModule -and $hasService) {
        Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
    } elseif ($hasModule) {
        Write-Host "  ⚠️ $($_.Name) (has module, no service)" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ $($_.Name) (incomplete)" -ForegroundColor Red
    }
}
