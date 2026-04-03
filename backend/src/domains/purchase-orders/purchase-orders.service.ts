import { randomUUID } from "crypto";
import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";
import type {
  CreatePurchaseOrderInput,
  PatchPurchaseOrderStatusInput,
  PutPosPurchaseOrderInput,
} from "./purchase-orders.schema";

function toDateStr(v: Date | string): string {
  if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
  return v.toISOString().slice(0, 10);
}

async function mapOrderRow(order: Record<string, unknown>) {
  const items = await db("purchase_order_items").where({ purchase_order_id: order.id });
  return {
    id: order.id as string,
    po_number: order.po_number as string,
    supplier_id: order.supplier_id as string,
    supplier_name: order.supplier_name as string,
    order_date: toDateStr(order.order_date as Date | string),
    expected_delivery: toDateStr(order.expected_delivery as Date | string),
    items: items.map((i) => ({
      id: i.id as string,
      raw_material_id: i.raw_material_id as string,
      raw_material_name: i.raw_material_name as string,
      quantity: Number(i.quantity),
      unit: i.unit as string,
      unit_price_paisa: Number(i.unit_price_paisa),
      hsn_code: i.hsn_code as string,
      gst_slab: i.gst_slab as string,
      taxable_paisa: Number(i.taxable_paisa),
      gst_amount_paisa: Number(i.gst_amount_paisa),
      total_paisa: Number(i.total_paisa),
    })),
    status: order.status as string,
    notes: order.notes as string,
    subtotal_paisa: Number(order.subtotal_paisa),
    cgst_paisa: Number(order.cgst_paisa),
    sgst_paisa: Number(order.sgst_paisa),
    total_paisa: Number(order.total_paisa),
    created_by: order.created_by as string,
  };
}

export const PurchaseOrderService = {
  async list() {
    const rows = await db("purchase_orders").orderBy("created_at", "desc");
    const out = [];
    for (const r of rows) {
      out.push(await mapOrderRow(r));
    }
    return out;
  },

  async getById(id: string) {
    const row = await db("purchase_orders").where({ id }).first();
    if (!row) return null;
    return mapOrderRow(row);
  },

  async nextPoNumber(): Promise<string> {
    const r = await db("purchase_orders").count<{ c: string }>("* as c").first();
    const n = Number(r?.c ?? 0) + 1;
    return `PO-${1100 + n}`;
  },

  async create(input: CreatePurchaseOrderInput) {
    const sup = await db("suppliers").where({ id: input.supplier_id }).whereNull("deleted_at").first();
    if (!sup) throw ApiError.notFound("Supplier not found");
    const id = randomUUID();
    const po_number = await PurchaseOrderService.nextPoNumber();
    await db.transaction(async (trx) => {
      await trx("purchase_orders").insert({
        id,
        po_number,
        supplier_id: input.supplier_id,
        supplier_name: input.supplier_name,
        order_date: toDateStr(input.order_date),
        expected_delivery: toDateStr(input.expected_delivery),
        status: input.status,
        notes: input.notes,
        subtotal_paisa: input.subtotal_paisa,
        cgst_paisa: input.cgst_paisa,
        sgst_paisa: input.sgst_paisa,
        total_paisa: input.total_paisa,
        created_by: input.created_by,
      });
      for (const it of input.items) {
        await trx("purchase_order_items").insert({
          id: randomUUID(),
          purchase_order_id: id,
          raw_material_id: it.raw_material_id,
          raw_material_name: it.raw_material_name,
          quantity: it.quantity,
          unit: it.unit,
          unit_price_paisa: it.unit_price_paisa,
          hsn_code: it.hsn_code,
          gst_slab: it.gst_slab,
          taxable_paisa: it.taxable_paisa,
          gst_amount_paisa: it.gst_amount_paisa,
          total_paisa: it.total_paisa,
        });
      }
    });
    const created = await db("purchase_orders").where({ id }).first();
    if (!created) throw ApiError.internal("PO create failed");
    return mapOrderRow(created);
  },

  async updateStatus(id: string, input: PatchPurchaseOrderStatusInput) {
    const row = await db("purchase_orders").where({ id }).first();
    if (!row) throw ApiError.notFound("Purchase order not found");
    await db("purchase_orders").where({ id }).update({
      status: input.status,
      updated_at: db.fn.now(),
    });
    const updated = await db("purchase_orders").where({ id }).first();
    if (!updated) throw ApiError.notFound("Purchase order not found");
    return mapOrderRow(updated);
  },

  async putForPos(id: string, input: PutPosPurchaseOrderInput) {
    const row = await db("purchase_orders").where({ id }).first();
    if (!row) throw ApiError.notFound("Purchase order not found");
    await db.transaction(async (trx) => {
      const patch: Record<string, unknown> = { updated_at: trx.fn.now() };
      if (input.supplier_id !== undefined) patch.supplier_id = input.supplier_id;
      if (input.supplier_name !== undefined) patch.supplier_name = input.supplier_name;
      if (input.order_date !== undefined) patch.order_date = toDateStr(input.order_date);
      if (input.expected_delivery !== undefined) patch.expected_delivery = toDateStr(input.expected_delivery);
      if (input.status !== undefined) patch.status = input.status;
      if (input.notes !== undefined) patch.notes = input.notes;
      if (input.subtotal_paisa !== undefined) patch.subtotal_paisa = input.subtotal_paisa;
      if (input.cgst_paisa !== undefined) patch.cgst_paisa = input.cgst_paisa;
      if (input.sgst_paisa !== undefined) patch.sgst_paisa = input.sgst_paisa;
      if (input.total_paisa !== undefined) patch.total_paisa = input.total_paisa;
      if (input.created_by !== undefined) patch.created_by = input.created_by;
      if (Object.keys(patch).length > 1) {
        await trx("purchase_orders").where({ id }).update(patch);
      }
      if (input.items && input.items.length > 0) {
        await trx("purchase_order_items").where({ purchase_order_id: id }).delete();
        for (const it of input.items) {
          await trx("purchase_order_items").insert({
            id: randomUUID(),
            purchase_order_id: id,
            raw_material_id: it.raw_material_id,
            raw_material_name: it.raw_material_name,
            quantity: it.quantity,
            unit: it.unit,
            unit_price_paisa: it.unit_price_paisa,
            hsn_code: it.hsn_code,
            gst_slab: it.gst_slab,
            taxable_paisa: it.taxable_paisa,
            gst_amount_paisa: it.gst_amount_paisa,
            total_paisa: it.total_paisa,
          });
        }
      }
    });
    const updated = await db("purchase_orders").where({ id }).first();
    if (!updated) throw ApiError.notFound("Purchase order not found");
    return mapOrderRow(updated);
  },
};
