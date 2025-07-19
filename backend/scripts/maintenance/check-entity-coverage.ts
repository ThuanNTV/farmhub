#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface EntityCoverage {
  entityName: string;
  entityFile: string;
  hasController: boolean;
  hasService: boolean;
  hasDto: boolean;
  hasModule: boolean;
  controllerPath?: string;
  servicePath?: string;
  dtoPath?: string;
  modulePath?: string;
  coverageScore: number;
  status: 'Complete' | 'Partial' | 'Missing';
}

function checkEntityCoverage(): EntityCoverage[] {
  const tenantEntitiesPath = path.join(
    process.cwd(),
    'src',
    'entities',
    'tenant',
  );
  const globalEntitiesPath = path.join(
    process.cwd(),
    'src',
    'entities',
    'global',
  );
  const modulesPath = path.join(process.cwd(), 'src', 'modules');

  if (!fs.existsSync(tenantEntitiesPath)) {
    console.error(
      '❌ Tenant entities directory not found:',
      tenantEntitiesPath,
    );
    return [];
  }

  // Get all entity files from both tenant and global
  const tenantEntityFiles = fs.existsSync(tenantEntitiesPath)
    ? fs
        .readdirSync(tenantEntitiesPath)
        .filter((file) => file.endsWith('.entity.ts'))
        .map((file) => ({
          file,
          name: file.replace('.entity.ts', '').toLowerCase(),
          type: 'tenant',
        }))
    : [];

  const globalEntityFiles = fs.existsSync(globalEntitiesPath)
    ? fs
        .readdirSync(globalEntitiesPath)
        .filter((file) => file.endsWith('.entity.ts'))
        .map((file) => ({
          file,
          name: file.replace('.entity.ts', '').toLowerCase(),
          type: 'global',
        }))
    : [];

  const entityFiles = [...tenantEntityFiles, ...globalEntityFiles];

  console.log(
    `📁 Found ${tenantEntityFiles.length} tenant entities and ${globalEntityFiles.length} global entities (${entityFiles.length} total)`,
  );

  const results: EntityCoverage[] = [];

  for (const entity of entityFiles) {
    const entityCoverage: EntityCoverage = {
      entityName: entity.name,
      entityFile: entity.file,
      hasController: false,
      hasService: false,
      hasDto: false,
      hasModule: false,
      coverageScore: 0,
      status: 'Missing',
    };

    // Convert entity name to possible module names
    const entityNameVariations = [
      entity.name,
      entity.name + 's', // plural
      entity.name.replace(/_/g, '-'), // underscore to dash
      entity.name.replace(/_/g, '-') + 's', // underscore to dash + plural
      entity.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, ''), // camelCase to kebab-case
      entity.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '') + 's', // plural kebab-case
    ];

    // Manual mapping for known mismatches
    const entityToModuleMap: { [key: string]: string } = {
      // Tenant entities
      audit_log: 'audit-logs',
      category: 'categories',
      debt_transaction: 'debt-transactions',
      dispatch_order: 'dispatch-orders',
      dispatch_order_item: 'dispatch-order-items',
      external_system_log: 'external-system-logs',
      file_attachment: 'file-attachments',
      inventory_transfer: 'inventory-transfers',
      inventory_transfer_item: 'inventory-transfer-items',
      job_schedule: 'job-schedules',
      loyalty_point_log: 'loyalty-point-logs',
      orderitem: 'order-items',
      price_history: 'price-histories',
      return_order: 'return-orders',
      return_order_item: 'return-order-items',
      scheduled_task: 'scheduled-task',
      stock_adjustment: 'stock-adjustments',
      stock_transfer: 'stock-transfer',
      stock_transfer_item: 'stock-transfer-items',
      store_setting: 'store-settings',
      user_activity_log: 'user-activity-log',
      voucher_usage_log: 'voucher-usage-log',
      webhook_log: 'webhook-logs',
      // Global entities
      bank: 'bank',
      payment_method: 'payment-methods',
      store: 'stores',
      unit: 'units',
      user: 'users',
      user_store_mapping: 'user-store-mappings',
    };

    const possibleModuleNames = [
      ...entityNameVariations,
      entityToModuleMap[entity.name] || '',
    ].filter((name) => name !== '');

    // Check for module, controller, service, dto
    for (const moduleName of possibleModuleNames) {
      const modulePath = path.join(modulesPath, moduleName);

      if (fs.existsSync(modulePath)) {
        entityCoverage.modulePath = moduleName;
        entityCoverage.hasModule = true;

        // Check for module file
        const moduleFile = path.join(modulePath, `${moduleName}.module.ts`);
        if (fs.existsSync(moduleFile)) {
          entityCoverage.hasModule = true;
        }

        // Check for controller
        const controllerPath = path.join(modulePath, 'controller');
        if (fs.existsSync(controllerPath)) {
          const controllerFiles = fs
            .readdirSync(controllerPath)
            .filter((file) => file.endsWith('.controller.ts'));
          if (controllerFiles.length > 0) {
            entityCoverage.hasController = true;
            entityCoverage.controllerPath = `${moduleName}/controller/${controllerFiles[0]}`;
          }
        }

        // Check for service
        const servicePath = path.join(modulePath, 'service');
        if (fs.existsSync(servicePath)) {
          const serviceFiles = fs
            .readdirSync(servicePath)
            .filter((file) => file.endsWith('.service.ts'));
          if (serviceFiles.length > 0) {
            entityCoverage.hasService = true;
            entityCoverage.servicePath = `${moduleName}/service/${serviceFiles[0]}`;
          }
        }

        // Check for services in alternative locations
        if (!entityCoverage.hasService) {
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
              'service',
              'tenant',
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
          ];

          // Special cases
          if (moduleName === 'notification') {
            alternativeServicePaths.push(
              path.join(
                process.cwd(),
                'src',
                'service',
                'global',
                'notification.service.ts',
              ),
            );
          }

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
              entityCoverage.hasService = true;
              entityCoverage.servicePath = `alternative: ${path.basename(altPath)}`;
              break;
            }
          }
        }

        // Check for DTO
        const dtoPath = path.join(modulePath, 'dto');
        if (fs.existsSync(dtoPath)) {
          const dtoFiles = fs
            .readdirSync(dtoPath)
            .filter((file) => file.endsWith('.dto.ts'));
          if (dtoFiles.length > 0) {
            entityCoverage.hasDto = true;
            entityCoverage.dtoPath = `${moduleName}/dto/`;
          }
        }

        break; // Found matching module, stop searching
      }
    }

    // Calculate coverage score
    let score = 0;
    if (entityCoverage.hasModule) score += 25;
    if (entityCoverage.hasController) score += 25;
    if (entityCoverage.hasService) score += 25;
    if (entityCoverage.hasDto) score += 25;

    entityCoverage.coverageScore = score;

    // Determine status
    if (score === 100) {
      entityCoverage.status = 'Complete';
    } else if (score >= 50) {
      entityCoverage.status = 'Partial';
    } else {
      entityCoverage.status = 'Missing';
    }

    results.push(entityCoverage);
  }

  return results.sort((a, b) => b.coverageScore - a.coverageScore);
}

