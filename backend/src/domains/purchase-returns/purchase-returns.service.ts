import { randomUUID } from "crypto";
import type { Knex } from "knex";
import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";
import { InventoryTransactionEngine } from "../inventory/engine";
import { FIFOValuationService } from "../inventory/fifo";
import type { CreatePurchaseReturnInput, PatchPurchaseReturnStatusInput } from "./purchase-returns.schema";

function iso(d: Date | string): string {
  if (typeof d === "string") return d;
  return d.toISOString();
}

async function resolveRawMaterialIdTrx(
  trx: Knex,
  name: string,
  hint?: string | null
): Promise<string | null> {
  if (hint) {
    const byId = await trx("raw_materials").where({ id: hint }).whereNull("deleted_at").first();
    if (byId) return byId.id as string;
  }
  const row = await trx("raw_materials")
    .whereNull("deleted_at")
    .whereRaw("lower(trim(name)) = lower(trim(?))", [name])
    .first();
  return row ? (row.id as string) : null;
}

async function mapReturnRow(ret: Record<string, unknown>) {
  const items = await db("purchase_return_items").where({ purchase_return_id: ret.id });
  return {
    id: ret.id as string,
    return_id: ret.return_id as string,
    bill_id: ret.bill_id as string,
    bill_number: ret.bill_number as string,
    supplier_id: ret.supplier_id as string,
    supplier_name: ret.supplier_name as string,
    return_date: iso(ret.return_date as Date | string),
    items: items.map((i) => ({
      raw_material_name: i.raw_material_name as string,
      quantity: Number(i.quantity),
      unit: i.unit as string,
      amount_paisa: Number(i.amount_paisa),
    })),
    total_paisa: Number(ret.total_paisa),
    reason: ret.reason as string,
    status: ret.status as string,
  };
}

export const PurchaseReturnService = {
  async list() {
    const rows = await db("purchase_returns").orderBy("created_at", "desc");
    const out = [];
    for (const r of rows) {
      out.push(await mapReturnRow(r));
    }
    return out;
  },

  async nextReturnId(): Promise<string> {
    const r = await db("purchase_returns").count<{ c: string }>("* as c").first();
    const n = Number(r?.c ?? 0) + 1;
    return `RET-P${100 + n}`;
  },

  async create(input: CreatePurchaseReturnInput) {
    const bill = await db("purchase_bills").where({ id: input.bill_id }).first();
    if (!bill) throw ApiError.notFound("Bill not found");
    const id = randomUUID();
    const return_id = await PurchaseReturnService.nextReturnId();
    await db.transaction(async (trx) => {
      await trx("purchase_returns").insert({
        id,
        return_id,
        bill_id: input.bill_id,
        bill_number: input.bill_number,
        supplier_id: input.supplier_id,
        supplier_name: input.supplier_name,
        return_date: new Date(input.return_date).toISOString(),
        total_paisa: input.total_paisa,
        reason: input.reason,
        status: input.status,
      });
      for (const it of input.items) {
        const rid = await resolveRawMaterialIdTrx(trx, it.raw_material_name, it.raw_material_id ?? null);
        await trx("purchase_return_items").insert({
          id: randomUUID(),
          purchase_return_id: id,
          raw_material_id: rid,
          raw_material_name: it.raw_material_name,
          quantity: it.quantity,
          unit: it.unit,
          amount_paisa: it.amount_paisa,
        });
      }
    });
    const row = await db("purchase_returns").where({ id }).first();
    if (!row) throw ApiError.internal("Return create failed");
    return await mapReturnRow(row);
  },

  async updateStatus(id: string, input: PatchPurchaseReturnStatusInput, performedBy: string | null) {
    const row = await db("purchase_returns").where({ id }).first();
    if (!row) throw ApiError.notFound("Return not found");
    const prev = row.status as string;
    await db.transaction(async (trx) => {
      if (input.status === "credited" && prev !== "credited") {
        const items = await trx("purchase_return_items").where({ purchase_return_id: id });
        for (const it of items) {
          const rid =
            (it.raw_material_id as string | null) ??
            (await resolveRawMaterialIdTrx(trx, it.raw_material_name as string, null));
          if (!rid) continue;
          const qty = Math.round(Number(it.quantity));
          if (qty <= 0) continue;
          await InventoryTransactionEngine.adjustStock(
            trx,
            "raw_material",
            rid,
            -qty,
            "Purchase return credited",
            performedBy,
            "purchase_return",
            id
          );
          await FIFOValuationService.reduceCostLayersLIFO(trx, "raw_material", rid, qty);
        }
      }
      await trx("purchase_returns").where({ id }).update({
        status: input.status,
        updated_at: trx.fn.now(),
      });
    });
    const updated = await db("purchase_returns").where({ id }).first();
    if (!updated) throw ApiError.notFound("Return not found");
    return await mapReturnRow(updated);
  },
};
