import { db } from "../../database/knex";
import type { FinishedListQuery, VariantMovementsQuery } from "./inventory-finished.schema";

export class InventoryFinishedRepository {
  static async listBase(query: FinishedListQuery) {
    const base = db("product_variants as pv")
      .join("products as p", "p.id", "pv.product_id")
      .leftJoin("units as u", "u.id", "pv.weight_unit_id")
      .whereNull("pv.deleted_at")
      .whereNull("p.deleted_at");

    if (query.category_id) base.where("p.category_id", query.category_id);
    if (query.inventory_mode) base.where("pv.inventory_mode", query.inventory_mode);
    if (query.search) {
      const t = `%${query.search}%`;
      base.where(function () {
        this.whereILike("p.name", t).orWhereILike("pv.name", t).orWhereILike("pv.sku", t);
      });
    }
    if (query.status) {
      base.whereRaw(
        `(CASE WHEN pv.current_stock <= 0 THEN 'out_of_stock' WHEN pv.current_stock <= pv.reorder_level THEN 'low_stock' ELSE 'in_stock' END) = ?`,
        [query.status]
      );
    }

    const rows = await base
      .select(
        "pv.id as variant_id",
        "p.id as product_id",
        "p.name as product_name",
        "pv.name as variant_name",
        "pv.sku",
        "p.category_id",
        "pv.current_stock",
        "pv.reorder_level",
        "pv.inventory_mode",
        "u.abbreviation as unit_abbr",
        db.raw(
          `(SELECT MAX(im.created_at) FROM inventory_movements im WHERE im.item_type = 'finished_good' AND im.item_id = pv.id) as last_movement_at`
        )
      );

    return rows;
  }

  static async findVariant(variantId: string) {
    return db("product_variants as pv")
      .join("products as p", "p.id", "pv.product_id")
      .where("pv.id", variantId)
      .whereNull("pv.deleted_at")
      .whereNull("p.deleted_at")
      .select("pv.*", "p.name as product_name")
      .first();
  }

  static async variantMovements(variantId: string, query: VariantMovementsQuery) {
    const base = db("inventory_movements as im")
      .leftJoin("staff as s", "s.id", "im.performed_by")
      .leftJoin("units as u", "u.id", "im.unit_id")
      .where("im.item_type", "finished_good")
      .where("im.item_id", variantId);

    if (query.movement_type) base.where("im.movement_type", query.movement_type);
    if (query.date_from) base.where("im.created_at", ">=", query.date_from);
    if (query.date_to) base.where("im.created_at", "<=", query.date_to);

    const countRow = await base.clone().count("im.id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;
    const rows = await base
      .clone()
      .select("im.*", "s.name as staff_name", "u.abbreviation as unit_abbr")
      .orderBy("im.created_at", "desc")
      .limit(query.limit)
      .offset(offset);

    return { rows, total };
  }
}
