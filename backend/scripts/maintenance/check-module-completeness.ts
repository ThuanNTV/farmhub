#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface ModuleStatus {
  name: string;
  hasController: boolean;
  hasService: boolean;
  hasTest: boolean;
  hasModule: boolean;
  hasDto: boolean;
  controllerFiles: string[];
  serviceFiles: string[];
  testFiles: string[];
  dtoFiles: string[];
  completeness: number;
  status: 'Complete' | 'Partial' | 'Empty' | 'Refactored';
}

function checkModuleCompleteness(): ModuleStatus[] {
  const modulesPath = path.join(process.cwd(), 'src', 'modules');
  const testPath = path.join(process.cwd(), 'test');

  if (!fs.existsSync(modulesPath)) {
    console.error('❌ Modules directory not found:', modulesPath);
    return [];
  }

  const modules = fs
    .readdirSync(modulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.includes('.md'));

  const results: ModuleStatus[] = [];

  for (const moduleName of modules) {
    const modulePath = path.join(modulesPath, moduleName);
    const moduleStatus: ModuleStatus = {
      name: moduleName,
      hasController: false,
      hasService: false,
      hasTest: false,
      hasModule: false,
      hasDto: false,
      controllerFiles: [],
      serviceFiles: [],
      testFiles: [],
      dtoFiles: [],
      completeness: 0,
      status: 'Empty',
    };

    // Check for module file
    const moduleFile = path.join(modulePath, `${moduleName}.module.ts`);
    if (fs.existsSync(moduleFile)) {
      moduleStatus.hasModule = true;
    }

    // Check for controller directory and files
    const controllerPath = path.join(modulePath, 'controller');
    if (fs.existsSync(controllerPath)) {
      const controllerFiles = fs
        .readdirSync(controllerPath)
        .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'));
      if (controllerFiles.length > 0) {
        moduleStatus.hasController = true;
        moduleStatus.controllerFiles = controllerFiles;
      }
    }

    // Check for service directory and files
    const servicePath = path.join(modulePath, 'service');
    if (fs.existsSync(servicePath)) {
      const serviceFiles = fs
        .readdirSync(servicePath)
        .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'));
      if (serviceFiles.length > 0) {
        moduleStatus.hasService = true;
        moduleStatus.serviceFiles = serviceFiles;
      }
    }

    // Check for services in alternative locations
    if (!moduleStatus.hasService) {
      const alternativeServicePaths = [
        path.join(
          process.cwd(),
          'src',
          'service',
          'global',
          `${moduleName}.service.ts`,
        ),
        path.join(
          process.cwd(),
          'src',
          'core',
          moduleName,
          'service',
          `${moduleName}.service.ts`,
        ),
        path.join(
          process.cwd(),
          'src',
          'service',
          'tenant',
          `${moduleName}.service.ts`,
        ),
      ];

      // Special case for users module
      if (moduleName === 'users') {
        alternativeServicePaths.push(
          path.join(
            process.cwd(),
            'src',
            'core',
            'user',
            'service',
            'users.service.ts',
          ),
        );
      }

      for (const altPath of alternativeServicePaths) {
        if (fs.existsSync(altPath)) {
          moduleStatus.hasService = true;
          moduleStatus.serviceFiles = [path.basename(altPath)];
          break;
        }
      }
    }

    // Check for DTO directory and files
    const dtoPath = path.join(modulePath, 'dto');
    if (fs.existsSync(dtoPath)) {
      const dtoFiles = fs
        .readdirSync(dtoPath)
        .filter((file) => file.endsWith('.ts'));
      if (dtoFiles.length > 0) {
        moduleStatus.hasDto = true;
        moduleStatus.dtoFiles = dtoFiles;
      }
    }

    // Check for test files
    if (fs.existsSync(testPath)) {
      const findTestFiles = (dir: string): string[] => {
        const files: string[] = [];
        try {
          const items = fs.readdirSync(dir, { withFileTypes: true });
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              files.push(...findTestFiles(fullPath));
            } else if (
              item.isFile() &&
              (item.name.includes(moduleName) ||
                item.name.includes(moduleName.replace(/-/g, ''))) &&
              item.name.endsWith('.spec.ts')
            ) {
              files.push(item.name);
            }
          }
        } catch (error) {
          // Ignore errors for directories we can't read
        }
        return files;
      };

      moduleStatus.testFiles = findTestFiles(testPath);
      moduleStatus.hasTest = moduleStatus.testFiles.length > 0;
    }

    // Check for REFACTORING.md to identify refactored modules
    const refactoringFile = path.join(modulePath, 'REFACTORING.md');
    const isRefactored = fs.existsSync(refactoringFile);

    // Calculate completeness
    let score = 0;
    if (moduleStatus.hasModule) score += 20;
    if (moduleStatus.hasController) score += 25;
    if (moduleStatus.hasService) score += 25;
    if (moduleStatus.hasDto) score += 15;
    if (moduleStatus.hasTest) score += 15;

    moduleStatus.completeness = score;

    // Determine status
    if (isRefactored) {
      moduleStatus.status = 'Refactored';
    } else if (score >= 85) {
      moduleStatus.status = 'Complete';
    } else if (score >= 40) {
      moduleStatus.status = 'Partial';
    } else {
      moduleStatus.status = 'Empty';
    }

    results.push(moduleStatus);
  }

  return results.sort((a, b) => b.completeness - a.completeness);
}

