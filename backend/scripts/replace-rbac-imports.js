import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../src');

const replacements = [
  {
    from: /src\/common\/auth\/permission\.guard/g,
    to: 'src/core/rbac/permission/permission.guard',
  },
  {
    from: /src\/common\/decorator\/permissions\.decorator/g,
    to: 'src/core/rbac/permission/permissions.decorator',
  },
  {
    from: /src\/common\/guards\/roles\.guard/g,
    to: 'src/core/rbac/role/roles.guard',
  },
  {
    from: /src\/common\/decorator\/roles\.decorator/g,
    to: 'src/core/rbac/role/roles.decorator',
  },
];

function replaceRbacImportsInFile(filePath) {
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
    console.log('Updated RBAC import in', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceRbacImportsInFile(fullPath);
    }
  });
}

walkDir(rootDir); 