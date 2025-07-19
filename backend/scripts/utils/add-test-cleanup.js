#!/usr/bin/env node

/**
 * Script để tự động thêm afterEach(() => jest.clearAllMocks()) vào tất cả file test
 * Chỉ thêm vào những file chưa có cleanup này
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
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findTestFiles() {
  log('🔍 Tìm kiếm tất cả file test...', 'blue');

  try {
    // Sử dụng PowerShell để tìm file test
    const command =
      'Get-ChildItem -Path "src", "test" -Recurse -Include "*.spec.ts", "*.test.ts" | ForEach-Object { $_.FullName }';
    const output = execSync(command, {
      encoding: 'utf8',
      shell: 'powershell.exe',
    });

    const files = output
      .trim()
      .split('\n')
      .map((file) => file.trim())
      .filter((file) => file.length > 0)
      .map((file) => path.relative(process.cwd(), file));

    log(`✅ Tìm thấy ${files.length} file test`, 'green');
    return files;
  } catch (error) {
    log(`❌ Lỗi khi tìm file test: ${error.message}`, 'red');
    return [];
  }
}

function hasAfterEachCleanup(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Kiểm tra các pattern khác nhau của afterEach cleanup
    const patterns = [
      /afterEach\s*\(\s*\(\s*\)\s*=>\s*\{?\s*jest\.clearAllMocks\s*\(\s*\)\s*;?\s*\}?\s*\)/,
      /afterEach\s*\(\s*\(\s*\)\s*=>\s*jest\.clearAllMocks\s*\(\s*\)\s*\)/,
      /afterEach\s*\(\s*function\s*\(\s*\)\s*\{[\s\S]*?jest\.clearAllMocks\s*\(\s*\)[\s\S]*?\}\s*\)/,
    ];

    return patterns.some((pattern) => pattern.test(content));
  } catch (error) {
    log(`❌ Lỗi khi đọc file ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function addAfterEachCleanup(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Tìm vị trí để chèn afterEach
    // Tìm describe block đầu tiên
    const describeMatch = content.match(
      /describe\s*\(\s*['"`][^'"`]*['"`]\s*,\s*\(\s*\)\s*=>\s*\{/,
    );
    if (!describeMatch) {
      log(`⚠️  Không tìm thấy describe block trong ${filePath}`, 'yellow');
      return false;
    }

    const describeIndex = describeMatch.index + describeMatch[0].length;
    const afterDescribe = content.slice(describeIndex);

    // Tìm beforeEach để chèn afterEach sau nó
    const beforeEachRegex = /beforeEach\s*\([\s\S]*?\}\s*\)\s*;/;
    const beforeEachMatch = afterDescribe.match(beforeEachRegex);

    let insertPosition;
    let afterEachCode =
      '\n  afterEach(() => {\n    jest.clearAllMocks();\n  });\n';

    if (beforeEachMatch) {
      // Chèn sau beforeEach
      insertPosition =
        describeIndex + beforeEachMatch.index + beforeEachMatch[0].length;
    } else {
      // Tìm vị trí sau khai báo biến (let controller, let service, etc.)
      const variableDeclarationMatch = afterDescribe.match(
        /(\n\s*let\s+[^;]+;[\s\S]*?)(\n\s*beforeEach|\n\s*it\s*\(|\n\s*describe\s*\()/,
      );
      if (variableDeclarationMatch) {
        insertPosition =
          describeIndex +
          variableDeclarationMatch.index +
          variableDeclarationMatch[1].length;
      } else {
        // Chèn ngay sau describe block mở
        insertPosition = describeIndex;
      }
    }

    const newContent =
      content.slice(0, insertPosition) +
      afterEachCode +
      content.slice(insertPosition);

    // Backup file gốc
    fs.writeFileSync(filePath + '.backup', content);

    // Ghi file mới
    fs.writeFileSync(filePath, newContent);

    return true;
  } catch (error) {
    log(`❌ Lỗi khi cập nhật file ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Bắt đầu thêm afterEach cleanup vào tất cả file test...', 'bold');

  const testFiles = findTestFiles();
  if (testFiles.length === 0) {
    log('❌ Không tìm thấy file test nào!', 'red');
    return;
  }

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  log('\n📋 Phân tích file test...', 'blue');

  testFiles.forEach((filePath) => {
    if (hasAfterEachCleanup(filePath)) {
      log(`⏭️  Bỏ qua ${filePath} (đã có cleanup)`, 'yellow');
      skippedCount++;
    } else {
      log(`🔧 Đang cập nhật ${filePath}...`, 'blue');
      if (addAfterEachCleanup(filePath)) {
        log(`✅ Đã cập nhật ${filePath}`, 'green');
        processedCount++;
      } else {
        log(`❌ Lỗi khi cập nhật ${filePath}`, 'red');
        errorCount++;
      }
    }
  });

  log('\n📊 Tổng kết:', 'bold');
  log(`✅ Đã cập nhật: ${processedCount} file`, 'green');
  log(`⏭️  Đã bỏ qua: ${skippedCount} file`, 'yellow');
  log(`❌ Lỗi: ${errorCount} file`, 'red');
  log(`📁 Tổng cộng: ${testFiles.length} file`, 'blue');

  if (processedCount > 0) {
    log('\n💡 Lưu ý: File backup được tạo với extension .backup', 'yellow');
    log('💡 Hãy chạy test để kiểm tra tất cả hoạt động bình thường!', 'yellow');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  findTestFiles,
  hasAfterEachCleanup,
  addAfterEachCleanup,
};
