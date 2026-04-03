import { db } from "../../database/knex";
import type {
  RawMaterialListQuery,
  CreateRawMaterialInput,
  UpdateRawMaterialInput,
  LinkSupplierInput,
  MovementQuery,
} from "./raw-materials.schema";

function stockStatus(current: number, reorder: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (current <= 0) return "out_of_stock";
  if (current <= reorder) return "low_stock";
  return "in_stock";
}

export class RawMaterialRepository {
  static async findAll(query: RawMaterialListQuery) {
    const base = db("raw_materials as rm")
      .leftJoin("units as u", "rm.unit_id", "u.id")
      .whereNull("rm.deleted_at");

    if (query.search) base.where("rm.name", "ilike", `%${query.search}%`);
    if (query.gst_slab) base.where("rm.gst_slab", query.gst_slab);
    if (query.is_active !== undefined) base.where("rm.is_active", query.is_active === "true");
    if (query.supplier) {
      base.whereExists(function () {
        this.select(db.raw("1"))
          .from("supplier_raw_materials as srm")
          .whereRaw("srm.raw_material_id = rm.id")
          .where("srm.supplier_id", query.supplier!);
      });
    }

    const countResult = await base.clone().count("rm.id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base
      .clone()
      .select(
        "rm.*",
        "u.name as unit_name",
        "u.abbreviation as unit_abbreviation"
      )
      .orderBy("rm.name", "asc")
      .limit(query.limit)
      .offset(offset);

    const rmIds = rows.map((r: { id: string }) => r.id);
    let supplierLinks: Record<string, { supplier_id: string; supplier_name: string; is_preferred: boolean }[]> = {};

    if (rmIds.length > 0) {
      const hasSuppliers = await db.schema.hasTable("suppliers");
      if (hasSuppliers) {
        const links = await db("supplier_raw_materials as srm")
          .leftJoin("suppliers as s", "srm.supplier_id", "s.id")
          .whereIn("srm.raw_material_id", rmIds)
          .select("srm.raw_material_id", "srm.supplier_id", "srm.is_preferred", "s.name as supplier_name");

        for (const link of links) {
          if (!supplierLinks[link.raw_material_id]) supplierLinks[link.raw_material_id] = [];
          supplierLinks[link.raw_material_id].push({
            supplier_id: link.supplier_id,
            supplier_name: link.supplier_name ?? "",
            is_preferred: link.is_preferred,
          });
        }
      } else {
        const links = await db("supplier_raw_materials as srm")
          .whereIn("srm.raw_material_id", rmIds)
          .select("srm.raw_material_id", "srm.supplier_id", "srm.is_preferred");

        for (const link of links) {
          if (!supplierLinks[link.raw_material_id]) supplierLinks[link.raw_material_id] = [];
          supplierLinks[link.raw_material_id].push({
            supplier_id: link.supplier_id,
            supplier_name: "",
            is_preferred: link.is_preferred,
          });
        }
      }
    }

    const enriched = rows.map((r: { id: string; current_stock: number; reorder_level: number; unit_abbreviation: string; preferred_supplier_id: string; [key: string]: unknown }) => {
      const preferred = supplierLinks[r.id]?.find((s) => s.is_preferred);
      return {
        ...r,
        unit: r.unit_abbreviation ?? "",
        status: stockStatus(r.current_stock, r.reorder_level),
        preferred_supplier_name: preferred?.supplier_name ?? "",
        linked_suppliers: supplierLinks[r.id] ?? [],
      };
    });

    return { rows: enriched, total };
  }

  static async findById(id: string) {
    const rm = await db("raw_materials as rm")
      .leftJoin("units as u", "rm.unit_id", "u.id")
      .where("rm.id", id)
      .whereNull("rm.deleted_at")
      .select("rm.*", "u.name as unit_name", "u.abbreviation as unit_abbreviation")
      .first();

    if (!rm) return null;

    let linkedSuppliers: { supplier_id: string; supplier_name: string; is_preferred: boolean }[] = [];
    const hasSuppliers = await db.schema.hasTable("suppliers");
    if (hasSuppliers) {
      linkedSuppliers = await db("supplier_raw_materials as srm")
        .leftJoin("suppliers as s", "srm.supplier_id", "s.id")
        .where("srm.raw_material_id", id)
        .select("srm.supplier_id", "srm.is_preferred", "s.name as supplier_name");
    } else {
      const links = await db("supplier_raw_materials")
        .where("raw_material_id", id)
        .select("supplier_id", "is_preferred");
      linkedSuppliers = links.map((l: { supplier_id: string; is_preferred: boolean }) => ({
        supplier_id: l.supplier_id,
        supplier_name: "",
        is_preferred: l.is_preferred,
      }));
    }

    const preferred = linkedSuppliers.find((s) => s.is_preferred);

    return {
      ...rm,
      unit: rm.unit_abbreviation ?? "",
      status: stockStatus(rm.current_stock, rm.reorder_level),
      preferred_supplier_name: preferred?.supplier_name ?? "",
      linked_suppliers: linkedSuppliers,
    };
  }

  static async create(data: CreateRawMaterialInput) {
    const [row] = await db("raw_materials").insert(data).returning("*");
    return row;
  }

  static async update(id: string, data: UpdateRawMaterialInput) {
    const [row] = await db("raw_materials").where({ id }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async softDelete(id: string) {
    await db("raw_materials").where({ id }).update({ deleted_at: db.fn.now() });
  }

  static async isUsedInRecipes(id: string): Promise<boolean> {
    const hasTable = await db.schema.hasTable("recipe_ingredients");
    if (!hasTable) return false;
    const result = await db("recipe_ingredients").where("raw_material_id", id).count("id as count").first();
    return Number(result?.count) > 0;
  }

  static async getMovements(rawMaterialId: string, query: MovementQuery) {
    const hasTable = await db.schema.hasTable("inventory_movements");
    if (!hasTable) return { rows: [], total: 0 };

    const base = db("inventory_movements")
      .where("item_type", "raw_material")
      .where("item_id", rawMaterialId);

    const countResult = await base.clone().count("id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base.clone().orderBy("created_at", "desc").limit(query.limit).offset(offset);

    return { rows, total };
  }

  static async linkSupplier(rawMaterialId: string, data: LinkSupplierInput) {
    if (data.is_preferred) {
      await db.transaction(async (trx) => {
        await trx("supplier_raw_materials").where({ raw_material_id: rawMaterialId }).update({ is_preferred: false });
        await trx("supplier_raw_materials").insert({
          raw_material_id: rawMaterialId,
          supplier_id: data.supplier_id,
          is_preferred: true,
        });
      });
    } else {
      await db("supplier_raw_materials").insert({
        raw_material_id: rawMaterialId,
        supplier_id: data.supplier_id,
        is_preferred: false,
      });
    }
  }

  static async unlinkSupplier(rawMaterialId: string, supplierId: string) {
    await db("supplier_raw_materials").where({ raw_material_id: rawMaterialId, supplier_id: supplierId }).del();
  }

  static async unitExists(unitId: string): Promise<boolean> {
    const unit = await db("units").where({ id: unitId }).whereNull("deleted_at").first();
    return !!unit;
  }
}
