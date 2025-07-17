import * as fs from 'fs';
import * as path from 'path';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function convertEntityFields(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Convert field names in @Column decorators
    content = content.replace(
      /@Column\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @PrimaryGeneratedColumn decorators
    content = content.replace(
      /@PrimaryGeneratedColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @PrimaryColumn decorators
    content = content.replace(
      /@PrimaryColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @CreateDateColumn decorators
    content = content.replace(
      /@CreateDateColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @UpdateDateColumn decorators
    content = content.replace(
      /@UpdateDateColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @DeleteDateColumn decorators
    content = content.replace(
      /@DeleteDateColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @Version decorators
    content = content.replace(
      /@Version\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @Index decorators
    content = content.replace(
      /@Index\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @Unique decorators
    content = content.replace(
      /@Unique\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @JoinColumn decorators
    content = content.replace(
      /@JoinColumn\([^)]*name:\s*['"`]([^'"`]+)['"`][^)]*\)\s*(\w+):/g,
      (match, columnName, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        const camelCaseColumnName = toCamelCase(columnName);
        if (
          camelCaseFieldName !== fieldName ||
          camelCaseColumnName !== columnName
        ) {
          modified = true;
          return match
            .replace(columnName, camelCaseColumnName)
            .replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @ManyToOne decorators
    content = content.replace(
      /@ManyToOne\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @OneToMany decorators
    content = content.replace(
      /@OneToMany\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @OneToOne decorators
    content = content.replace(
      /@OneToOne\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @ManyToMany decorators
    content = content.replace(
      /@ManyToMany\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert field names in @JoinTable decorators
    content = content.replace(
      /@JoinTable\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert @JoinColumn references
    content = content.replace(
      /@JoinColumn\(\{[^}]*name:\s*['"`]([^'"`]+)['"`][^}]*\}\)/g,
      (match, columnName) => {
        const camelCaseName = toCamelCase(columnName);
        if (camelCaseName !== columnName) {
          modified = true;
          return match.replace(columnName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @JoinColumn referencedColumnName
    content = content.replace(
      /@JoinColumn\(\{[^}]*referencedColumnName:\s*['"`]([^'"`]+)['"`][^}]*\}\)/g,
      (match, columnName) => {
        const camelCaseName = toCamelCase(columnName);
        if (camelCaseName !== columnName) {
          modified = true;
          return match.replace(columnName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @Index column names
    content = content.replace(
      /@Index\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

    // Convert @Unique column names
    content = content.replace(
      /@Unique\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseFieldName = toCamelCase(fieldName);
        if (camelCaseFieldName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseFieldName);
        }
        return match;
      },
    );

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
console.log('🔄 Converting entity fields to camelCase (v2)...');
processDirectory(entitiesDir);
console.log('✅ Entity field conversion completed!');
