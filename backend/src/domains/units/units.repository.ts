import { db } from "../../database/knex";
import type { CreateUnitInput, UpdateUnitInput, UnitListQuery, CreateConversionInput, UpdateConversionInput, ConversionListQuery } from "./units.schema";

export class UnitRepository {
  static async findAll(query: UnitListQuery) {
    const base = db("units").whereNull("deleted_at");

    if (query.type) base.where("type", query.type);
    if (query.is_system !== undefined) base.where("is_system", query.is_system === "true");
    if (query.search) base.where("name", "ilike", `%${query.search}%`);

    const countResult = await base.clone().count("id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base.clone().orderBy("is_system", "desc").orderBy("name", "asc").limit(query.limit).offset(offset);

    return { rows, total };
  }

  static async findById(id: string) {
    return db("units").where({ id }).whereNull("deleted_at").first();
  }

  static async findByNameOrAbbreviation(name: string, abbreviation: string, excludeId?: string) {
    const q = db("units").whereNull("deleted_at").where(function () {
      this.where("name", "ilike", name).orWhere("abbreviation", "ilike", abbreviation);
    });
    if (excludeId) q.whereNot("id", excludeId);
    return q.first();
  }

  static async create(data: CreateUnitInput) {
    const [row] = await db("units").insert({ ...data, is_system: false }).returning("*");
    return row;
  }

  static async update(id: string, data: UpdateUnitInput) {
    const [row] = await db("units").where({ id }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async softDelete(id: string) {
    await db("units").where({ id }).update({ deleted_at: db.fn.now() });
  }

  static async isReferenced(id: string): Promise<{ referenced: boolean; references: string[] }> {
    const refs: string[] = [];

    const hasRawMaterials = await db.schema.hasTable("raw_materials");
    if (hasRawMaterials) {
      const rmCount = await db("raw_materials").where("unit_id", id).whereNull("deleted_at").count("id as count").first();
      if (Number(rmCount?.count) > 0) refs.push("raw_materials");
    }

    return { referenced: refs.length > 0, references: refs };
  }

  static async findAllConversions(query: ConversionListQuery) {
    const base = db("unit_conversions");

    if (query.from_unit) base.where("from_unit", query.from_unit);
    if (query.to_unit) base.where("to_unit", query.to_unit);

    const countResult = await base.clone().count("id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base.clone().orderBy("from_unit", "asc").limit(query.limit).offset(offset);

    return { rows, total };
  }

  static async findConversionById(id: string) {
    return db("unit_conversions").where({ id }).first();
  }

  static async findConversionByPair(from_unit: string, to_unit: string, excludeId?: string) {
    const q = db("unit_conversions").where({ from_unit, to_unit });
    if (excludeId) q.whereNot("id", excludeId);
    return q.first();
  }

  static async createConversion(data: CreateConversionInput) {
    const [row] = await db("unit_conversions").insert(data).returning("*");
    return row;
  }

  static async updateConversion(id: string, data: UpdateConversionInput) {
    const [row] = await db("unit_conversions").where({ id }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async deleteConversion(id: string) {
    await db("unit_conversions").where({ id }).del();
  }
}
