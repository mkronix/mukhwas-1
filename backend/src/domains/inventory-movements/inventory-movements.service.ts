import { db } from "../../database/knex";
import { buildPaginationMeta } from "../../utils/pagination";
import { InventoryMovementsRepository } from "./inventory-movements.repository";
import type { MovementsLogQuery } from "./inventory-movements.schema";

const typeLabels: Record<string, string> = {
  purchase_receipt: "Purchase Receipt",
  production_in: "Production In",
  production_out: "Production Out",
  sale: "Sale",
  pos_sale: "POS Sale",
  manual_adjustment: "Adjustment",
  reversal: "Reversal",
};

export class InventoryMovementsService {
  static async list(query: MovementsLogQuery) {
    const { rows, total } = await InventoryMovementsRepository.list(query);
    const data = rows.map((r) => ({
      id: r.id,
      timestamp: r.created_at ? new Date(r.created_at as Date).toISOString() : "",
      movement_type: r.movement_type,
      item_name: String(r.item_name ?? ""),
      item_type: r.item_type,
      quantity_change: Number(r.quantity_change),
      stock_before: Number(r.stock_before),
      stock_after: Number(r.stock_after),
      unit: String(r.unit_abbr ?? ""),
      reference: String(r.reference_id ?? ""),
      reference_label:
        r.movement_type === "manual_adjustment" && r.notes
          ? `ADJ: ${r.notes}`
          : `${r.reference_type}:${r.reference_id}`,
      performed_by: String(r.staff_name ?? ""),
    }));
    return { data, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
  }

  static async exportCsv(query: MovementsLogQuery): Promise<string> {
    const wide = { ...query, page: 1, limit: 10000 };
    const { rows } = await InventoryMovementsRepository.list(wide);
    const header = "Date,Type,Item,Item Type,Qty Change,Before,After,Unit,Reference,By\n";
    const lines = rows.map((r) => {
      const ts = r.created_at ? new Date(r.created_at as Date).toISOString() : "";
      const label = typeLabels[String(r.movement_type)] ?? String(r.movement_type);
      const itemName = String(r.item_name ?? "").replace(/,/g, " ");
      const ref =
        r.movement_type === "manual_adjustment" && r.notes
          ? `ADJ: ${String(r.notes).replace(/,/g, " ")}`
          : `${r.reference_type}:${r.reference_id}`;
      return [
        ts,
        label,
        itemName,
        r.item_type,
        String(r.quantity_change),
        String(r.stock_before),
        String(r.stock_after),
        String(r.unit_abbr ?? ""),
        ref.replace(/,/g, " "),
        String(r.staff_name ?? "").replace(/,/g, " "),
      ].join(",");
    });
    return header + lines.join("\n");
  }
}
