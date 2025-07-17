import * as fs from 'fs';
import * as path from 'path';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function convertEntityFields(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Convert @Column field names from snake_case to camelCase
    content = content.replace(
      /@Column\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @PrimaryColumn field names
    content = content.replace(
      /@PrimaryColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @PrimaryGeneratedColumn field names
    content = content.replace(
      /@PrimaryGeneratedColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @CreateDateColumn field names
    content = content.replace(
      /@CreateDateColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @UpdateDateColumn field names
    content = content.replace(
      /@UpdateDateColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @DeleteDateColumn field names
    content = content.replace(
      /@DeleteDateColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @Version field names
    content = content.replace(
      /@Version\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @Index field names
    content = content.replace(
      /@Index\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @Unique field names
    content = content.replace(
      /@Unique\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @JoinColumn field names
    content = content.replace(
      /@JoinColumn\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @ManyToOne field names
    content = content.replace(
      /@ManyToOne\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @OneToMany field names
    content = content.replace(
      /@OneToMany\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @OneToOne field names
    content = content.replace(
      /@OneToOne\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @ManyToMany field names
    content = content.replace(
      /@ManyToMany\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @JoinTable field names
    content = content.replace(
      /@JoinTable\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
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
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
        }
        return match;
      },
    );

    // Convert @Unique column names
    content = content.replace(
      /@Unique\([^)]*\)\s*(\w+):/g,
      (match, fieldName) => {
        const camelCaseName = toCamelCase(fieldName);
        if (camelCaseName !== fieldName) {
          modified = true;
          return match.replace(fieldName, camelCaseName);
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
console.log('🔄 Converting entity fields to camelCase...');
processDirectory(entitiesDir);
console.log('✅ Entity field conversion completed!');
