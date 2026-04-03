import type { Knex } from "knex";

const movementTypes = [
  "purchase_receipt",
  "production_in",
  "production_out",
  "sale",
  "pos_sale",
  "manual_adjustment",
  "reversal",
] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("inventory_movements", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.enum("item_type", ["finished_good", "raw_material"]).notNullable();
    t.uuid("item_id").notNullable();
    t.enum("movement_type", movementTypes).notNullable();
    t.integer("quantity_change").notNullable();
    t.integer("stock_before").notNullable();
    t.integer("stock_after").notNullable();
    t.uuid("unit_id").notNullable().references("id").inTable("units").onDelete("RESTRICT");
    t.string("reference_type", 80).notNullable().defaultTo("");
    t.string("reference_id", 120).notNullable().defaultTo("");
    t.uuid("performed_by").defaultTo(null);
    t.text("notes").notNullable().defaultTo("");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    t.index(["item_type", "item_id"]);
    t.index("movement_type");
    t.index(["reference_type", "reference_id"]);
    t.index("performed_by");
    t.foreign("performed_by").references("id").inTable("staff").onDelete("SET NULL");
  });

  await knex.schema.createTable("inventory_reservations", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.enum("item_type", ["finished_good", "raw_material"]).notNullable();
    t.uuid("item_id").notNullable();
    t.integer("quantity_reserved").notNullable();
    t.string("reference_type", 80).notNullable();
    t.string("reference_id", 120).notNullable();
    t.enum("status", ["active", "released"]).notNullable().defaultTo("active");
    t.timestamps(true, true);

    t.index(["item_type", "item_id"]);
    t.index(["reference_type", "reference_id"]);
    t.index("status");
  });

  await knex.schema.createTable("inventory_cost_layers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.enum("item_type", ["finished_good", "raw_material"]).notNullable();
    t.uuid("item_id").notNullable();
    t.integer("quantity_remaining").notNullable();
    t.bigInteger("unit_cost").notNullable();
    t.timestamp("purchase_date").notNullable().defaultTo(knex.fn.now());
    t.string("purchase_reference_id", 120).notNullable().defaultTo("");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    t.index(["item_type", "item_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("inventory_cost_layers");
  await knex.schema.dropTableIfExists("inventory_reservations");
  await knex.schema.dropTableIfExists("inventory_movements");
}
