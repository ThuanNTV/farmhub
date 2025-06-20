// src/config/database-test.ts
import { DataSource } from 'typeorm';
import { globalDbConfig } from '../../config/dbConfig';

// npx ts-node src/check/database-test.ts

export async function testDatabaseConnection() {
  const dataSource = new DataSource(globalDbConfig);

  try {
    console.log('🔄 Đang kết nối database...');
    await dataSource.initialize();
    console.log('✅ Kết nối database thành công!');

    // Test query
    const result = await dataSource.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result[0].version);

    // Kiểm tra các table hiện tại
    const tables = await dataSource.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('📋 Các table hiện tại:', tables);

    await dataSource.destroy();
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
    return false;
  }
}

// Chạy test
testDatabaseConnection();
