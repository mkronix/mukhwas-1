import type { Knex } from "knex";
import { ApiError } from "../../utils/ApiError";

export type InventoryItemType = "finished_good" | "raw_material";

async function readStock(trx: Knex, itemType: InventoryItemType, itemId: string): Promise<number> {
  if (itemType === "finished_good") {
    const v = await trx("product_variants").where({ id: itemId }).whereNull("deleted_at").first();
    if (!v) throw ApiError.notFound("Variant not found");
    return Number(v.current_stock ?? 0);
  }
  const r = await trx("raw_materials").where({ id: itemId }).whereNull("deleted_at").first();
  if (!r) throw ApiError.notFound("Raw material not found");
  return Number(r.current_stock ?? 0);
}

async function writeStock(trx: Knex, itemType: InventoryItemType, itemId: string, next: number): Promise<void> {
  if (itemType === "finished_good") {
    await trx("product_variants").where({ id: itemId }).update({
      current_stock: Math.max(0, Math.round(next)),
      updated_at: trx.fn.now(),
    });
    return;
  }
  await trx("raw_materials").where({ id: itemId }).update({
    current_stock: Math.max(0, next),
    updated_at: trx.fn.now(),
  });
}

async function resolveUnitId(trx: Knex, itemType: InventoryItemType, itemId: string): Promise<string> {
  if (itemType === "finished_good") {
    const v = await trx("product_variants as pv")
      .where("pv.id", itemId)
      .whereNull("pv.deleted_at")
      .select("pv.weight_unit_id as uid")
      .first();
    if (!v?.uid) throw ApiError.notFound("Variant not found");
    return v.uid as string;
  }
  const r = await trx("raw_materials").where({ id: itemId }).whereNull("deleted_at").first();
  if (!r?.unit_id) throw ApiError.notFound("Raw material not found");
  return r.unit_id as string;
}

async function reservedActive(trx: Knex, itemType: InventoryItemType, itemId: string): Promise<number> {
  const row = await trx("inventory_reservations")
    .where({ item_type: itemType, item_id: itemId, status: "active" })
    .sum("quantity_reserved as s")
    .first();
  return Number(row?.s ?? 0);
}

