import { randomUUID } from "crypto";
import type { Knex } from "knex";
import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";
import { InventoryTransactionEngine } from "../inventory/engine";
import type { CreateProductionOrderInput } from "./production-orders.schema";
import {
  ProductionOrderRepository,
  type ActivityRow,
  type ProductionMaterialRow,
  type ProductionOrderRow,
} from "./production-orders.repository";

function iso(d: Date | string | null | undefined): string | undefined {
  if (d == null) return undefined;
  if (typeof d === "string") return d;
  return d.toISOString();
}

function toDateOnly(s: string): string {
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

async function resolveOutputVariantId(
  trx: Knex,
  order: ProductionOrderRow,
  overrideId?: string | null
): Promise<string> {
  if (overrideId) return overrideId;
  if (order.output_variant_id) return order.output_variant_id;
  const norm = (x: string) =>
    x
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const want = norm(order.product_variant);
  const rows = await trx("product_variants as pv")
    .join("products as p", "p.id", "pv.product_id")
    .whereNull("pv.deleted_at")
    .whereNull("p.deleted_at")
    .select("pv.id as id", trx.raw("concat_ws(' — ', p.name, pv.name) as label"));
  for (const r of rows) {
    const rec = r as { id: string; label: string };
    const label = norm(String(rec.label ?? ""));
    if (label === want) return rec.id;
  }
  throw ApiError.unprocessable(
    "Could not resolve output product variant; set output_variant_id on the order or use a matching variant label"
  );
}

function mapActivity(a: ActivityRow) {
  return {
    id: a.id,
    timestamp: iso(a.logged_at) ?? "",
    action: a.action,
    performed_by: a.performed_by,
  };
}

function mapMaterial(m: ProductionMaterialRow) {
  return {
    id: m.id,
    raw_material_id: m.raw_material_id,
    raw_material_name: m.raw_material_name,
    reserved_quantity: Number(m.reserved_quantity),
    actual_used: Number(m.actual_used),
    unit: m.unit,
    status: m.status as "reserved" | "consumed" | "released",
  };
}

async function toRecord(trx: Knex, row: ProductionOrderRow) {
  const [materials, activity] = await Promise.all([
    ProductionOrderRepository.materialsForOrder(trx, row.id),
    ProductionOrderRepository.activityForOrder(trx, row.id),
  ]);
  return {
    id: row.id,
    order_number: row.order_number,
    recipe_id: row.recipe_id,
    recipe_name: row.recipe_name,
    recipe_version: row.recipe_version,
    product_variant: row.product_variant,
    planned_quantity: Number(row.planned_quantity),
    actual_quantity: Number(row.actual_quantity),
    unit: row.unit,
    status: row.status,
    scheduled_date: toDateOnly(String(row.scheduled_date)),
    started_at: iso(row.started_at),
    completed_at: iso(row.completed_at),
    assigned_staff_id: row.assigned_staff_id,
    assigned_staff_name: row.assigned_staff_name,
    created_by: row.created_by,
    created_at: iso(row.created_at) ?? "",
    materials: materials.map(mapMaterial),
    activity_log: activity.map(mapActivity),
  };
}

export const ProductionOrderService = {
  async list() {
    return db.transaction(async (trx) => {
      const rows = await ProductionOrderRepository.list(trx);
      const out = [];
      for (const r of rows) {
        out.push(await toRecord(trx, r));
      }
      return out;
    });
  },

  async getById(id: string) {
    return db.transaction(async (trx) => {
      const row = await ProductionOrderRepository.findById(trx, id);
      if (!row) throw ApiError.notFound("Production order not found");
      return toRecord(trx, row);
    });
  },

  async create(input: CreateProductionOrderInput) {
    return db.transaction(async (trx) => {
      const id = randomUUID();
      const orderNumber = await ProductionOrderRepository.nextOrderNumber(trx);
      await ProductionOrderRepository.insertOrder(trx, {
        id,
        order_number: orderNumber,
        recipe_id: input.recipe_id,
        recipe_name: input.recipe_name,
        recipe_version: input.recipe_version,
        output_variant_id: input.output_variant_id ?? null,
        product_variant: input.product_variant,
        planned_quantity: input.planned_quantity,
        actual_quantity: 0,
        unit: input.unit,
        status: "planned",
        scheduled_date: toDateOnly(input.scheduled_date),
        started_at: null,
        completed_at: null,
        assigned_staff_id: input.assigned_staff_id,
        assigned_staff_name: input.assigned_staff_name,
        created_by: input.created_by,
      });
      for (const m of input.materials) {
        await ProductionOrderRepository.insertMaterial(trx, {
          id: randomUUID(),
          production_order_id: id,
          raw_material_id: m.raw_material_id,
          raw_material_name: m.raw_material_name,
          reserved_quantity: m.reserved_quantity,
          unit: m.unit,
          status: "reserved",
        });
      }
      await ProductionOrderRepository.insertActivity(
        trx,
        id,
        "Production order created",
        input.created_by || "System"
      );
      const row = await ProductionOrderRepository.findById(trx, id);
      if (!row) throw ApiError.internal("Failed to load production order");
      return toRecord(trx, row);
    });
  },

  async updateStatus(id: string, status: "in_progress" | "cancelled", staffName: string, staffId: string | null) {
    return db.transaction(async (trx) => {
      const row = await ProductionOrderRepository.findById(trx, id);
      if (!row) throw ApiError.notFound("Production order not found");
      if (row.status === "completed" || row.status === "cancelled") {
        throw ApiError.conflict("Order is already closed");
      }
      if (status === "in_progress") {
        if (row.status !== "planned") throw ApiError.conflict("Only planned orders can be started");
        const materials = await ProductionOrderRepository.materialsForOrder(trx, id);
        for (const m of materials) {
          const qty = Math.round(Number(m.reserved_quantity));
          if (qty <= 0) continue;
          const ok = await InventoryTransactionEngine.checkStock(trx, "raw_material", m.raw_material_id, qty);
          if (!ok) {
            throw ApiError.conflict("Insufficient stock for raw material", "INSUFFICIENT_STOCK", {
              raw_material_id: m.raw_material_id,
            });
          }
          const resvId = await InventoryTransactionEngine.reserveStock(
            trx,
            "raw_material",
            m.raw_material_id,
            qty,
            "production_order_material",
            m.id,
            staffId
          );
          await ProductionOrderRepository.updateMaterial(trx, m.id, {
            inventory_reservation_id: resvId,
            status: "reserved",
          });
        }
        await ProductionOrderRepository.updateOrder(trx, id, {
          status: "in_progress",
          started_at: new Date() as unknown as ProductionOrderRow["started_at"],
        });
        await ProductionOrderRepository.insertActivity(
          trx,
          id,
          "Production started",
          staffName || "Staff"
        );
      } else if (status === "cancelled") {
        const materials = await ProductionOrderRepository.materialsForOrder(trx, id);
        for (const m of materials) {
          if (m.inventory_reservation_id) {
            await InventoryTransactionEngine.releaseReservation(trx, m.inventory_reservation_id, staffId);
            await ProductionOrderRepository.updateMaterial(trx, m.id, {
              inventory_reservation_id: null,
              status: "released",
            });
          } else if (m.status !== "consumed") {
            await ProductionOrderRepository.updateMaterial(trx, m.id, { status: "released" });
          }
        }
        await ProductionOrderRepository.updateOrder(trx, id, { status: "cancelled" });
        await ProductionOrderRepository.insertActivity(
          trx,
          id,
          "Production cancelled",
          staffName || "Staff"
        );
      }
      const updated = await ProductionOrderRepository.findById(trx, id);
      if (!updated) throw ApiError.notFound("Production order not found");
      return toRecord(trx, updated);
    });
  },

  async complete(
    id: string,
    actualQuantity: number,
    materialUsage: Record<string, number>,
    staffName: string,
    staffId: string | null,
    outputVariantOverride?: string
  ) {
    return db.transaction(async (trx) => {
      const row = await ProductionOrderRepository.findById(trx, id);
      if (!row) throw ApiError.notFound("Production order not found");
      if (row.status !== "in_progress" && row.status !== "partially_completed") {
        throw ApiError.conflict("Order must be in progress to complete");
      }
      const materials = await ProductionOrderRepository.materialsForOrder(trx, id);
      const reopenPartial =
        row.status === "partially_completed" &&
        materials.every((m) => m.status === "consumed" && !m.inventory_reservation_id);
      if (reopenPartial) {
        const variantId = await resolveOutputVariantId(trx, row, outputVariantOverride ?? null);
        const outQty = Math.round(Number(actualQuantity));
        if (outQty > 0) {
          await InventoryTransactionEngine.addStock(
            trx,
            "finished_good",
            variantId,
            outQty,
            "production_in",
            "production_order",
            id,
            staffId,
            ""
          );
        }
        const planned = Number(row.planned_quantity);
        const nextStatus = outQty >= planned ? "completed" : "partially_completed";
        await ProductionOrderRepository.updateOrder(trx, id, {
          status: nextStatus,
          actual_quantity: outQty,
          completed_at: new Date() as unknown as ProductionOrderRow["completed_at"],
          output_variant_id: variantId,
        });
        const action =
          nextStatus === "partially_completed"
            ? `Production partially completed – ${outQty}${row.unit} produced`
            : `Production completed – ${outQty}${row.unit} produced`;
        await ProductionOrderRepository.insertActivity(trx, id, action, staffName || "Staff");
        const updated = await ProductionOrderRepository.findById(trx, id);
        if (!updated) throw ApiError.notFound("Production order not found");
        return toRecord(trx, updated);
      }
      for (const m of materials) {
        const planned = Math.round(Number(m.reserved_quantity));
        const actualRaw = materialUsage[m.raw_material_id];
        const actual = Math.round(actualRaw !== undefined ? Number(actualRaw) : planned);
        if (m.inventory_reservation_id) {
          await InventoryTransactionEngine.commitReservation(trx, m.inventory_reservation_id, actual, staffId);
          await ProductionOrderRepository.updateMaterial(trx, m.id, {
            inventory_reservation_id: null,
            actual_used: actual,
            status: "consumed",
          });
        } else if (actual > 0) {
          const ok = await InventoryTransactionEngine.checkStock(trx, "raw_material", m.raw_material_id, actual);
          if (!ok) throw ApiError.conflict("Insufficient raw material stock", "INSUFFICIENT_STOCK");
          await InventoryTransactionEngine.adjustStock(
            trx,
            "raw_material",
            m.raw_material_id,
            -actual,
            "Production consumption",
            staffId,
            "production_order",
            id
          );
          await ProductionOrderRepository.updateMaterial(trx, m.id, { actual_used: actual, status: "consumed" });
        }
      }
      const variantId = await resolveOutputVariantId(trx, row, outputVariantOverride ?? null);
      const outQty = Math.round(Number(actualQuantity));
      if (outQty > 0) {
        await InventoryTransactionEngine.addStock(
          trx,
          "finished_good",
          variantId,
          outQty,
          "production_in",
          "production_order",
          id,
          staffId,
          ""
        );
      }
      const planned = Number(row.planned_quantity);
      const nextStatus = outQty < planned ? "partially_completed" : "completed";
      await ProductionOrderRepository.updateOrder(trx, id, {
        status: nextStatus,
        actual_quantity: outQty,
        completed_at: new Date() as unknown as ProductionOrderRow["completed_at"],
        output_variant_id: variantId,
      });
      const action =
        nextStatus === "partially_completed"
          ? `Production partially completed – ${outQty}${row.unit} produced`
          : `Production completed – ${outQty}${row.unit} produced`;
      await ProductionOrderRepository.insertActivity(trx, id, action, staffName || "Staff");
      const updated = await ProductionOrderRepository.findById(trx, id);
      if (!updated) throw ApiError.notFound("Production order not found");
      return toRecord(trx, updated);
    });
  },

  async stats() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await db("production_orders").select("*");
    let planned = 0;
    let inProgress = 0;
    let completedToday = 0;
    for (const r of rows) {
      if (r.status === "planned") planned += 1;
      if (r.status === "in_progress") inProgress += 1;
      if (
        (r.status === "completed" || r.status === "partially_completed") &&
        r.completed_at &&
        String(r.completed_at).slice(0, 10) === today
      ) {
        completedToday += 1;
      }
    }
    const mats = await db("production_order_materials as m")
      .join("production_orders as o", "o.id", "m.production_order_id")
      .whereIn("o.status", ["planned", "in_progress"])
      .select("m.reserved_quantity");
    let reservationValue = 0;
    for (const x of mats) {
      reservationValue += Number(x.reserved_quantity) * 1000;
    }
    return { planned, inProgress, completedToday, reservationValue };
  },
};
