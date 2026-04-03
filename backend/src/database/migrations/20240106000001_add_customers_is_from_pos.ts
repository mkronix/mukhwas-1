import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn("customers", "is_from_pos");
  if (!hasColumn) {
    await knex.schema.alterTable("customers", (t) => {
      t.boolean("is_from_pos").notNullable().defaultTo(false);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn("customers", "is_from_pos");
  if (hasColumn) {
    await knex.schema.alterTable("customers", (t) => {
      t.dropColumn("is_from_pos");
    });
  }
}
