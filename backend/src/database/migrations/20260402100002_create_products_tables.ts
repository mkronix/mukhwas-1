import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("products", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 255).notNullable();
    t.string("slug", 255).notNullable();
    t.text("description").notNullable().defaultTo("");
    t.uuid("category_id").notNullable().references("id").inTable("categories").onDelete("RESTRICT");
    t.uuid("subcategory_id").defaultTo(null);
    t.enum("status", ["active", "inactive"]).notNullable().defaultTo("active");
    t.jsonb("images").notNullable().defaultTo("[]");
    t.string("meta_title", 255).defaultTo(null);
    t.text("meta_description").defaultTo(null);
    t.jsonb("tags").notNullable().defaultTo("[]");
    t.jsonb("ui").defaultTo(null);
    t.enum("gst_slab", ["0", "5", "12", "18", "28"]).notNullable().defaultTo("5");
    t.string("hsn_code", 20).notNullable().defaultTo("");
    t.bigInteger("base_price_paisa").notNullable().defaultTo(0);
    t.enum("inventory_mode", ["finished_goods", "recipe_realtime"]).notNullable().defaultTo("finished_goods");
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.unique(["slug"]);
    t.foreign("subcategory_id").references("id").inTable("categories").onDelete("SET NULL");
    t.index("category_id");
    t.index("subcategory_id");
    t.index("slug");
    t.index("status");
    t.index("is_active");
    t.index("inventory_mode");
    t.index("deleted_at");
  });

  await knex.schema.createTable("product_variants", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    t.string("name", 100).notNullable();
    t.string("sku", 100).notNullable();
    t.bigInteger("price_paisa").notNullable().defaultTo(0);
    t.bigInteger("compare_at_price_paisa").defaultTo(null);
    t.double("weight_value").notNullable().defaultTo(0);
    t.uuid("weight_unit_id").notNullable().references("id").inTable("units").onDelete("RESTRICT");
    t.string("barcode", 80).defaultTo(null);
    t.enum("inventory_mode", ["finished_goods", "recipe_realtime"]).notNullable().defaultTo("finished_goods");
    t.integer("current_stock").notNullable().defaultTo(0);
    t.integer("reorder_level").notNullable().defaultTo(0);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.unique(["sku"]);
    t.index("product_id");
    t.index("sku");
    t.index("barcode");
    t.index("inventory_mode");
    t.index("is_active");
    t.index("deleted_at");
  });

  await knex.schema.createTable("product_bundles", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    t.timestamps(true, true);

    t.unique(["product_id"]);
    t.index("product_id");
  });

  await knex.schema.createTable("bundle_items", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("product_bundle_id").notNullable().references("id").inTable("product_bundles").onDelete("CASCADE");
    t.uuid("component_variant_id").notNullable().references("id").inTable("product_variants").onDelete("RESTRICT");
    t.integer("quantity").notNullable();
    t.timestamps(true, true);

    t.index("product_bundle_id");
    t.index("component_variant_id");
  });

  const gram = await knex("units").where({ abbreviation: "g" }).whereNull("deleted_at").first();
  if (!gram) {
    await knex("units").insert({
      name: "Gram",
      abbreviation: "g",
      type: "Weight",
      is_system: true,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("bundle_items");
  await knex.schema.dropTableIfExists("product_bundles");
  await knex.schema.dropTableIfExists("product_variants");
  await knex.schema.dropTableIfExists("products");
}
