import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("roles", (t) => {
    t.string("id").primary();
    t.string("name", 100).notNullable();
    t.text("description").notNullable().defaultTo("");
    t.enum("surface", ["admin", "pos"]).notNullable().defaultTo("admin");
    t.boolean("is_system_role").notNullable().defaultTo(false);
    t.boolean("pos_access").notNullable().defaultTo(false);
    t.string("created_by").defaultTo(null);
    t.timestamps(true, true);
  });

  await knex.schema.createTable("staff", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 100).notNullable();
    t.string("email", 255).notNullable().unique();
    t.string("phone", 20).notNullable().defaultTo("");
    t.string("password_hash", 255).notNullable();
    t.string("role_id").notNullable().references("id").inTable("roles").onDelete("RESTRICT");
    t.string("pin_hash", 255).defaultTo(null);
    t.integer("pin_failed_attempts").notNullable().defaultTo(0);
    t.timestamp("pin_locked_at").defaultTo(null);
    t.boolean("is_locked").notNullable().defaultTo(false);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.boolean("is_developer").notNullable().defaultTo(false);
    t.string("avatar_url", 500).defaultTo(null);
    t.timestamps(true, true);

    t.index("role_id");
    t.index("email");
    t.index("is_active");
    t.index("is_developer");
  });

  await knex.schema.createTable("customers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 100).notNullable();
    t.string("email", 255).notNullable().unique();
    t.string("phone", 20).notNullable().defaultTo("");
    t.string("password_hash", 255).notNullable();
    t.boolean("is_verified").notNullable().defaultTo(false);
    t.boolean("is_from_pos").notNullable().defaultTo(false);
    t.string("avatar_url", 500).defaultTo(null);
    t.string("verification_token", 255).defaultTo(null);
    t.timestamp("verification_token_expires_at").defaultTo(null);
    t.string("reset_token", 255).defaultTo(null);
    t.timestamp("reset_token_expires_at").defaultTo(null);
    t.timestamps(true, true);

    t.index("email");
    t.index("is_verified");
  });

  await knex.schema.createTable("customer_addresses", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("CASCADE");
    t.enum("type", ["home", "work", "other"]).notNullable().defaultTo("home");
    t.string("line1", 255).notNullable();
    t.string("line2", 255).defaultTo(null);
    t.string("city", 100).notNullable();
    t.string("state", 100).notNullable();
    t.string("pincode", 10).notNullable();
    t.boolean("is_default").notNullable().defaultTo(false);
    t.timestamps(true, true);

    t.index("customer_id");
  });

  await knex.schema.createTable("role_permissions", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("role_id").notNullable().references("id").inTable("roles").onDelete("CASCADE");
    t.string("module", 100).notNullable();
    t.enum("surface", ["admin", "pos"]).notNullable().defaultTo("admin");
    t.boolean("can_create").notNullable().defaultTo(false);
    t.boolean("can_read").notNullable().defaultTo(false);
    t.boolean("can_update").notNullable().defaultTo(false);
    t.boolean("can_delete").notNullable().defaultTo(false);
    t.boolean("can_export").notNullable().defaultTo(false);
    t.boolean("can_view_reports").notNullable().defaultTo(false);
    t.jsonb("extended_actions").notNullable().defaultTo("[]");
    t.timestamps(true, true);

    t.unique(["role_id", "module"]);
    t.index("role_id");
    t.index("module");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("customer_addresses");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("staff");
  await knex.schema.dropTableIfExists("roles");
}
