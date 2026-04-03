import type { Knex } from "knex";
import bcrypt from "bcryptjs";
import {
  Module,
  Action,
  MODULE_ALLOWED_ACTIONS,
  type ModuleKey,
  type ActionKey,
} from "../../constant/permissions";

const DEVELOPER_ROLE_ID = "role_developer";
const DEVELOPER_EMAIL = "developer@mukhwas.com";
/** Admin + Swagger: POST /api/v1/auth/admin/login */
const DEVELOPER_PASSWORD = "Dev@123456";
/**
 * POS: GET /api/v1/auth/pos/staff → pick your user id → POST /api/v1/auth/pos/login with { staffId, pin }.
 * Same bcrypt as password; use digits only on the PIN pad in UI if you mirror this value.
 */
const DEVELOPER_POS_PIN = "1234";
const BCRYPT_ROUNDS = 12;

function buildPermissionRow(
  roleId: string,
  module: ModuleKey,
  actions: ActionKey[],
  surface: "admin" | "pos"
) {
  const crudFlags: Record<string, boolean> = {
    can_read: false,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false,
    can_view_reports: false,
  };

  const extendedActions: string[] = [];

  for (const action of actions) {
    switch (action) {
      case Action.READ:
        crudFlags.can_read = true;
        break;
      case Action.CREATE:
        crudFlags.can_create = true;
        break;
      case Action.UPDATE:
        crudFlags.can_update = true;
        break;
      case Action.DELETE:
        crudFlags.can_delete = true;
        break;
      case Action.EXPORT:
        crudFlags.can_export = true;
        break;
      case Action.VIEW_REPORTS:
        crudFlags.can_view_reports = true;
        break;
      default:
        extendedActions.push(action);
        break;
    }
  }

  return {
    role_id: roleId,
    module,
    surface,
    ...crudFlags,
    extended_actions: JSON.stringify(extendedActions),
  };
}

export async function seed(knex: Knex): Promise<void> {
  const existingRole = await knex("roles").where({ id: DEVELOPER_ROLE_ID }).first();
  if (!existingRole) {
    await knex("roles").insert({
      id: DEVELOPER_ROLE_ID,
      name: "Developer",
      description: "System developer with full unrestricted access",
      surface: "admin",
      is_system_role: true,
      created_by: null,
    });
  }

  const allModules = Object.values(Module) as ModuleKey[];

  for (const surface of ["admin", "pos"] as const) {
    for (const module of allModules) {
      const actions = MODULE_ALLOWED_ACTIONS[module];
      const row = buildPermissionRow(DEVELOPER_ROLE_ID, module, actions, surface);

      const existing = await knex("role_permissions")
        .where({ role_id: DEVELOPER_ROLE_ID, module, surface })
        .first();

      if (existing) {
        await knex("role_permissions").where({ id: existing.id }).update(row);
      } else {
        await knex("role_permissions").insert(row);
      }
    }
  }

  const existingStaff = await knex("staff").where({ email: DEVELOPER_EMAIL }).first();
  const passwordHash = await bcrypt.hash(DEVELOPER_PASSWORD, BCRYPT_ROUNDS);
  const pinHash = await bcrypt.hash(DEVELOPER_POS_PIN, BCRYPT_ROUNDS);

  if (!existingStaff) {
    await knex("staff").insert({
      name: "Developer",
      email: DEVELOPER_EMAIL,
      phone: "",
      password_hash: passwordHash,
      pin_hash: pinHash,
      role_id: DEVELOPER_ROLE_ID,
      is_developer: true,
      is_active: true,
      is_locked: false,
      pin_failed_attempts: 0,
      admin_access: true,
      pos_access: true,
    });
  } else {
    await knex("staff").where({ id: existingStaff.id }).update({
      password_hash: passwordHash,
      pin_hash: pinHash,
      role_id: DEVELOPER_ROLE_ID,
      is_developer: true,
      is_active: true,
      admin_access: true,
      pos_access: true,
    });
  }
}
