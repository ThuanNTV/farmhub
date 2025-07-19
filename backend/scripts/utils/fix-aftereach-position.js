#!/usr/bin/env node

/**
 * Script để sửa lại vị trí của afterEach() trong các file test
 * Đặt afterEach sau beforeEach thay vì trước
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

function findTestFiles() {
  log('🔍 Tìm kiếm tất cả file test...', 'blue');
  
  try {
    const command = 'Get-ChildItem -Path "src", "test" -Recurse -Include "*.spec.ts", "*.test.ts" | ForEach-Object { $_.FullName }';
    const output = execSync(command, { 
      encoding: 'utf8',
      shell: 'powershell.exe'
    });
    
    const files = output.trim().split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0)
      .map(file => path.relative(process.cwd(), file));
    
    log(`✅ Tìm thấy ${files.length} file test`, 'green');
    return files;
  } catch (error) {
    log(`❌ Lỗi khi tìm file test: ${error.message}`, 'red');
    return [];
  }
}

function fixAfterEachPosition(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Kiểm tra xem có afterEach ở vị trí sai không
    const wrongPositionPattern = /describe\s*\(\s*['"`][^'"`]*['"`]\s*,\s*\(\s*\)\s*=>\s*\{\s*afterEach\s*\(\s*\(\s*\)\s*=>\s*\{\s*jest\.clearAllMocks\s*\(\s*\)\s*;\s*\}\s*\)\s*;/;
    
    if (!wrongPositionPattern.test(content)) {
      return false; // Không cần sửa
    }
    
    log(`🔧 Đang sửa vị trí afterEach trong ${filePath}...`, 'blue');
    
    // Tìm và di chuyển afterEach
    let newContent = content;
    
    // Pattern để tìm afterEach ở vị trí sai (ngay sau describe)
    const afterEachWrongPattern = /(\s*afterEach\s*\(\s*\(\s*\)\s*=>\s*\{\s*jest\.clearAllMocks\s*\(\s*\)\s*;\s*\}\s*\)\s*;\s*)/;
    const afterEachMatch = newContent.match(afterEachWrongPattern);
    
    if (afterEachMatch) {
      // Xóa afterEach ở vị trí cũ
      newContent = newContent.replace(afterEachWrongPattern, '');
      
      // Tìm beforeEach để chèn afterEach sau nó
      const beforeEachPattern = /(beforeEach\s*\([\s\S]*?\}\s*\)\s*;)/;
      const beforeEachMatch = newContent.match(beforeEachPattern);
      
      if (beforeEachMatch) {
        // Chèn afterEach sau beforeEach
        const insertPosition = beforeEachMatch.index + beforeEachMatch[0].length;
        const afterEachCode = '\n\n  afterEach(() => {\n    jest.clearAllMocks();\n  });';
        
        newContent = newContent.slice(0, insertPosition) + afterEachCode + newContent.slice(insertPosition);
      } else {
        // Nếu không có beforeEach, chèn sau khai báo biến
        const variableDeclarationPattern = /(\n\s*let\s+[^;]+;[\s\S]*?)(\n\s*it\s*\(|\n\s*describe\s*\()/;
        const variableMatch = newContent.match(variableDeclarationPattern);
        
        if (variableMatch) {
          const insertPosition = variableMatch.index + variableMatch[1].length;
          const afterEachCode = '\n\n  afterEach(() => {\n    jest.clearAllMocks();\n  });\n';
          
          newContent = newContent.slice(0, insertPosition) + afterEachCode + newContent.slice(insertPosition);
        }
      }
      
      // Backup file gốc
      if (!fs.existsSync(filePath + '.backup')) {
        fs.writeFileSync(filePath + '.backup', content);
      }
      
      // Ghi file mới
      fs.writeFileSync(filePath, newContent);
      
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Lỗi khi sửa file ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Bắt đầu sửa vị trí afterEach trong các file test...', 'bold');
  
  const testFiles = findTestFiles();
  if (testFiles.length === 0) {
    log('❌ Không tìm thấy file test nào!', 'red');
    return;
  }
  
  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  log('\n📋 Đang sửa vị trí afterEach...', 'blue');
  
  testFiles.forEach(filePath => {
    try {
      if (fixAfterEachPosition(filePath)) {
        log(`✅ Đã sửa ${filePath}`, 'green');
        fixedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      log(`❌ Lỗi khi xử lý ${filePath}: ${error.message}`, 'red');
      errorCount++;
    }
  });
  
  log('\n📊 Tổng kết:', 'bold');
  log(`✅ Đã sửa: ${fixedCount} file`, 'green');
  log(`⏭️  Đã bỏ qua: ${skippedCount} file`, 'yellow');
  log(`❌ Lỗi: ${errorCount} file`, 'red');
  log(`📁 Tổng cộng: ${testFiles.length} file`, 'blue');
  
  if (fixedCount > 0) {
    log('\n💡 Lưu ý: File backup được giữ nguyên với extension .backup', 'yellow');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  findTestFiles,
  fixAfterEachPosition
};
