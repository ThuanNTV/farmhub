import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../src');

const replacements = [
  {
    from: /src\/common\/auth\/security\.service/g,
    to: 'src/service/global/security.service',
  },
  {
    from: /src\/modules\/audit-logs\/service\/transaction\/audit-transaction\.service/g,
    to: 'src/service/global/audit-transaction.service',
  },
  {
    from: /src\/modules\/notification\/service\/notification\.service/g,
    to: 'src/service/global/notification.service',
  },
];

function replaceGlobalServiceImportsInFile(filePath) {
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
    console.log('Updated global service import in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceGlobalServiceImportsInFile(fullPath);
    }
  });
}

walkDir(rootDir); 