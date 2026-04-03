import type { Knex } from "knex";

export type ProductionOrderRow = {
  id: string;
  order_number: string;
  recipe_id: string;
  recipe_name: string;
  recipe_version: number;
  output_variant_id: string | null;
  product_variant: string;
  planned_quantity: number;
  actual_quantity: number;
  unit: string;
  status: string;
  scheduled_date: Date | string;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  assigned_staff_id: string;
  assigned_staff_name: string;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
};

export type ProductionMaterialRow = {
  id: string;
  production_order_id: string;
  raw_material_id: string;
  raw_material_name: string;
  reserved_quantity: number;
  actual_used: number;
  unit: string;
  status: string;
  inventory_reservation_id: string | null;
};

export type ActivityRow = {
  id: string;
  production_order_id: string;
  logged_at: Date | string;
  action: string;
  performed_by: string;
};

export const ProductionOrderRepository = {
  async nextOrderNumber(trx: Knex): Promise<string> {
    const row = await trx("production_orders").count<{ c: string }>("* as c").first();
    const n = Number(row?.c ?? 0) + 1;
    return `PROD-${3000 + n}`;
  },

  async insertOrder(trx: Knex, row: Omit<ProductionOrderRow, "created_at" | "updated_at">): Promise<void> {
    await trx("production_orders").insert({
      id: row.id,
      order_number: row.order_number,
      recipe_id: row.recipe_id,
      recipe_name: row.recipe_name,
      recipe_version: row.recipe_version,
      output_variant_id: row.output_variant_id,
      product_variant: row.product_variant,
      planned_quantity: row.planned_quantity,
      actual_quantity: row.actual_quantity,
      unit: row.unit,
      status: row.status,
      scheduled_date: row.scheduled_date,
      started_at: row.started_at,
      completed_at: row.completed_at,
      assigned_staff_id: row.assigned_staff_id,
      assigned_staff_name: row.assigned_staff_name,
      created_by: row.created_by,
    });
  },

  async insertMaterial(
    trx: Knex,
    row: Omit<ProductionMaterialRow, "actual_used" | "inventory_reservation_id"> & {
      actual_used?: number;
      inventory_reservation_id?: string | null;
    }
  ): Promise<void> {
    await trx("production_order_materials").insert({
      id: row.id,
      production_order_id: row.production_order_id,
      raw_material_id: row.raw_material_id,
      raw_material_name: row.raw_material_name,
      reserved_quantity: row.reserved_quantity,
      actual_used: row.actual_used ?? 0,
      unit: row.unit,
      status: row.status,
      inventory_reservation_id: row.inventory_reservation_id ?? null,
    });
  },

  async insertActivity(
    trx: Knex,
    productionOrderId: string,
    action: string,
    performedBy: string
  ): Promise<void> {
    await trx("production_order_activity_log").insert({
      production_order_id: productionOrderId,
      action,
      performed_by: performedBy,
    });
  },

  async findById(trx: Knex, id: string): Promise<ProductionOrderRow | undefined> {
    return trx("production_orders").where({ id }).first();
  },

  async list(trx: Knex): Promise<ProductionOrderRow[]> {
    return trx("production_orders").orderBy("created_at", "desc");
  },

  async materialsForOrder(trx: Knex, productionOrderId: string): Promise<ProductionMaterialRow[]> {
    return trx("production_order_materials").where({ production_order_id: productionOrderId });
  },

  async activityForOrder(trx: Knex, productionOrderId: string): Promise<ActivityRow[]> {
    return trx("production_order_activity_log")
      .where({ production_order_id: productionOrderId })
      .orderBy("logged_at", "asc");
  },

  async updateOrder(trx: Knex, id: string, patch: Partial<ProductionOrderRow>): Promise<void> {
    await trx("production_orders").where({ id }).update({ ...patch, updated_at: trx.fn.now() });
  },

  async updateMaterial(
    trx: Knex,
    id: string,
    patch: Partial<ProductionMaterialRow>
  ): Promise<void> {
    await trx("production_order_materials").where({ id }).update({ ...patch, updated_at: trx.fn.now() });
  },
};
