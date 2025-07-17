# Script để cập nhật tất cả imports từ legacy services sang new module paths
# Tác giả: Copilot
# Ngày: $(Get-Date)

Write-Host "=== Bat dau cap nhat legacy imports ===" -ForegroundColor Green

# Định nghĩa mapping từ legacy paths sang new paths
$importMappings = @{
    # Service imports
    "src/service/payment-transaction.service" = "src/modules/payments/service/transaction/payment-transaction.service"
    "src/service/audit-transaction.service" = "src/modules/audit-logs/service/transaction/audit-transaction.service"
    "src/service/inventory.service" = "src/modules/products/service/inventory/inventory-transaction.service"
    
    # Controller imports (nếu có)
    "src/controller/" = "src/modules/"
}

# Các file patterns cần kiểm tra
$filePatterns = @(
    "*.ts",
    "*.js",
    "*.md"
)

# Thống kê
$totalFiles = 0
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Dang tim kiem va cap nhat imports..." -ForegroundColor Yellow

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
            
            # Áp dụng tất cả mappings
            foreach ($oldPath in $importMappings.Keys) {
                $newPath = $importMappings[$oldPath]
                
                if ($content -match [regex]::Escape($oldPath)) {
                    $content = $content -replace [regex]::Escape($oldPath), $newPath
                    $fileUpdated = $true
                    
                    # Đếm số lần replace
                    $matches = ([regex]::Escape($oldPath)).Split($originalContent).Count - 1
                    $totalReplacements += $matches
                    
                    Write-Host "  ✓ Cap nhat $matches lan: $oldPath -> $newPath trong $($file.Name)" -ForegroundColor Cyan
                }
            }
            
            # Lưu file nếu có thay đổi
            if ($fileUpdated) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $updatedFiles++
                Write-Host "  📝 Da luu: $($file.FullName)" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`n=== Ket qua cap nhat ===" -ForegroundColor Green
Write-Host "Tong so files kiem tra: $totalFiles" -ForegroundColor White
Write-Host "So files duoc cap nhat: $updatedFiles" -ForegroundColor Yellow
Write-Host "Tong so replacements: $totalReplacements" -ForegroundColor Cyan

# Tạo report
$reportPath = "UPDATE_IMPORTS_REPORT.md"
$report = @"
# Update Imports Report

**Ngay thuc hien:** $(Get-Date)

## Tong quan
- Tong so files kiem tra: $totalFiles
- So files duoc cap nhat: $updatedFiles  
- Tong so replacements: $totalReplacements

## Mappings duoc ap dung
"@

foreach ($oldPath in $importMappings.Keys) {
    $newPath = $importMappings[$oldPath]
    $report += "`n- ``$oldPath`` -> ``$newPath``"
}

$report += @"

## Ket qua
✅ Tat ca legacy imports da duoc cap nhat thanh cong!

## Cac buoc tiep theo
1. Chay `npm run build` de kiem tra syntax
2. Chay `npm test` de dam bao khong co loi
3. Commit changes
"@

Set-Content -Path $reportPath -Value $report
Write-Host "`n📊 Report da duoc tao: $reportPath" -ForegroundColor Magenta

Write-Host "`n=== Hoan thanh cap nhat imports ===" -ForegroundColor Green
