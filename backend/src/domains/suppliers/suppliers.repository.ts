import { db } from "../../database/knex";
import type { CreateSupplierInput, SupplierListQuery, UpdateSupplierInput, SupplierLedgerQuery } from "./suppliers.schema";

export class SupplierRepository {
  static async findAll(query: SupplierListQuery) {
    const base = db("suppliers").whereNull("suppliers.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      base.where(function () {
        this.whereILike("suppliers.name", term)
          .orWhereILike("suppliers.email", term)
          .orWhereILike("suppliers.phone", term);
      });
    }
    if (query.is_active !== undefined) {
      base.where("suppliers.is_active", query.is_active === "true");
    }

    const countRow = await base.clone().count("suppliers.id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;

    const hasPurchaseBills = await db.schema.hasTable("purchase_bills");
    const hasJournal = await db.schema.hasTable("journal_entries");

    const outstandingSql = hasJournal
      ? `(SELECT COALESCE(SUM(je.credit_paisa),0) - COALESCE(SUM(je.debit_paisa),0) FROM journal_entries je WHERE je.supplier_id = suppliers.id)`
      : "0";

    const lastPurchaseSql = hasPurchaseBills
      ? `(SELECT MAX(pb.bill_date) FROM purchase_bills pb WHERE pb.supplier_id = suppliers.id)`
      : "NULL::timestamptz";

    const rows = await base
      .clone()
      .select(
        "suppliers.*",
        db.raw(`${outstandingSql} as outstanding_paisa`),
        db.raw(`${lastPurchaseSql} as last_purchase_date`),
        db.raw(
          `(SELECT COUNT(*)::int FROM supplier_raw_materials srm WHERE srm.supplier_id::text = suppliers.id::text) as linked_materials_count`
        )
      )
      .orderBy("suppliers.name", "asc")
      .limit(query.limit)
      .offset(offset);

    return { rows, total };
  }

  static async findById(id: string) {
    return db("suppliers").where({ id }).whereNull("deleted_at").first();
  }

  static async findEnrichedById(id: string) {
    const hasPurchaseBills = await db.schema.hasTable("purchase_bills");
    const hasJournal = await db.schema.hasTable("journal_entries");
    const outstandingSql = hasJournal
      ? `(SELECT COALESCE(SUM(je.credit_paisa),0) - COALESCE(SUM(je.debit_paisa),0) FROM journal_entries je WHERE je.supplier_id = suppliers.id)`
      : "0";
    const lastPurchaseSql = hasPurchaseBills
      ? `(SELECT MAX(pb.bill_date) FROM purchase_bills pb WHERE pb.supplier_id = suppliers.id)`
      : "NULL::timestamptz";
    return db("suppliers")
      .where("suppliers.id", id)
      .whereNull("suppliers.deleted_at")
      .select(
        "suppliers.*",
        db.raw(`${outstandingSql} as outstanding_paisa`),
        db.raw(`${lastPurchaseSql} as last_purchase_date`),
        db.raw(
          `(SELECT COUNT(*)::int FROM supplier_raw_materials srm WHERE srm.supplier_id::text = suppliers.id::text) as linked_materials_count`
        )
      )
      .first();
  }

  static async findByEmail(email: string, excludeId?: string) {
    const q = db("suppliers")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .whereNull("deleted_at")
      .where("is_active", true);
    if (excludeId) q.whereNot("id", excludeId);
    return q.first();
  }

  static async create(data: CreateSupplierInput) {
    const [row] = await db("suppliers").insert(data).returning("*");
    return row;
  }

  static async update(id: string, data: UpdateSupplierInput) {
    const [row] = await db("suppliers")
      .where({ id })
      .whereNull("deleted_at")
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return row;
  }

  static async softDelete(id: string) {
    await db("suppliers").where({ id }).update({ deleted_at: db.fn.now() });
  }

  static async linkedMaterials(supplierId: string) {
    return db("supplier_raw_materials as srm")
      .join("raw_materials as rm", "rm.id", "srm.raw_material_id")
      .leftJoin("units as u", "u.id", "rm.unit_id")
      .where("srm.supplier_id", supplierId)
      .whereNull("rm.deleted_at")
      .select(
        "rm.id as raw_material_id",
        "rm.name as raw_material_name",
        "u.name as unit_name",
        "u.abbreviation as unit_abbreviation",
        "srm.is_preferred"
      )
      .orderBy("rm.name", "asc");
  }

  static async ledgerSummary(supplierId: string) {
    const hasJournal = await db.schema.hasTable("journal_entries");
    if (!hasJournal) {
      return { total_billed_paisa: 0, total_paid_paisa: 0, outstanding_paisa: 0 };
    }
    const row = await db("journal_entries")
      .where({ supplier_id: supplierId })
      .select(
        db.raw("COALESCE(SUM(credit_paisa), 0) as total_billed"),
        db.raw("COALESCE(SUM(debit_paisa), 0) as total_paid")
      )
      .first();
    const billed = Number(row?.total_billed ?? 0);
    const paid = Number(row?.total_paid ?? 0);
    return {
      total_billed_paisa: billed,
      total_paid_paisa: paid,
      outstanding_paisa: billed - paid,
    };
  }

  static async ledgerEntries(supplierId: string, query: SupplierLedgerQuery) {
    const hasJournal = await db.schema.hasTable("journal_entries");
    if (!hasJournal) {
      return { rows: [] as Record<string, unknown>[], total: 0 };
    }
    const base = db("journal_entries").where({ supplier_id: supplierId });
    const countRow = await base.clone().count("id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;
    const rows = await base
      .clone()
      .orderBy("created_at", "desc")
      .orderBy("id", "desc")
      .limit(query.limit)
      .offset(offset);
    return { rows, total };
  }

  static async hasBlockingPurchaseActivity(supplierId: string): Promise<boolean> {
    const hasPo = await db.schema.hasTable("purchase_orders");
    if (hasPo) {
      const po = await db("purchase_orders")
        .where({ supplier_id: supplierId })
        .whereIn("status", ["draft", "sent", "received"])
        .first();
      if (po) return true;
    }
    const hasBills = await db.schema.hasTable("purchase_bills");
    if (hasBills) {
      const bill = await db("purchase_bills")
        .where({ supplier_id: supplierId })
        .whereNot("payment_status", "paid")
        .first();
      if (bill) return true;
    }
    return false;
  }
}
