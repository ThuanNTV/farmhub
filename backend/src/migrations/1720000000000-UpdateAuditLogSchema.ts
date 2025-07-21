import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuditLogSchema1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to audit_log table
    await queryRunner.query(`
      ALTER TABLE audit_log 
      ADD COLUMN IF NOT EXISTS store_id UUID,
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS device VARCHAR(100),
      ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
      ADD COLUMN IF NOT EXISTS os VARCHAR(100),
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS old_value JSONB,
      ADD COLUMN IF NOT EXISTS new_value JSONB,
      ADD COLUMN IF NOT EXISTS details TEXT;
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_audit_log_store_id ON audit_log(store_id);
      CREATE INDEX IF NOT EXISTS IDX_audit_log_created_at ON audit_log(created_at);
      CREATE INDEX IF NOT EXISTS IDX_audit_log_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS IDX_audit_log_composite ON audit_log(store_id, target_table, created_at);
    `);

    // Update existing records to set store_id if possible
    await queryRunner.query(`
      UPDATE audit_log
      SET store_id = metadata->>'storeId'
      WHERE metadata->>'storeId' IS NOT NULL AND store_id IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_audit_log_store_id;
      DROP INDEX IF EXISTS IDX_audit_log_created_at;
      DROP INDEX IF EXISTS IDX_audit_log_action;
      DROP INDEX IF EXISTS IDX_audit_log_composite;
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE audit_log 
      DROP COLUMN IF EXISTS store_id,
      DROP COLUMN IF EXISTS ip_address,
      DROP COLUMN IF EXISTS user_agent,
      DROP COLUMN IF EXISTS session_id,
      DROP COLUMN IF EXISTS device,
      DROP COLUMN IF EXISTS browser,
      DROP COLUMN IF EXISTS os,
      DROP COLUMN IF EXISTS user_name,
      DROP COLUMN IF EXISTS old_value,
      DROP COLUMN IF EXISTS new_value,
      DROP COLUMN IF EXISTS details;
    `);
  }
}
