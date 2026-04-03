import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/pagination";
import { db } from "../../database/knex";
import { SupplierRepository } from "./suppliers.repository";
import type {
  CreateSupplierInput,
  SupplierListQuery,
  UpdateSupplierInput,
  SupplierLedgerQuery,
} from "./suppliers.schema";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function assertGstin(gstin: string | null | undefined) {
  if (gstin === null || gstin === undefined || gstin === "") return;
  if (!GSTIN_RE.test(gstin.toUpperCase())) {
    throw ApiError.unprocessable("Invalid GSTIN format");
  }
}

function mapListRow(row: Record<string, unknown>) {
  const last = row.last_purchase_date as Date | string | null;
  return {
    id: row.id,
    name: row.name,
    contact_person: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    gstin: row.gstin ?? "",
    pan: row.pan ?? "",
    payment_terms: row.payment_terms,
    is_active: row.is_active,
    bank_name: row.bank_name,
    account_number: row.account_number,
    ifsc_code: row.ifsc_code,
    account_holder: row.account_holder,
    outstanding_paisa: Number(row.outstanding_paisa ?? 0),
    last_purchase_date: last ? new Date(last as Date).toISOString() : "",
    linked_materials_count: Number(row.linked_materials_count ?? 0),
    created_at: row.created_at ? new Date(row.created_at as Date).toISOString() : "",
  };
}

export class SupplierService {
  static async list(query: SupplierListQuery) {
    const { rows, total } = await SupplierRepository.findAll(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows.map(mapListRow), meta };
  }

  static async getById(id: string) {
    const row = await SupplierRepository.findEnrichedById(id);
    if (!row) throw ApiError.notFound("Supplier not found");
    const linked = await SupplierRepository.linkedMaterials(id);
    const ledger = await SupplierRepository.ledgerSummary(id);
    const listRow = mapListRow({
      ...row,
      outstanding_paisa: ledger.outstanding_paisa,
      linked_materials_count: linked.length,
    });
    return {
      ...listRow,
      linked_raw_materials: linked.map((r) => ({
        raw_material_id: r.raw_material_id,
        raw_material_name: r.raw_material_name,
        unit: r.unit_abbreviation ?? r.unit_name ?? "",
        is_preferred: r.is_preferred,
      })),
      ledger_summary: {
        total_billed_paisa: ledger.total_billed_paisa,
        total_paid_paisa: ledger.total_paid_paisa,
        outstanding_paisa: ledger.outstanding_paisa,
      },
    };
  }

  static async create(input: CreateSupplierInput) {
    assertGstin(input.gstin ?? undefined);
    const dup = await SupplierRepository.findByEmail(input.email);
    if (dup) throw ApiError.conflict("Email already in use for an active supplier");
    const row = await SupplierRepository.create(input);
    return mapListRow({
      ...row,
      outstanding_paisa: 0,
      last_purchase_date: null,
      linked_materials_count: 0,
    });
  }

  static async update(id: string, input: UpdateSupplierInput) {
    const existing = await SupplierRepository.findById(id);
    if (!existing) throw ApiError.notFound("Supplier not found");
    if (input.gstin !== undefined) assertGstin(input.gstin);
    if (input.email) {
      const dup = await SupplierRepository.findByEmail(input.email, id);
      if (dup) throw ApiError.conflict("Email already in use for an active supplier");
    }
    const row = await SupplierRepository.update(id, input);
    if (!row) throw ApiError.notFound("Supplier not found");
    const enriched = await SupplierRepository.findEnrichedById(id);
    if (enriched) return mapListRow(enriched as Record<string, unknown>);
    return mapListRow({
      ...row,
      outstanding_paisa: 0,
      last_purchase_date: null,
      linked_materials_count: 0,
    });
  }

  static async remove(id: string) {
    const existing = await SupplierRepository.findById(id);
    if (!existing) throw ApiError.notFound("Supplier not found");
    const hasPo = await SupplierRepository.hasBlockingPurchaseActivity(id);
    if (hasPo) {
      throw ApiError.conflict("Supplier has active purchase orders or unpaid bills");
    }
    await SupplierRepository.softDelete(id);
  }

  static async ledger(id: string, query: SupplierLedgerQuery) {
    const existing = await SupplierRepository.findById(id);
    if (!existing) throw ApiError.notFound("Supplier not found");
    const hasJournal = await db.schema.hasTable("journal_entries");
    if (!hasJournal) {
      return {
        data: [],
        meta: buildPaginationMeta({ page: query.page, limit: query.limit, total: 0 }),
      };
    }
    const totalRow = await db("journal_entries").where({ supplier_id: id }).count("id as count").first();
    const total = Number(totalRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;
    const rows = await db.raw(
      `
      WITH ordered AS (
        SELECT je.*,
          SUM(COALESCE(je.credit_paisa,0) - COALESCE(je.debit_paisa,0))
            OVER (ORDER BY je.created_at ASC, je.id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance_paisa
        FROM journal_entries je
        WHERE je.supplier_id = ?
      )
      SELECT * FROM ordered
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `,
      [id, query.limit, offset]
    );
    const data = (rows.rows as Record<string, unknown>[]).map((e) => ({
      id: e.id,
      supplier_id: id,
      supplier_name: existing.name,
      date: e.created_at ? new Date(e.created_at as string).toISOString() : "",
      description: String(e.description ?? ""),
      reference_type: String(e.reference_type ?? ""),
      reference_id: String(e.reference_id ?? ""),
      debit_paisa: Number(e.debit_paisa ?? 0),
      credit_paisa: Number(e.credit_paisa ?? 0),
      balance_paisa: Number(e.balance_paisa ?? 0),
    }));
    return { data, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
  }
}
