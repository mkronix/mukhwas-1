import { randomUUID } from "crypto";
import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";
import { InventoryTransactionEngine } from "../inventory/engine";
import { FIFOValuationService } from "../inventory/fifo";
import type { CreatePurchaseBillInput, RecordBillPaymentInput } from "./purchase-bills.schema";

function toDateStr(v: Date | string): string {
  if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
  return v.toISOString().slice(0, 10);
}

function paymentStatusFromAmounts(paid: number, total: number): "pending" | "paid" | "partial" {
  if (paid <= 0) return "pending";
  if (paid >= total) return "paid";
  return "partial";
}

async function mapBillRow(bill: Record<string, unknown>) {
  const items = await db("purchase_bill_items").where({ purchase_bill_id: bill.id });
  const payments = await db("purchase_bill_payments").where({ purchase_bill_id: bill.id }).orderBy("paid_at", "asc");
  return {
    id: bill.id as string,
    bill_number: bill.bill_number as string,
    po_id: (bill.po_id as string | null) ?? "",
    po_number: bill.po_number as string,
    supplier_id: bill.supplier_id as string,
    supplier_name: bill.supplier_name as string,
    supplier_gstin: bill.supplier_gstin as string,
    bill_date: toDateStr(bill.bill_date as Date | string),
    due_date: toDateStr(bill.due_date as Date | string),
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
    subtotal_paisa: Number(bill.subtotal_paisa),
    cgst_paisa: Number(bill.cgst_paisa),
    sgst_paisa: Number(bill.sgst_paisa),
    total_paisa: Number(bill.total_paisa),
    payment_status: bill.payment_status as string,
    paid_amount_paisa: Number(bill.paid_amount_paisa),
    payments: payments.map((p) => ({
      id: p.id as string,
      amount_paisa: Number(p.amount_paisa),
      date: new Date(p.paid_at as Date | string).toISOString(),
      mode: p.mode as string,
      reference: p.reference as string,
    })),
  };
}

export const PurchaseBillService = {
  async list() {
    const rows = await db("purchase_bills").orderBy("created_at", "desc");
    const out = [];
    for (const r of rows) {
      out.push(await mapBillRow(r));
    }
    return out;
  },

  async getById(id: string) {
    const row = await db("purchase_bills").where({ id }).first();
    if (!row) return null;
    return mapBillRow(row);
  },

  async nextBillNumber(): Promise<string> {
    const r = await db("purchase_bills").count<{ c: string }>("* as c").first();
    const n = Number(r?.c ?? 0) + 1;
    return `BILL-${2000 + n}`;
  },

  async create(input: CreatePurchaseBillInput, performedBy: string | null) {
    const sup = await db("suppliers").where({ id: input.supplier_id }).whereNull("deleted_at").first();
    if (!sup) throw ApiError.notFound("Supplier not found");
    const id = randomUUID();
    const bill_number = input.bill_number?.trim() || (await PurchaseBillService.nextBillNumber());
    const gstin = input.supplier_gstin?.trim() || (sup.gstin as string) || "";
    let po_number = input.po_number;
    if (input.po_id) {
      const po = await db("purchase_orders").where({ id: input.po_id }).first();
      if (!po) throw ApiError.notFound("Purchase order not found");
      po_number = po.po_number as string;
    }
    const billDate = new Date(toDateStr(input.bill_date));
    const payRows = [...input.payments];
    let paidSum = payRows.reduce((s, p) => s + p.amount_paisa, 0);
    if (paidSum === 0) paidSum = input.paid_amount_paisa;
    const initialPayStatus = paymentStatusFromAmounts(paidSum, input.total_paisa);
    await db.transaction(async (trx) => {
      await trx("purchase_bills").insert({
        id,
        bill_number,
        po_id: input.po_id ?? null,
        po_number,
        supplier_id: input.supplier_id,
        supplier_name: input.supplier_name,
        supplier_gstin: gstin,
        bill_date: toDateStr(input.bill_date),
        due_date: toDateStr(input.due_date),
        subtotal_paisa: input.subtotal_paisa,
        cgst_paisa: input.cgst_paisa,
        sgst_paisa: input.sgst_paisa,
        total_paisa: input.total_paisa,
        payment_status: initialPayStatus,
        paid_amount_paisa: paidSum,
      });
      for (const it of input.items) {
        await trx("purchase_bill_items").insert({
          id: randomUUID(),
          purchase_bill_id: id,
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
        const qty = Math.round(Number(it.quantity));
        if (qty > 0) {
          await FIFOValuationService.recordPurchaseCost(
            trx,
            "raw_material",
            it.raw_material_id,
            qty,
            it.unit_price_paisa,
            billDate,
            id
          );
          await InventoryTransactionEngine.addStock(
            trx,
            "raw_material",
            it.raw_material_id,
            qty,
            "purchase_receipt",
            "purchase_bill",
            id,
            performedBy,
            ""
          );
        }
      }
      for (const pr of payRows) {
        const pid = pr.id ?? randomUUID();
        await trx("purchase_bill_payments").insert({
          id: pid,
          purchase_bill_id: id,
          amount_paisa: pr.amount_paisa,
          paid_at: new Date(pr.date).toISOString(),
          mode: pr.mode,
          reference: pr.reference,
        });
      }
      if (input.po_id) {
        await trx("purchase_orders").where({ id: input.po_id }).update({
          status: "billed",
          updated_at: trx.fn.now(),
        });
      }
    });
    const created = await db("purchase_bills").where({ id }).first();
    if (!created) throw ApiError.internal("Bill create failed");
    return mapBillRow(created);
  },

  async recordPayment(billId: string, input: RecordBillPaymentInput, performedBy: string | null) {
    void performedBy;
    const bill = await db("purchase_bills").where({ id: billId }).first();
    if (!bill) throw ApiError.notFound("Bill not found");
    await db.transaction(async (trx) => {
      await trx("purchase_bill_payments").insert({
        id: randomUUID(),
        purchase_bill_id: billId,
        amount_paisa: input.amount,
        paid_at: new Date(input.date).toISOString(),
        mode: input.mode,
        reference: input.reference,
      });
      const paid = Number(bill.paid_amount_paisa) + input.amount;
      const total = Number(bill.total_paisa);
      const ps = paymentStatusFromAmounts(paid, total);
      await trx("purchase_bills").where({ id: billId }).update({
        paid_amount_paisa: paid,
        payment_status: ps,
        updated_at: trx.fn.now(),
      });
    });
    const updated = await db("purchase_bills").where({ id: billId }).first();
    if (!updated) throw ApiError.notFound("Bill not found");
    return mapBillRow(updated);
  },
};
