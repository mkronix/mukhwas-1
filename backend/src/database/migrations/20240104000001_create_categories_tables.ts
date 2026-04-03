import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("categories", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 200).notNullable();
    t.string("slug", 255).notNullable().unique();
    t.text("description").defaultTo(null);
    t.string("image_url", 500).defaultTo(null);
    t.uuid("parent_id").defaultTo(null);
    t.integer("sort_order").notNullable().defaultTo(0);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.foreign("parent_id").references("id").inTable("categories").onDelete("RESTRICT");
    t.index("parent_id");
    t.index("slug");
    t.index("is_active");
    t.index("sort_order");
    t.index("deleted_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("categories");
}
