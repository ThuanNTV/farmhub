import * as fs from 'fs';
import * as path from 'path';

// Function to convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Function to convert camelCase to snake_case
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Function to process a single file
function processFile(filePath: string): void {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find all snake_case field names in the file
  const snakeCaseRegex = /\b([a-z]+_[a-z_]+)\b/g;
  const matches = content.match(snakeCaseRegex) || [];

  // Remove duplicates and sort by length (longest first to avoid partial replacements)
  const uniqueMatches = [...new Set(matches)].sort(
    (a, b) => b.length - a.length,
  );

  for (const snakeCase of uniqueMatches) {
    const camelCase = snakeToCamel(snakeCase);

    // Skip if it's already camelCase or if it's a common word that shouldn't be changed
    if (
      snakeCase === camelCase ||
      snakeCase.includes('dto') ||
      snakeCase.includes('api') ||
      snakeCase.includes('swagger')
    ) {
      continue;
    }

    // Replace field declarations
    const fieldRegex = new RegExp(`\\b${snakeCase}\\s*!:\\s*`, 'g');
    if (fieldRegex.test(content)) {
      content = content.replace(fieldRegex, `${camelCase}!: `);
      modified = true;
    }

    // Replace field declarations with optional
    const optionalFieldRegex = new RegExp(`\\b${snakeCase}\\s*\\?:\\s*`, 'g');
    if (optionalFieldRegex.test(content)) {
      content = content.replace(optionalFieldRegex, `${camelCase}?: `);
      modified = true;
    }

    // Replace in @Expose decorators
    const exposeRegex = new RegExp(
      `@Expose\\(\\s*\\{\\s*name:\\s*['"]${snakeCase}['"]\\s*\\}\s*\\)`,
      'g',
    );
    if (exposeRegex.test(content)) {
      content = content.replace(
        exposeRegex,
        `@Expose({ name: '${camelCase}' })`,
      );
      modified = true;
    }

    // Replace in comments
    const commentRegex = new RegExp(`//\\s*maps\\s+to\\s+${snakeCase}`, 'g');
    if (commentRegex.test(content)) {
      content = content.replace(commentRegex, `// maps to ${snakeCase}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Function to recursively find all DTO files
function findDtoFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findDtoFiles(fullPath));
    } else if (
      item.endsWith('.ts') &&
      (item.includes('dto') || item.includes('Dto'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
function main() {
  const dtoDir = path.join(__dirname, '..', 'src', 'dto');

  if (!fs.existsSync(dtoDir)) {
    console.error('DTO directory not found:', dtoDir);
    return;
  }

  const dtoFiles = findDtoFiles(dtoDir);
  console.log(`Found ${dtoFiles.length} DTO files to process`);

  for (const file of dtoFiles) {
    try {
      processFile(file);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log('✅ DTO field conversion completed!');
}

if (require.main === module) {
  main();
}
