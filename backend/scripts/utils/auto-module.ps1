# Đường dẫn gốc
$src = "src"
$modulesRoot = "$src\modules"

# 1. Quét tất cả controller
$controllers = Get-ChildItem "$src\controller\*.controller.ts"

foreach ($ctrl in $controllers) {
    # Lấy tên module từ tên file
    $module = $ctrl.BaseName -replace '\.controller$', ''

    # Tạo thư mục module hóa
    $modulePath = "$modulesRoot\$module"
    New-Item -ItemType Directory -Force -Path "$modulePath\controller"
    New-Item -ItemType Directory -Force -Path "$modulePath\service"
    New-Item -ItemType Directory -Force -Path "$modulePath\dto"

    # Di chuyển controller
    Move-Item $ctrl.FullName "$modulePath\controller\" -Force

    # Di chuyển service nếu có
    $servicePath = "$src\service\$module.service.ts"
    if (Test-Path $servicePath) {
        Move-Item $servicePath "$modulePath\service\" -Force
    }

    # Di chuyển dto nếu có
    $dtoDir = "$src\dto\dto$($module.Substring(0,1).ToUpper()+$module.Substring(1))"
    if (Test-Path $dtoDir) {
        Move-Item "$dtoDir\*" "$modulePath\dto\" -Force
        Remove-Item $dtoDir -Force
    }

    # Di chuyển module file nếu có
    $moduleFile = "$src\module\$module.module.ts"
    if (Test-Path $moduleFile) {
        Move-Item $moduleFile "$modulePath\" -Force
    }
}

Write-Host "Đã tự động module hóa xong tất cả các domain!"