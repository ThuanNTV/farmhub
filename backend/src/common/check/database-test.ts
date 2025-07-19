// src/config/database-test.ts
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';
// npx ts-node src/check/database-test.ts

export async function testDatabaseConnection() {
  const dataSource = new DataSource(dbConfig);

  try {
    Logger.log('🔄 Đang kết nối database...');
    await dataSource.initialize();
    Logger.log('✅ Kết nối database thành công!');

    // Test query
    type PgVersionResult = { version: string };
    const result =
      await dataSource.query<PgVersionResult[]>('SELECT version()');
    if (result.length > 0) {
      Logger.log('📊 PostgreSQL version:', result[0].version);
    } else {
      Logger.warn('⚠️ Không lấy được version từ PostgreSQL');
    }

    // Kiểm tra các table hiện tại
    const tables: { tablename: string }[] = await dataSource.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    Logger.log('📋 Các table hiện tại:', tables);

    await dataSource.destroy();
    return true;
  } catch (error) {
    Logger.error('❌ Lỗi kết nối database:', error);
    return false;
  }
}
