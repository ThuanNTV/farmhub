import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../src');

function replaceAuthImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /src\/modules\/auth\//g;
  if (regex.test(content)) {
    content = content.replace(regex, 'src/core/auth/');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated auth import in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceAuthImportsInFile(fullPath);
    }
  });
}

walkDir(rootDir); 