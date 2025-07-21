import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsTables1700000000003
  implements MigrationInterface
{
  name = 'CreateProductVariantsTables1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_attribute table
    await queryRunner.query(`
      CREATE TABLE "product_attribute" (
        "attribute_id" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "display_name" varchar(255) NOT NULL,
        "description" varchar(500),
        "type" varchar(50) NOT NULL DEFAULT 'text',
        "input_type" varchar(50) NOT NULL DEFAULT 'text',
        "options" json,
        "unit" varchar(100),
        "is_required" boolean NOT NULL DEFAULT false,
        "is_variant_defining" boolean NOT NULL DEFAULT true,
        "is_filterable" boolean NOT NULL DEFAULT true,
        "is_searchable" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "group_name" varchar(100),
        "help_text" text,
        "default_value" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_user_id" uuid,
        "updated_by_user_id" uuid,
        CONSTRAINT "PK_product_attribute" PRIMARY KEY ("attribute_id")
      )
    `);

    // Create product_variant table
    await queryRunner.query(`
      CREATE TABLE "product_variant" (
        "variant_id" varchar(255) NOT NULL,
        "product_id" varchar(255) NOT NULL,
        "sku" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" varchar(500),
        "price_retail" decimal(18,2) NOT NULL,
        "price_wholesale" decimal(18,2),
        "cost_price" decimal(18,2),
        "barcode" varchar(50),
        "stock" integer NOT NULL DEFAULT 0,
        "min_stock_level" integer NOT NULL DEFAULT 0,
        "weight" decimal(10,3),
        "weight_unit" varchar(50),
        "dimensions" json,
        "images" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_default" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_user_id" uuid,
        "updated_by_user_id" uuid,
        CONSTRAINT "PK_product_variant" PRIMARY KEY ("variant_id")
      )
    `);

    // Create product_variant_attribute table
    await queryRunner.query(`
      CREATE TABLE "product_variant_attribute" (
        "variant_attribute_id" varchar(255) NOT NULL,
        "variant_id" varchar(255) NOT NULL,
        "attribute_id" varchar(255) NOT NULL,
        "value" varchar(500) NOT NULL,
        "display_value" varchar(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_user_id" uuid,
        "updated_by_user_id" uuid,
        CONSTRAINT "PK_product_variant_attribute" PRIMARY KEY ("variant_attribute_id")
      )
    `);

    // Create indexes for product_attribute
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_attribute_name" ON "product_attribute" ("name") WHERE "is_deleted" = false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attribute_type" ON "product_attribute" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attribute_active_deleted" ON "product_attribute" ("is_active", "is_deleted")`,
    );

    // Create indexes for product_variant
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_product_id" ON "product_variant" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_variant_sku" ON "product_variant" ("sku") WHERE "is_deleted" = false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_active_deleted" ON "product_variant" ("is_active", "is_deleted")`,
    );

    // Create indexes for product_variant_attribute
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_variant_attribute_unique" ON "product_variant_attribute" ("variant_id", "attribute_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_attribute_variant_id" ON "product_variant_attribute" ("variant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_attribute_attribute_id" ON "product_variant_attribute" ("attribute_id")`,
    );

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "product_variant" 
      ADD CONSTRAINT "FK_product_variant_product" 
      FOREIGN KEY ("product_id") REFERENCES "product"("productId") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_variant_attribute" 
      ADD CONSTRAINT "FK_product_variant_attribute_variant" 
      FOREIGN KEY ("variant_id") REFERENCES "product_variant"("variant_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_variant_attribute" 
      ADD CONSTRAINT "FK_product_variant_attribute_attribute" 
      FOREIGN KEY ("attribute_id") REFERENCES "product_attribute"("attribute_id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Insert some default attributes
    await queryRunner.query(`
      INSERT INTO "product_attribute" (
        "attribute_id", "name", "display_name", "description", "type", "input_type", 
        "options", "is_variant_defining", "is_filterable", "sort_order"
      ) VALUES 
      ('attr-size', 'size', 'Kích thước', 'Kích thước sản phẩm', 'size', 'dropdown', 
       '{"values": ["XS", "S", "M", "L", "XL", "XXL"]}', true, true, 1),
      ('attr-color', 'color', 'Màu sắc', 'Màu sắc sản phẩm', 'color', 'color_picker', 
       '{"values": ["Đỏ", "Xanh", "Vàng", "Đen", "Trắng", "Xám"]}', true, true, 2),
      ('attr-material', 'material', 'Chất liệu', 'Chất liệu sản phẩm', 'text', 'dropdown', 
       '{"values": ["Cotton", "Polyester", "Linen", "Silk", "Wool"]}', true, true, 3),
      ('attr-weight', 'weight', 'Trọng lượng', 'Trọng lượng sản phẩm', 'number', 'number', 
       '{"unit": "kg", "min": 0, "step": 0.1}', false, true, 4),
      ('attr-capacity', 'capacity', 'Dung tích', 'Dung tích sản phẩm', 'number', 'number', 
       '{"unit": "ml", "min": 0, "step": 1}', true, true, 5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" DROP CONSTRAINT "FK_product_variant_attribute_attribute"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_attribute" DROP CONSTRAINT "FK_product_variant_attribute_variant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP CONSTRAINT "FK_product_variant_product"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_product_variant_attribute_attribute_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_product_variant_attribute_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_product_variant_attribute_unique"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_product_variant_active_deleted"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variant_sku"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variant_product_id"`);
    await queryRunner.query(
      `DROP INDEX "IDX_product_attribute_active_deleted"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_product_attribute_type"`);
    await queryRunner.query(`DROP INDEX "IDX_product_attribute_name"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "product_variant_attribute"`);
    await queryRunner.query(`DROP TABLE "product_variant"`);
    await queryRunner.query(`DROP TABLE "product_attribute"`);
  }
}
