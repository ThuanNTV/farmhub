import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductSeoTable1700000000004 implements MigrationInterface {
  name = 'CreateProductSeoTable1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_seo table
    await queryRunner.query(`
      CREATE TABLE "product_seo" (
        "seo_id" varchar(255) NOT NULL,
        "product_id" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "seo_title" varchar(255),
        "seo_description" text,
        "seo_keywords" json,
        "canonical_url" varchar(500),
        "meta_robots" varchar(100) DEFAULT 'index,follow',
        "hreflang_tags" json,
        "custom_meta_tags" json,
        "open_graph_data" json,
        "twitter_card_data" json,
        "structured_data" json,
        "schema_markup" json,
        "seo_analysis" json,
        "sitemap_change_freq" varchar(50) DEFAULT 'weekly',
        "sitemap_priority" decimal(3,2) DEFAULT 0.8,
        "sitemap_include" boolean NOT NULL DEFAULT true,
        "sitemap_images" json,
        "view_count" integer NOT NULL DEFAULT 0,
        "click_count" integer NOT NULL DEFAULT 0,
        "ctr" decimal(5,4),
        "search_console_data" json,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_user_id" uuid,
        "updated_by_user_id" uuid,
        CONSTRAINT "PK_product_seo" PRIMARY KEY ("seo_id")
      )
    `);

    // Create indexes for product_seo
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_product_seo_product_id" ON "product_seo" ("product_id") WHERE "is_deleted" = false`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_product_seo_slug" ON "product_seo" ("slug") WHERE "is_deleted" = false`);
    await queryRunner.query(`CREATE INDEX "IDX_product_seo_active" ON "product_seo" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_seo_sitemap_include" ON "product_seo" ("sitemap_include")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_seo_updated_at" ON "product_seo" ("updated_at")`);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "product_seo" 
      ADD CONSTRAINT "FK_product_seo_product" 
      FOREIGN KEY ("product_id") REFERENCES "product"("productId") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Add full-text search index for SEO content
    await queryRunner.query(`
      CREATE INDEX "IDX_product_seo_fulltext" ON "product_seo" 
      USING gin(to_tsvector('simple', COALESCE("seo_title", '') || ' ' || COALESCE("seo_description", '')))
    `);

    // Create trigger to update updated_at automatically
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_product_seo_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_product_seo_updated_at
        BEFORE UPDATE ON "product_seo"
        FOR EACH ROW
        EXECUTE FUNCTION update_product_seo_updated_at();
    `);

    // Insert some sample SEO configurations
    await queryRunner.query(`
      INSERT INTO "product_seo" (
        "seo_id", "product_id", "slug", "seo_title", "seo_description", 
        "seo_keywords", "canonical_url", "meta_robots", "sitemap_change_freq", "sitemap_priority"
      ) 
      SELECT 
        'seo-' || p."productId",
        p."productId",
        p."slug",
        p."name" || ' - FarmHub',
        SUBSTRING(p."description", 1, 160) || '...',
        '["' || LOWER(p."name") || '", "farmhub", "nông nghiệp"]'::json,
        'https://farmhub.com/products/' || p."slug",
        'index,follow',
        'weekly',
        0.8
      FROM "product" p 
      WHERE p."is_deleted" = false 
      LIMIT 10
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_product_seo_updated_at ON "product_seo"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_product_seo_updated_at()`);

    // Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE "product_seo" DROP CONSTRAINT "FK_product_seo_product"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_product_seo_fulltext"`);
    await queryRunner.query(`DROP INDEX "IDX_product_seo_updated_at"`);
    await queryRunner.query(`DROP INDEX "IDX_product_seo_sitemap_include"`);
    await queryRunner.query(`DROP INDEX "IDX_product_seo_active"`);
    await queryRunner.query(`DROP INDEX "IDX_product_seo_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_product_seo_product_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "product_seo"`);
  }
}
