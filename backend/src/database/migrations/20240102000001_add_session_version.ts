import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("staff", (t) => {
    t.integer("session_version").notNullable().defaultTo(1);
  });

  await knex.schema.alterTable("customers", (t) => {
    t.integer("session_version").notNullable().defaultTo(1);
    t.string("google_id", 255).defaultTo(null);
    t.index("google_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customers", (t) => {
    t.dropIndex("google_id");
    t.dropColumn("google_id");
    t.dropColumn("session_version");
  });

  await knex.schema.alterTable("staff", (t) => {
    t.dropColumn("session_version");
  });
}
