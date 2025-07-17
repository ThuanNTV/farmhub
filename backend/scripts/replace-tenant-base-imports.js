import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../src');

const replacements = [
  {
    from: /src\/common\/helpers\/tenant-base\.service/g,
    to: 'src/service/tenant/tenant-base.service',
  },
];

function replaceTenantBaseImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = false;
  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to);
      replaced = true;
    }
  }
  if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated tenant-base.service import in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceTenantBaseImportsInFile(fullPath);
    }
  });
}

walkDir(rootDir); 