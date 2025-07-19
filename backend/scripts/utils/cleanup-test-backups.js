#!/usr/bin/env node

/**
 * Script để dọn dẹp các file backup (.backup) được tạo ra khi thêm afterEach cleanup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Màu sắc cho console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findBackupFiles() {
  log('🔍 Tìm kiếm tất cả file backup...', 'blue');
  
  try {
    const command = 'Get-ChildItem -Path "src", "test" -Recurse -Include "*.backup" | ForEach-Object { $_.FullName }';
    const output = execSync(command, { 
      encoding: 'utf8',
      shell: 'powershell.exe'
    });
    
    if (!output.trim()) {
      return [];
    }
    
    const files = output.trim().split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0)
      .map(file => path.relative(process.cwd(), file));
    
    log(`✅ Tìm thấy ${files.length} file backup`, 'green');
    return files;
  } catch (error) {
    log(`❌ Lỗi khi tìm file backup: ${error.message}`, 'red');
    return [];
  }
}

function deleteBackupFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    log(`❌ Lỗi khi xóa file ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Bắt đầu dọn dẹp file backup...', 'bold');
  
  const backupFiles = findBackupFiles();
  if (backupFiles.length === 0) {
    log('✅ Không có file backup nào để dọn dẹp!', 'green');
    return;
  }
  
  let deletedCount = 0;
  let errorCount = 0;
  
  log('\n🗑️  Đang xóa file backup...', 'blue');
  
  backupFiles.forEach(filePath => {
    log(`🗑️  Đang xóa ${filePath}...`, 'yellow');
    if (deleteBackupFile(filePath)) {
      log(`✅ Đã xóa ${filePath}`, 'green');
      deletedCount++;
    } else {
      errorCount++;
    }
  });
  
  log('\n📊 Tổng kết:', 'bold');
  log(`✅ Đã xóa: ${deletedCount} file`, 'green');
  log(`❌ Lỗi: ${errorCount} file`, 'red');
  log(`📁 Tổng cộng: ${backupFiles.length} file`, 'blue');
  
  if (deletedCount > 0) {
    log('\n🎉 Hoàn thành dọn dẹp file backup!', 'green');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  findBackupFiles,
  deleteBackupFile
};