export const InventoryTransactionEngine = {
  async checkStock(trx: Knex, itemType: InventoryItemType, itemId: string, quantity: number): Promise<boolean> {
    const stock = await readStock(trx, itemType, itemId);
    const res = await reservedActive(trx, itemType, itemId);
    return stock - res >= quantity;
  },

  async reserveStock(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    quantity: number,
    referenceType: string,
    referenceId: string,
    performedBy: string | null
  ): Promise<string> {
    const [row] = await trx("inventory_reservations")
      .insert({
        item_type: itemType,
        item_id: itemId,
        quantity_reserved: Math.round(quantity),
        reference_type: referenceType,
        reference_id: referenceId,
        status: "active",
      })
      .returning("id");
    void performedBy;
    return row.id as string;
  },

  async commitReservation(
    trx: Knex,
    reservationId: string,
    actualQuantity: number,
    performedBy: string | null
  ): Promise<Record<string, unknown>> {
    const resv = await trx("inventory_reservations").where({ id: reservationId }).forUpdate().first();
    if (!resv) throw ApiError.notFound("Reservation not found");
    if (resv.status !== "active") throw ApiError.conflict("Reservation not active");

    const itemType = resv.item_type as InventoryItemType;
    const itemId = resv.item_id as string;
    const reserved = Number(resv.quantity_reserved);
    const actual = Math.round(actualQuantity);
    const unitId = await resolveUnitId(trx, itemType, itemId);

    const before = await readStock(trx, itemType, itemId);
    const deduct = Math.min(actual, before);
    const after = before - deduct;
    await writeStock(trx, itemType, itemId, after);

    const [mov] = await trx("inventory_movements")
      .insert({
        item_type: itemType,
        item_id: itemId,
        movement_type: "production_out",
        quantity_change: -deduct,
        stock_before: Math.round(before),
        stock_after: Math.round(after),
        unit_id: unitId,
        reference_type: resv.reference_type as string,
        reference_id: resv.reference_id as string,
        performed_by: performedBy,
        notes: "",
      })
      .returning("*");

    await trx("inventory_reservations").where({ id: reservationId }).update({
      status: "released",
      updated_at: trx.fn.now(),
    });

    return mov;
  },

  async releaseReservation(trx: Knex, reservationId: string, performedBy: string | null): Promise<void> {
    const resv = await trx("inventory_reservations").where({ id: reservationId }).forUpdate().first();
    if (!resv) throw ApiError.notFound("Reservation not found");
    if (resv.status !== "active") return;

    const itemType = resv.item_type as InventoryItemType;
    const itemId = resv.item_id as string;
    const unitId = await resolveUnitId(trx, itemType, itemId);
    const before = await readStock(trx, itemType, itemId);

    await trx("inventory_movements").insert({
      item_type: itemType,
      item_id: itemId,
      movement_type: "reversal",
      quantity_change: 0,
      stock_before: Math.round(before),
      stock_after: Math.round(before),
      unit_id: unitId,
      reference_type: resv.reference_type as string,
      reference_id: resv.reference_id as string,
      performed_by: performedBy,
      notes: "Reservation released",
    });

    await trx("inventory_reservations").where({ id: reservationId }).update({
      status: "released",
      updated_at: trx.fn.now(),
    });
  },

  async adjustStock(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    delta: number,
    reason: string,
    performedBy: string | null,
    referenceType?: string,
    referenceId?: string
  ): Promise<Record<string, unknown>> {
    if (!reason?.trim()) throw ApiError.unprocessable("Reason is required");
    const unitId = await resolveUnitId(trx, itemType, itemId);
    const before = await readStock(trx, itemType, itemId);
    const next = before + delta;
    if (next < 0) {
      throw ApiError.conflict("Stock cannot be negative", "INSUFFICIENT_STOCK", {
        current_stock: before,
        requested_removal: Math.abs(delta),
      });
    }
    await writeStock(trx, itemType, itemId, next);
    const [mov] = await trx("inventory_movements")
      .insert({
        item_type: itemType,
        item_id: itemId,
        movement_type: "manual_adjustment",
        quantity_change: Math.round(delta),
        stock_before: Math.round(before),
        stock_after: Math.round(next),
        unit_id: unitId,
        reference_type: referenceType ?? "adjustment",
        reference_id: referenceId ?? "",
        performed_by: performedBy,
        notes: reason,
      })
      .returning("*");
    return mov;
  },

  async reverseMovement(trx: Knex, movementId: string, performedBy: string | null): Promise<Record<string, unknown>> {
    const orig = await trx("inventory_movements").where({ id: movementId }).first();
    if (!orig) throw ApiError.notFound("Movement not found");

    const itemType = orig.item_type as InventoryItemType;
    const itemId = orig.item_id as string;
    const unitId = await resolveUnitId(trx, itemType, itemId);
    const before = await readStock(trx, itemType, itemId);
    const q = Number(orig.quantity_change);
    const next = before - q;
    if (next < 0) {
      throw ApiError.conflict("Reversal would make stock negative", "INSUFFICIENT_STOCK", {
        current_stock: before,
      });
    }
    await writeStock(trx, itemType, itemId, next);

    const [mov] = await trx("inventory_movements")
      .insert({
        item_type: itemType,
        item_id: itemId,
        movement_type: "reversal",
        quantity_change: -q,
        stock_before: Math.round(before),
        stock_after: Math.round(next),
        unit_id: unitId,
        reference_type: "reversal_of",
        reference_id: movementId,
        performed_by: performedBy,
        notes: "",
      })
      .returning("*");
    return mov;
  },

  async addStock(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    quantity: number,
    movementType: "purchase_receipt" | "production_in",
    referenceType: string,
    referenceId: string,
    performedBy: string | null,
    notes?: string
  ): Promise<Record<string, unknown>> {
    const unitId = await resolveUnitId(trx, itemType, itemId);
    const before = await readStock(trx, itemType, itemId);
    const add = Math.max(0, Math.round(Number(quantity)));
    if (add === 0) {
      return {
        item_type: itemType,
        item_id: itemId,
        movement_type: movementType,
        quantity_change: 0,
        stock_before: Math.round(before),
        stock_after: Math.round(before),
        unit_id: unitId,
        reference_type: referenceType,
        reference_id: referenceId,
        performed_by: performedBy,
        notes: notes ?? "",
      };
    }
    const next = before + add;
    await writeStock(trx, itemType, itemId, next);
    const [mov] = await trx("inventory_movements")
      .insert({
        item_type: itemType,
        item_id: itemId,
        movement_type: movementType,
        quantity_change: add,
        stock_before: Math.round(before),
        stock_after: Math.round(next),
        unit_id: unitId,
        reference_type: referenceType,
        reference_id: referenceId,
        performed_by: performedBy,
        notes: notes ?? "",
      })
      .returning("*");
    return mov;
  },

  async removeStock(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    quantity: number,
    referenceType: string,
    referenceId: string,
    performedBy: string | null,
    movementType: "sale" | "pos_sale" = "pos_sale"
  ): Promise<Record<string, unknown>> {
    const unitId = await resolveUnitId(trx, itemType, itemId);
    const before = await readStock(trx, itemType, itemId);
    const q = Math.round(quantity);
    const next = before - q;
    if (next < 0) {
      throw ApiError.conflict("Insufficient stock", "INSUFFICIENT_STOCK", {
        current_stock: before,
        requested: q,
      });
    }
    await writeStock(trx, itemType, itemId, next);
    const [mov] = await trx("inventory_movements")
      .insert({
        item_type: itemType,
        item_id: itemId,
        movement_type: movementType,
        quantity_change: -q,
        stock_before: Math.round(before),
        stock_after: Math.round(next),
        unit_id: unitId,
        reference_type: referenceType,
        reference_id: referenceId,
        performed_by: performedBy,
        notes: "",
      })
      .returning("*");
    return mov;
  },
};
