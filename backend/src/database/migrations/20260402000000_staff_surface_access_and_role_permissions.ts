import type { Knex } from "knex";

const DEVELOPER_ROLE_ID = "role_developer";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("staff", (t) => {
    t.boolean("admin_access").notNullable().defaultTo(true);
    t.boolean("pos_access").notNullable().defaultTo(false);
  });

  await knex.raw(`
    UPDATE staff AS s
    SET pos_access = COALESCE(r.pos_access, false)
    FROM roles AS r
    WHERE s.role_id = r.id
  `);

  await knex.schema.alterTable("roles", (t) => {
    t.dropColumn("pos_access");
  });

  await knex.schema.alterTable("role_permissions", (t) => {
    t.dropUnique(["role_id", "module"]);
  });

  await knex.schema.alterTable("role_permissions", (t) => {
    t.unique(["role_id", "module", "surface"]);
  });

  const pairs = await knex("role_permissions").select("role_id", "module").groupBy("role_id", "module");

  for (const row of pairs) {
    const roleId = row.role_id as string;
    const module = row.module as string;
    for (const surface of ["admin", "pos"] as const) {
      const has = await knex("role_permissions").where({ role_id: roleId, module, surface }).first();
      if (!has) {
        const donor =
          (await knex("role_permissions")
            .where({ role_id: roleId, module })
            .whereNot({ surface })
            .first()) ??
          (await knex("role_permissions").where({ role_id: roleId, module }).first());
        if (donor) {
          await knex("role_permissions").insert({
            role_id: roleId,
            module,
            surface,
            can_create: donor.can_create,
            can_read: donor.can_read,
            can_update: donor.can_update,
            can_delete: donor.can_delete,
            can_export: donor.can_export,
            can_view_reports: donor.can_view_reports,
            extended_actions: donor.extended_actions,
          });
        }
      }
    }
  }

  await knex("role_permissions").where({ role_id: DEVELOPER_ROLE_ID, surface: "pos" }).delete();
}

export async function down(): Promise<void> {
  // Irreversible: role_permissions (role_id, module, surface) cannot safely collapse to a single row per module.
}
