import { db } from "../../database/knex";
import type { RawInventoryListQuery } from "./inventory-raw.schema";

export class InventoryRawRepository {
  static async listBase(query: RawInventoryListQuery) {
    const base = db("raw_materials as rm")
      .leftJoin("units as u", "u.id", "rm.unit_id")
      .leftJoin("suppliers as s", "s.id", "rm.preferred_supplier_id")
      .whereNull("rm.deleted_at");

    if (query.supplier_id) base.where("rm.preferred_supplier_id", query.supplier_id);
    if (query.gst_slab) base.where("rm.gst_slab", query.gst_slab);
    if (query.search) {
      const t = `%${query.search}%`;
      base.whereILike("rm.name", t);
    }
    if (query.status) {
      base.whereRaw(
        `(CASE WHEN rm.current_stock <= 0 THEN 'out_of_stock' WHEN rm.current_stock <= rm.reorder_level THEN 'low_stock' ELSE 'in_stock' END) = ?`,
        [query.status]
      );
    }

    return base.select(
      "rm.*",
      "u.name as unit_name",
      "u.abbreviation as unit_abbr",
      "s.name as preferred_supplier_name",
      db.raw(
        `(SELECT MAX(im.created_at) FROM inventory_movements im WHERE im.item_type = 'raw_material' AND im.item_id = rm.id) as last_movement_at`
      )
    );
  }
}
