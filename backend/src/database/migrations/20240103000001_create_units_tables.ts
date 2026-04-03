import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("units", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 100).notNullable();
    t.string("abbreviation", 20).notNullable();
    t.enum("type", ["Weight", "Volume", "Count", "Other"]).notNullable().defaultTo("Count");
    t.boolean("is_system").notNullable().defaultTo(false);
    t.string("created_by", 255).defaultTo(null);
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.unique(["name"]);
    t.unique(["abbreviation"]);
    t.index("type");
    t.index("is_system");
    t.index("deleted_at");
  });

  await knex.schema.createTable("unit_conversions", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("from_unit", 20).notNullable();
    t.string("to_unit", 20).notNullable();
    t.float("factor").notNullable();
    t.timestamps(true, true);

    t.unique(["from_unit", "to_unit"]);
    t.index("from_unit");
    t.index("to_unit");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("unit_conversions");
  await knex.schema.dropTableIfExists("units");
}
