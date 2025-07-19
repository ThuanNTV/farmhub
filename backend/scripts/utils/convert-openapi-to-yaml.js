// Script: scripts/convert-openapi-to-yaml.js
// Chuyển đổi openapi.json sang docs/05_api_contract.yaml bằng openapi-format

const { execSync } = require('child_process');
const path = require('path');

const input = path.resolve(__dirname, '../openapi.json');
const output = path.resolve(__dirname, '../docs/05_api_contract.yaml');

try {
  execSync(`openapi-format "${input}" -o "${output}"`, { stdio: 'inherit' });
  console.log('✅ Đã chuyển đổi openapi.json sang docs/05_api_contract.yaml thành công!');
} catch (err) {
  console.error('❌ Lỗi khi chuyển đổi openapi.json sang YAML:', err.message);
  process.exit(1);
} 