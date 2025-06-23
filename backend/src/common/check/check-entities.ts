// src/check-entities.ts
import { DataSource } from 'typeorm';
import { Store } from '../../entities/global/store.entity'; // Đường dẫn chính xác đến entity
import { Logger } from '@nestjs/common';
import { globalDbConfig } from 'src/config/db/dbglobal/dbConfig';

// npx ts-node src/check/check-entities.ts

// Cách 1: Import trực tiếp entity
const configWithDirectImport = {
  ...globalDbConfig,
  entities: [Store], // Import trực tiếp thay vì dùng pattern
};

export async function checkEntities() {
  const dataSource = new DataSource(configWithDirectImport);

  try {
    Logger.log('🔄 Initializing DataSource...');
    await dataSource.initialize();

    Logger.log('✅ DataSource initialized successfully!');

    // Kiểm tra metadata của entities
    const entities = dataSource.entityMetadatas;
    Logger.log('📋 Loaded entities:');

    entities.forEach((entity) => {
      Logger.log(`- ${entity.name} (table: ${entity.tableName})`);
      Logger.log(
        `  Columns: ${entity.columns.map((c) => c.propertyName).join(', ')}`,
      );
    });

    // Thử tạo table thủ công
    Logger.log('🔨 Creating tables...');
    await dataSource.synchronize();
    Logger.log('✅ Tables created successfully!');

    // Kiểm tra table đã được tạo
    const tables: { table_name: string }[] = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    Logger.log('📊 Tables in database:');
    tables.forEach((table) => Logger.log(`- ${table.table_name}`));

    await dataSource.destroy();
  } catch (error) {
    Logger.error('❌ Error:', error);

    // Chi tiết lỗi
    if (error instanceof Error) {
      Logger.error('Error message:', error.message);
      Logger.error('Error stack:', error.stack);
    }
  }
}

// Chạy kiểm tra
void checkEntities();
