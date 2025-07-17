import * as fs from 'fs';
import * as path from 'path';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function convertEntityFields(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Convert field names from snake_case to camelCase
    content = content.replace(/(\w+)_(\w+):/g, (match, prefix, suffix) => {
      const camelCaseName = toCamelCase(match.slice(0, -1)); // Remove the colon
      if (camelCaseName !== match.slice(0, -1)) {
        modified = true;
        return camelCaseName + ':';
      }
      return match;
    });

    // Convert name properties in decorators from snake_case to camelCase
    content = content.replace(
      /name:\s*['"`]([^'"`]+)['"`]/g,
      (match, columnName) => {
        const camelCaseName = toCamelCase(columnName);
        if (camelCaseName !== columnName) {
          modified = true;
          return match.replace(columnName, camelCaseName);
        }
        return match;
      },
    );

    // Convert referencedColumnName properties in decorators
    content = content.replace(
      /referencedColumnName:\s*['"`]([^'"`]+)['"`]/g,
      (match, columnName) => {
        const camelCaseName = toCamelCase(columnName);
        if (camelCaseName !== columnName) {
          modified = true;
          return match.replace(columnName, camelCaseName);
        }
        return match;
      },
    );

    // Convert array references in @Index decorators
    content = content.replace(/@Index\(\[([^\]]+)\]/g, (match, indexFields) => {
      const camelCaseFields = indexFields
        .split(',')
        .map((field) =>
          field
            .trim()
            .replace(/['"`]/g, '')
            .replace(/_([a-z])/g, (m, letter) => letter.toUpperCase()),
        )
        .join(', ');
      if (camelCaseFields !== indexFields) {
        modified = true;
        return match.replace(indexFields, `'${camelCaseFields}'`);
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Converted entity fields in: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function processDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.entity.ts')) {
      convertEntityFields(fullPath);
    }
  }
}

// Process all entity files
const entitiesDir = path.join(__dirname, '..', 'src', 'entities');
console.log('🔄 Converting entity fields to camelCase (v3)...');
processDirectory(entitiesDir);
console.log('✅ Entity field conversion completed!');