function displayResults(results: EntityCoverage[]) {
  console.log('\n🔍 ENTITY COVERAGE ANALYSIS\n');
  console.log('='.repeat(80));

  const complete = results.filter((r) => r.status === 'Complete');
  const partial = results.filter((r) => r.status === 'Partial');
  const missing = results.filter((r) => r.status === 'Missing');

  console.log(`📊 SUMMARY:`);
  console.log(`  ✅ Complete entities: ${complete.length}`);
  console.log(`  ⚠️  Partial entities: ${partial.length}`);
  console.log(`  ❌ Missing entities: ${missing.length}`);
  console.log(`  📈 Total entities: ${results.length}`);

  const avgCoverage =
    results.reduce((sum, r) => sum + r.coverageScore, 0) / results.length;
  console.log(`  🎯 Average coverage: ${avgCoverage.toFixed(1)}%\n`);

  // Display detailed results
  console.log('📋 DETAILED RESULTS:\n');

  console.log('✅ COMPLETE ENTITIES (100%):');
  for (const entity of complete) {
    console.log(`  ✅ ${entity.entityName.padEnd(30)} → ${entity.modulePath}`);
  }

  console.log('\n⚠️  PARTIAL ENTITIES:');
  for (const entity of partial) {
    console.log(
      `  ⚠️  ${entity.entityName.padEnd(30)} ${entity.coverageScore}%`,
    );
    console.log(
      `     Module: ${entity.hasModule ? '✓' : '✗'} | Controller: ${entity.hasController ? '✓' : '✗'} | Service: ${entity.hasService ? '✓' : '✗'} | DTO: ${entity.hasDto ? '✓' : '✗'}`,
    );
    if (entity.modulePath) console.log(`     Path: ${entity.modulePath}`);
  }

  console.log('\n❌ MISSING ENTITIES:');
  for (const entity of missing) {
    console.log(
      `  ❌ ${entity.entityName.padEnd(30)} ${entity.coverageScore}%`,
    );
    console.log(`     Entity file: ${entity.entityFile}`);
    console.log(
      `     Module: ${entity.hasModule ? '✓' : '✗'} | Controller: ${entity.hasController ? '✓' : '✗'} | Service: ${entity.hasService ? '✓' : '✗'} | DTO: ${entity.hasDto ? '✓' : '✗'}`,
    );
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting entity coverage check...');
    const results = checkEntityCoverage();
    displayResults(results);
    console.log('\n✨ Entity coverage check completed!');
  } catch (error) {
    console.error('❌ Error during entity coverage check:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
