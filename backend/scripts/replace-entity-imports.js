import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesDir = path.join(__dirname, '../src/modules');

function replaceEntityImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /from '\.\.\/\.\.\/entities\/tenant\//g;
  if (regex.test(content)) {
    content = content.replace(regex, "from '../../../entities/tenant/");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated entity import in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceEntityImportsInFile(fullPath);
    }
  });
}

walkDir(modulesDir); 