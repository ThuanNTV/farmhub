import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

interface ServiceCheck {
  serviceName: string;
  filePath: string;
  hasDatabaseConnection: boolean;
  extendsTenantBaseService: boolean;
  hasValidation: boolean;
  issues: string[];
}

async function checkServiceDatabaseConnection() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantDS = app.get(TenantDataSourceService);

  const servicesDir = path.join(__dirname, '../src/service');
  const serviceFiles = fs
    .readdirSync(servicesDir)
    .filter((file) => file.endsWith('.service.ts'));

  const results: ServiceCheck[] = [];

  for (const file of serviceFiles) {
    const serviceName = file.replace('.service.ts', '');
    const filePath = path.join(servicesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const check: ServiceCheck = {
      serviceName,
      filePath,
      hasDatabaseConnection: false,
      extendsTenantBaseService: false,
      hasValidation: false,
      issues: [],
    };

    // Check if extends TenantBaseService
    if (content.includes('extends TenantBaseService')) {
      check.extendsTenantBaseService = true;
    }

    // Check if has database connection
    if (
      content.includes('TenantDataSourceService') ||
      content.includes('getTenantDataSource')
    ) {
      check.hasDatabaseConnection = true;
    }

    // Check if has validation
    if (
      content.includes('validateForeignKeys') ||
      content.includes('@IsString') ||
      content.includes('@IsUUID')
    ) {
      check.hasValidation = true;
    }

    // Check for mock data
    if (
      content.includes('Dữ liệu mẫu') ||
      content.includes('demo') ||
      content.includes('mock')
    ) {
      check.issues.push('Contains mock/demo data');
    }

    // Check for hardcoded responses
    if (content.includes("return { status: 'success'")) {
      check.issues.push('Contains hardcoded success responses');
    }

    results.push(check);
  }

  // Print results
  console.log('\n=== DATABASE CONNECTION CHECK RESULTS ===\n');

  const connectedServices = results.filter((r) => r.hasDatabaseConnection);
  const disconnectedServices = results.filter((r) => !r.hasDatabaseConnection);
  const servicesWithIssues = results.filter((r) => r.issues.length > 0);

  console.log(`✅ Connected Services (${connectedServices.length}):`);
  connectedServices.forEach((service) => {
    console.log(`  - ${service.serviceName}`);
  });

  console.log(`\n❌ Disconnected Services (${disconnectedServices.length}):`);
  disconnectedServices.forEach((service) => {
    console.log(`  - ${service.serviceName}`);
  });

  if (servicesWithIssues.length > 0) {
    console.log(`\n⚠️  Services with Issues (${servicesWithIssues.length}):`);
    servicesWithIssues.forEach((service) => {
      console.log(`  - ${service.serviceName}: ${service.issues.join(', ')}`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total Services: ${results.length}`);
  console.log(`  Connected: ${connectedServices.length}`);
  console.log(`  Disconnected: ${disconnectedServices.length}`);
  console.log(`  With Issues: ${servicesWithIssues.length}`);

  await app.close();
  return results;
}

// Run the check
checkServiceDatabaseConnection()
  .then((results) => {
    console.log('\n✅ Database connection check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during database connection check:', error);
    process.exit(1);
  });
