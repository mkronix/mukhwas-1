import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE raw_materials
    ALTER COLUMN preferred_supplier_id DROP DEFAULT;
  `);

  await knex.raw(`
    ALTER TABLE raw_materials
    ALTER COLUMN preferred_supplier_id TYPE uuid USING (
      CASE
        WHEN preferred_supplier_id IS NULL OR TRIM(preferred_supplier_id::text) = '' THEN NULL
        WHEN preferred_supplier_id::text ~* '^[0-9a-f-]{36}$' THEN preferred_supplier_id::text::uuid
        ELSE NULL
      END
    );
  `);

  await knex.schema.alterTable("raw_materials", (t) => {
    t.foreign("preferred_supplier_id")
      .references("id")
      .inTable("suppliers")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("raw_materials", (t) => {
    t.dropForeign(["preferred_supplier_id"]);
  });

  await knex.raw(`
    ALTER TABLE raw_materials
    ALTER COLUMN preferred_supplier_id TYPE varchar(255)
    USING preferred_supplier_id::text;
  `);
}