import type { Knex } from "knex";
import { logger } from "../../utils/logger";
import type { InventoryItemType } from "./engine";

export const FIFOValuationService = {
  async recordPurchaseCost(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    quantity: number,
    unitCostInPaisa: number,
    purchaseDate: Date,
    purchaseReferenceId: string
  ): Promise<void> {
    await trx("inventory_cost_layers").insert({
      item_type: itemType,
      item_id: itemId,
      quantity_remaining: Math.round(quantity),
      unit_cost: unitCostInPaisa,
      purchase_date: purchaseDate,
      purchase_reference_id: purchaseReferenceId,
    });
  },

  async getCOGS(trx: Knex, itemType: InventoryItemType, itemId: string, quantitySold: number): Promise<number> {
    let remaining = Math.round(quantitySold);
    let total = 0;
    const layers = await trx("inventory_cost_layers")
      .where({ item_type: itemType, item_id: itemId })
      .where("quantity_remaining", ">", 0)
      .orderBy("purchase_date", "asc")
      .orderBy("id", "asc")
      .forUpdate();

    for (const layer of layers) {
      if (remaining <= 0) break;
      const lr = Number(layer.quantity_remaining);
      const take = Math.min(lr, remaining);
      const cost = Number(layer.unit_cost);
      total += take * cost;
      remaining -= take;
      await trx("inventory_cost_layers")
        .where({ id: layer.id })
        .update({ quantity_remaining: lr - take });
    }

    if (remaining > 0) {
      logger.warn("FIFO COGS: insufficient cost layers", {
        itemType,
        itemId,
        shortfall: remaining,
      });
    }

    return total;
  },

  async getInventoryValue(trx: Knex, itemType: InventoryItemType, itemId: string): Promise<number> {
    const rows = await trx("inventory_cost_layers")
      .where({ item_type: itemType, item_id: itemId })
      .where("quantity_remaining", ">", 0)
      .select(trx.raw("SUM(quantity_remaining * unit_cost) as v"))
      .first();
    return Number(rows?.v ?? 0);
  },

  async getInventoryValueReport(trx: Knex): Promise<
    {
      item_type: InventoryItemType;
      item_id: string;
      item_name: string;
      unit_abbreviation: string;
      current_stock: number;
      unit_cost_paisa: number;
      total_value_paisa: number;
    }[]
  > {
    const out: {
      item_type: InventoryItemType;
      item_id: string;
      item_name: string;
      unit_abbreviation: string;
      current_stock: number;
      unit_cost_paisa: number;
      total_value_paisa: number;
    }[] = [];

    const variants = await trx("product_variants as pv")
      .join("products as p", "p.id", "pv.product_id")
      .leftJoin("units as u", "u.id", "pv.weight_unit_id")
      .whereNull("pv.deleted_at")
      .whereNull("p.deleted_at")
      .select(
        "pv.id as item_id",
        trx.raw("concat_ws(' — ', p.name, pv.name) as item_name"),
        "u.abbreviation as unit_abbr",
        "pv.current_stock as stock"
      );

    for (const v of variants) {
      const itemId = v.item_id as string;
      const stock = Math.round(Number(v.stock ?? 0));
      const value = await FIFOValuationService.getInventoryValue(trx, "finished_good", itemId);
      const layer = await trx("inventory_cost_layers")
        .where({ item_type: "finished_good", item_id: itemId })
        .where("quantity_remaining", ">", 0)
        .orderBy("purchase_date", "asc")
        .first();
      const unitCost = layer ? Number(layer.unit_cost) : 0;
      out.push({
        item_type: "finished_good",
        item_id: itemId,
        item_name: String(v.item_name ?? ""),
        unit_abbreviation: String(v.unit_abbr ?? ""),
        current_stock: stock,
        unit_cost_paisa: unitCost,
        total_value_paisa: value,
      });
    }

    const raws = await trx("raw_materials as rm")
      .leftJoin("units as u", "u.id", "rm.unit_id")
      .whereNull("rm.deleted_at")
      .select("rm.id as item_id", "rm.name as item_name", "u.abbreviation as unit_abbr", "rm.current_stock as stock");

    for (const r of raws) {
      const itemId = r.item_id as string;
      const stock = Math.round(Number(r.stock ?? 0));
      const value = await FIFOValuationService.getInventoryValue(trx, "raw_material", itemId);
      const layer = await trx("inventory_cost_layers")
        .where({ item_type: "raw_material", item_id: itemId })
        .where("quantity_remaining", ">", 0)
        .orderBy("purchase_date", "asc")
        .first();
      const unitCost = layer ? Number(layer.unit_cost) : 0;
      out.push({
        item_type: "raw_material",
        item_id: itemId,
        item_name: String(r.item_name ?? ""),
        unit_abbreviation: String(r.unit_abbr ?? ""),
        current_stock: stock,
        unit_cost_paisa: unitCost,
        total_value_paisa: value,
      });
    }

    return out;
  },

  async reduceCostLayersLIFO(
    trx: Knex,
    itemType: InventoryItemType,
    itemId: string,
    quantity: number
  ): Promise<void> {
    let remaining = Math.round(Number(quantity));
    if (remaining <= 0) return;
    const layers = await trx("inventory_cost_layers")
      .where({ item_type: itemType, item_id: itemId })
      .where("quantity_remaining", ">", 0)
      .orderBy("purchase_date", "desc")
      .orderBy("id", "desc")
      .forUpdate();
    for (const layer of layers) {
      if (remaining <= 0) break;
      const lr = Number(layer.quantity_remaining);
      const take = Math.min(lr, remaining);
      await trx("inventory_cost_layers").where({ id: layer.id }).update({
        quantity_remaining: lr - take,
      });
      remaining -= take;
    }
  },
};
