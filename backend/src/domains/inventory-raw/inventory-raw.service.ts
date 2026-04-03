import { ApiError } from "../../utils/ApiError";
import { db } from "../../database/knex";
import { buildPaginationMeta } from "../../utils/pagination";
import { FIFOValuationService } from "../inventory/fifo";
import { InventoryTransactionEngine } from "../inventory/engine";
import { InventoryRawRepository } from "./inventory-raw.repository";
import type { RawInventoryListQuery, RawAdjustInput } from "./inventory-raw.schema";

function computeStatus(stock: number, reorder: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock";
  if (stock <= reorder) return "low_stock";
  return "in_stock";
}

export class InventoryRawService {
  static async list(query: RawInventoryListQuery) {
    const raw = await InventoryRawRepository.listBase(query);
    const enriched = await Promise.all(
      raw.map(async (r) => {
        const id = r.id as string;
        const stock = Number(r.current_stock ?? 0);
        const reorder = Number(r.reorder_level ?? 0);
        const stock_value_paisa = await FIFOValuationService.getInventoryValue(db, "raw_material", id);
        const linked = await db("supplier_raw_materials as srm")
          .join("suppliers as sp", "sp.id", "srm.supplier_id")
          .where("srm.raw_material_id", id)
          .select("srm.supplier_id", "sp.name as supplier_name", "srm.is_preferred");

        return {
          id,
          name: r.name as string,
          description: r.description as string,
          current_stock: stock,
          unit: String(r.unit_abbr ?? r.unit_name ?? ""),
          reorder_level: reorder,
          preferred_supplier_id: r.preferred_supplier_id as string,
          preferred_supplier_name: String(r.preferred_supplier_name ?? ""),
          hsn_code: r.hsn_code as string,
          gst_slab: r.gst_slab as string,
          last_purchase_date: r.last_purchase_date
            ? new Date(r.last_purchase_date as Date).toISOString()
            : "",
          cost_per_unit_paisa: Number(r.cost_per_unit_paisa ?? 0),
          status: computeStatus(stock, reorder),
          stock_value_paisa,
          linked_suppliers: linked.map((x) => ({
            supplier_id: x.supplier_id as string,
            supplier_name: x.supplier_name as string,
            is_preferred: Boolean(x.is_preferred),
          })),
          last_movement_date: r.last_movement_at
            ? new Date(r.last_movement_at as Date).toISOString()
            : "",
          _sort_stock_value: stock_value_paisa,
          _sort_last: r.last_movement_at ? new Date(r.last_movement_at as Date).getTime() : 0,
        };
      })
    );

    enriched.sort((a, b) => {
      let cmp = 0;
      if (query.sort_by === "current_stock") cmp = a.current_stock - b.current_stock;
      else if (query.sort_by === "stock_value") cmp = a._sort_stock_value - b._sort_stock_value;
      else if (query.sort_by === "last_movement_date") cmp = a._sort_last - b._sort_last;
      else cmp = a.name.localeCompare(b.name);
      return query.sort_order === "desc" ? -cmp : cmp;
    });

    const total = enriched.length;
    const offset = (query.page - 1) * query.limit;
    const page = enriched.slice(offset, offset + query.limit).map((x) => {
      const { _sort_stock_value: _a, _sort_last: _b, ...rest } = x;
      void _a;
      void _b;
      return rest;
    });

    return {
      data: page,
      meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
    };
  }

  static async stats() {
    const raw = await InventoryRawRepository.listBase({
      page: 1,
      limit: 500,
      sort_by: "name",
      sort_order: "asc",
    });
    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const items: unknown[] = [];
    for (const r of raw) {
      const id = r.id as string;
      const stock = Number(r.current_stock ?? 0);
      const reorder = Number(r.reorder_level ?? 0);
      const st = computeStatus(stock, reorder);
      if (st === "low_stock") lowStock += 1;
      if (st === "out_of_stock") outOfStock += 1;
      const v = await FIFOValuationService.getInventoryValue(db, "raw_material", id);
      totalValue += v;
      items.push({
        raw_material_id: id,
        name: r.name,
        current_stock: stock,
        stock_value_paisa: v,
      });
    }
    return {
      totalSkus: raw.length,
      totalValue,
      lowStock,
      outOfStock,
      items,
    };
  }

  static async adjust(materialId: string, input: RawAdjustInput, staffId: string | null) {
    const rm = await db("raw_materials").where({ id: materialId }).whereNull("deleted_at").first();
    if (!rm) throw ApiError.notFound("Raw material not found");
    const delta = input.type === "add" ? input.quantity : -input.quantity;
    return db.transaction(async (trx) => {
      const mov = await InventoryTransactionEngine.adjustStock(
        trx,
        "raw_material",
        materialId,
        delta,
        input.reason,
        staffId,
        "manual_adjustment",
        ""
      );
      const next = await trx("raw_materials").where({ id: materialId }).first();
      return { current_stock: Number(next?.current_stock ?? 0), movement: mov };
    });
  }
}
