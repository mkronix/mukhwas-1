import { db } from "../../database/knex";
import type { MovementsLogQuery } from "./inventory-movements.schema";

export class InventoryMovementsRepository {
  static async list(query: MovementsLogQuery) {
    const base = db("inventory_movements as im")
      .leftJoin("staff as s", "s.id", "im.performed_by")
      .leftJoin("units as u", "u.id", "im.unit_id")
      .leftJoin("product_variants as pv", function () {
        this.on("pv.id", "=", "im.item_id").andOn(db.raw("im.item_type = 'finished_good'"));
      })
      .leftJoin("products as p", "p.id", "pv.product_id")
      .leftJoin("raw_materials as rm", function () {
        this.on("rm.id", "=", "im.item_id").andOn(db.raw("im.item_type = 'raw_material'"));
      });

    if (query.movement_type) base.where("im.movement_type", query.movement_type);
    if (query.item_type) base.where("im.item_type", query.item_type);
    if (query.date_from) base.where("im.created_at", ">=", query.date_from);
    if (query.date_to) base.where("im.created_at", "<=", query.date_to);
    if (query.search) {
      const t = `%${query.search}%`;
      base.where(function () {
        this.whereILike("p.name", t)
          .orWhereILike("pv.name", t)
          .orWhereILike("rm.name", t);
      });
    }

    const countRow = await base.clone().count("im.id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;
    const rows = await base
      .clone()
      .select(
        "im.*",
        "s.name as staff_name",
        "u.abbreviation as unit_abbr",
        db.raw(
          `CASE WHEN im.item_type = 'finished_good' THEN concat_ws(' — ', p.name, pv.name) ELSE rm.name END as item_name`
        )
      )
      .orderBy("im.created_at", "desc")
      .limit(query.limit)
      .offset(offset);

    return { rows, total };
  }
}
