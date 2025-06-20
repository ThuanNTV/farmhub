// src/check-entities.ts
import { DataSource } from 'typeorm';
import { Store } from '../../entities/global/store.entity'; // Đường dẫn chính xác đến entity
import { globalDbConfig } from '../../config/dbConfig'; // Đường dẫn chính xác đến cấu hình kết nối

// npx ts-node src/check/check-entities.ts

// Cách 1: Import trực tiếp entity
const configWithDirectImport = {
  ...globalDbConfig,
  entities: [Store], // Import trực tiếp thay vì dùng pattern
};

export async function checkEntities() {
  const dataSource = new DataSource(configWithDirectImport);

  try {
    console.log('🔄 Initializing DataSource...');
    await dataSource.initialize();

    console.log('✅ DataSource initialized successfully!');

    // Kiểm tra metadata của entities
    const entities = dataSource.entityMetadatas;
    console.log('📋 Loaded entities:');

    entities.forEach((entity) => {
      console.log(`- ${entity.name} (table: ${entity.tableName})`);
      console.log(
        `  Columns: ${entity.columns.map((c) => c.propertyName).join(', ')}`,
      );
    });

    // Thử tạo table thủ công
    console.log('🔨 Creating tables...');
    await dataSource.synchronize();
    console.log('✅ Tables created successfully!');

    // Kiểm tra table đã được tạo
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('📊 Tables in database:');
    tables.forEach((table) => console.log(`- ${table.table_name}`));

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);

    // Chi tiết lỗi
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Chạy kiểm tra
checkEntities();
