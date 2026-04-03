import { ApiError } from "../../utils/ApiError";
import { db } from "../../database/knex";
import { buildPaginationMeta } from "../../utils/pagination";
import { FIFOValuationService } from "../inventory/fifo";
import { InventoryTransactionEngine } from "../inventory/engine";
import { InventoryFinishedRepository } from "./inventory-finished.repository";
import type {
  FinishedListQuery,
  FinishedAdjustInput,
  VariantMovementsQuery,
} from "./inventory-finished.schema";

function computeStatus(stock: number, reorder: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock";
  if (stock <= reorder) return "low_stock";
  return "in_stock";
}

const typeLabels: Record<string, string> = {
  purchase_receipt: "Purchase Receipt",
  production_in: "Production In",
  production_out: "Production Out",
  sale: "Sale",
  pos_sale: "POS Sale",
  manual_adjustment: "Adjustment",
  reversal: "Reversal",
};

export class InventoryFinishedService {
  static async list(query: FinishedListQuery) {
    const raw = await InventoryFinishedRepository.listBase(query);
    const enriched = await Promise.all(
      raw.map(async (r) => {
        const vid = r.variant_id as string;
        const stock = Number(r.current_stock ?? 0);
        const reorder = Number(r.reorder_level ?? 0);
        const stock_value_paisa = await FIFOValuationService.getInventoryValue(db, "finished_good", vid);
        const last = r.last_movement_at
          ? new Date(r.last_movement_at as Date).toISOString()
          : new Date(0).toISOString();
        return {
          id: vid,
          product_id: r.product_id as string,
          product_name: r.product_name as string,
          variant_id: vid,
          variant_name: r.variant_name as string,
          sku: r.sku as string,
          category_id: r.category_id as string,
          current_stock: stock,
          unit: String(r.unit_abbr ?? ""),
          reorder_level: reorder,
          stock_value_paisa,
          inventory_mode: r.inventory_mode as "finished_goods" | "recipe_realtime",
          last_movement_date: last,
          status: computeStatus(stock, reorder),
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
      else cmp = a.product_name.localeCompare(b.product_name);
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
    const raw = await InventoryFinishedRepository.listBase({
      page: 1,
      limit: 500,
      sort_by: "product_name",
      sort_order: "asc",
    });
    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const items: unknown[] = [];
    for (const r of raw) {
      const vid = r.variant_id as string;
      const stock = Number(r.current_stock ?? 0);
      const reorder = Number(r.reorder_level ?? 0);
      const st = computeStatus(stock, reorder);
      if (st === "low_stock") lowStock += 1;
      if (st === "out_of_stock") outOfStock += 1;
      const v = await FIFOValuationService.getInventoryValue(db, "finished_good", vid);
      totalValue += v;
      items.push({
        variant_id: vid,
        product_name: r.product_name,
        variant_name: r.variant_name,
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

  static async adjust(variantId: string, input: FinishedAdjustInput, staffId: string | null) {
    const v = await InventoryFinishedRepository.findVariant(variantId);
    if (!v) throw ApiError.notFound("Variant not found");
    if (v.inventory_mode !== "finished_goods") {
      throw ApiError.unprocessable("Only finished_goods variants can be adjusted here");
    }
    const delta = input.type === "add" ? input.quantity : -input.quantity;
    return db.transaction(async (trx) => {
      const mov = await InventoryTransactionEngine.adjustStock(
        trx,
        "finished_good",
        variantId,
        delta,
        input.reason,
        staffId,
        "manual_adjustment",
        input.reference ?? ""
      );
      const next = await trx("product_variants").where({ id: variantId }).first();
      return { current_stock: Number(next?.current_stock ?? 0), movement: mov };
    });
  }

  static async variantMovements(variantId: string, query: VariantMovementsQuery) {
    const v = await InventoryFinishedRepository.findVariant(variantId);
    if (!v) throw ApiError.notFound("Variant not found");
    const { rows, total } = await InventoryFinishedRepository.variantMovements(variantId, query);
    const data = rows.map((im) => ({
      id: im.id,
      movement_type: im.movement_type,
      movement_type_label: typeLabels[String(im.movement_type)] ?? String(im.movement_type),
      quantity_change: Number(im.quantity_change),
      stock_before: Number(im.stock_before),
      stock_after: Number(im.stock_after),
      reference_type: im.reference_type,
      reference_id: im.reference_id,
      reference_label: `${im.reference_type}:${im.reference_id}`,
      performed_by: (im.staff_name as string) ?? "",
      timestamp: im.created_at ? new Date(im.created_at as Date).toISOString() : "",
      unit: im.unit_abbr as string,
    }));
    return { data, meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }) };
  }
}