function displayResults(results: ModuleStatus[]) {
  console.log('\n🔍 MODULE COMPLETENESS ANALYSIS\n');
  console.log('='.repeat(80));

  const complete = results.filter((r) => r.status === 'Complete');
  const refactored = results.filter((r) => r.status === 'Refactored');
  const partial = results.filter((r) => r.status === 'Partial');
  const empty = results.filter((r) => r.status === 'Empty');

  console.log(`📊 SUMMARY:`);
  console.log(`  ✅ Complete modules: ${complete.length}`);
  console.log(`  🏆 Refactored modules: ${refactored.length}`);
  console.log(`  ⚠️  Partial modules: ${partial.length}`);
  console.log(`  ❌ Empty modules: ${empty.length}`);
  console.log(`  📈 Total modules: ${results.length}`);

  const avgCompleteness =
    results.reduce((sum, r) => sum + r.completeness, 0) / results.length;
  console.log(`  🎯 Average completeness: ${avgCompleteness.toFixed(1)}%\n`);

  // Display detailed results
  console.log('📋 DETAILED RESULTS:\n');

  for (const module of results) {
    const statusIcon = {
      Complete: '✅',
      Refactored: '🏆',
      Partial: '⚠️',
      Empty: '❌',
    }[module.status];

    console.log(
      `${statusIcon} ${module.name.padEnd(30)} ${module.completeness}%`,
    );
    console.log(
      `   Module: ${module.hasModule ? '✓' : '✗'} | Controller: ${module.hasController ? '✓' : '✗'} | Service: ${module.hasService ? '✓' : '✗'} | DTO: ${module.hasDto ? '✓' : '✗'} | Test: ${module.hasTest ? '✓' : '✗'}`,
    );

    if (module.controllerFiles.length > 0) {
      console.log(`   Controllers: ${module.controllerFiles.join(', ')}`);
    }
    if (module.serviceFiles.length > 0) {
      console.log(`   Services: ${module.serviceFiles.join(', ')}`);
    }
    if (module.testFiles.length > 0) {
      console.log(`   Tests: ${module.testFiles.join(', ')}`);
    }
    console.log('');
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting module completeness check...');
    const results = checkModuleCompleteness();
    displayResults(results);
    console.log('✨ Module completeness check completed!');
  } catch (error) {
    console.error('❌ Error during module check:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
