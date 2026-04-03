import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("raw_materials", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 200).notNullable();
    t.text("description").notNullable().defaultTo("");
    t.uuid("unit_id").notNullable().references("id").inTable("units").onDelete("RESTRICT");
    t.float("current_stock").notNullable().defaultTo(0);
    t.float("reorder_level").notNullable().defaultTo(0);
    t.string("preferred_supplier_id").defaultTo(null);
    t.string("hsn_code", 20).notNullable().defaultTo("");
    t.enum("gst_slab", ["0", "5", "12", "18", "28"]).notNullable().defaultTo("5");
    t.bigInteger("cost_per_unit_paisa").notNullable().defaultTo(0);
    t.timestamp("last_purchase_date").defaultTo(null);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.index("unit_id");
    t.index("is_active");
    t.index("gst_slab");
    t.index("deleted_at");
  });

  await knex.schema.createTable("supplier_raw_materials", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("raw_material_id").notNullable().references("id").inTable("raw_materials").onDelete("CASCADE");
    t.string("supplier_id").notNullable();
    t.boolean("is_preferred").notNullable().defaultTo(false);
    t.timestamps(true, true);

    t.unique(["raw_material_id", "supplier_id"]);
    t.index("raw_material_id");
    t.index("supplier_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("supplier_raw_materials");
  await knex.schema.dropTableIfExists("raw_materials");
}
