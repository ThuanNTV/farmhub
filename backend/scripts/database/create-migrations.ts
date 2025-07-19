import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DataSource } from 'typeorm';

async function createMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantDS = app.get(TenantDataSourceService);

  console.log('🔧 Creating migrations for new entities...\n');

  try {
    // Get a sample tenant data source to generate migrations
    const sampleStoreId = 'sample-store-id'; // This should be replaced with actual store ID
    const dataSource = await tenantDS.getTenantDataSource(sampleStoreId);

    // Generate migration for new entities
    const migrationName = `CreateNewEntities_${new Date().toISOString().replace(/[:.]/g, '-')}`;

    console.log('📋 New entities to be migrated:');
    console.log('  - tag');
    console.log('  - stock_transfer');
    console.log('  - stock_transfer_item');
    console.log('  - voucher_usage_log');

    console.log('\n📝 Migration SQL Preview:');

    // Tag table
    console.log('\n-- Tag table');
    console.log(`CREATE TABLE tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_by_user_id UUID,
  updated_by_user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);`);

    // Stock Transfer table
    console.log('\n-- Stock Transfer table');
    console.log(`CREATE TABLE stock_transfer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  transfer_code VARCHAR(50) UNIQUE NOT NULL,
  from_store_id UUID NOT NULL,
  to_store_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  transfer_date TIMESTAMP NOT NULL,
  expected_delivery_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  notes TEXT,
  total_items INTEGER DEFAULT 0,
  total_quantity DECIMAL(10,2) DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_by_user_id UUID,
  updated_by_user_id UUID,
  approved_by_user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (from_store_id) REFERENCES store(id),
  FOREIGN KEY (to_store_id) REFERENCES store(id)
);`);

    // Stock Transfer Item table
    console.log('\n-- Stock Transfer Item table');
    console.log(`CREATE TABLE stock_transfer_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  stock_transfer_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  transferred_quantity DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (stock_transfer_id) REFERENCES stock_transfer(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);`);

    // Voucher Usage Log table
    console.log('\n-- Voucher Usage Log table');
    console.log(`CREATE TABLE voucher_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  voucher_id UUID NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  order_total_before_discount DECIMAL(10,2) NOT NULL,
  order_total_after_discount DECIMAL(10,2) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (voucher_id) REFERENCES voucher(id),
  FOREIGN KEY (user_id) REFERENCES "user"(id),
  FOREIGN KEY (order_id) REFERENCES "order"(order_id)
);`);

    console.log('\n✅ Migration SQL generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run the migration SQL on your database');
    console.log(
      '  2. Update your TypeORM configuration to include new entities',
    );
    console.log('  3. Test the new services with real data');
  } catch (error) {
    console.error('❌ Error creating migrations:', error);
  }

  await app.close();
}

// Run the migration creation
createMigrations()
  .then(() => {
    console.log('\n✅ Migration creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during migration creation:', error);
    process.exit(1);
  });
