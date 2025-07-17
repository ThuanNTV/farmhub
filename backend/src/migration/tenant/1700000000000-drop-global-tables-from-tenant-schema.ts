import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropGlobalTablesFromTenantSchema1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa các bảng global khỏi schema tenant (nếu tồn tại)
    await queryRunner.query('DROP TABLE IF EXISTS "stores" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "users" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "banks" CASCADE;');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "user_store_mapping" CASCADE;',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "unit" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "payment_method" CASCADE;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không khôi phục lại các bảng này trong tenant schema
  }
}
