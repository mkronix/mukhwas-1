import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("suppliers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 255).notNullable();
    t.string("contact_person", 200).notNullable().defaultTo("");
    t.string("phone", 30).notNullable().defaultTo("");
    t.string("email", 255).notNullable();
    t.text("address").notNullable().defaultTo("");
    t.string("gstin", 15).defaultTo(null);
    t.string("pan", 10).defaultTo(null);
    t.enum("payment_terms", ["immediate", "net_15", "net_30", "net_45", "net_60"]).notNullable().defaultTo("net_30");
    t.boolean("is_active").notNullable().defaultTo(true);
    t.string("bank_name", 200).notNullable().defaultTo("");
    t.string("account_number", 50).notNullable().defaultTo("");
    t.string("ifsc_code", 20).notNullable().defaultTo("");
    t.string("account_holder", 200).notNullable().defaultTo("");
    t.timestamp("deleted_at").defaultTo(null);
    t.timestamps(true, true);

    t.index("email");
    t.index("is_active");
    t.index("deleted_at");
    t.index("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("suppliers");
}
