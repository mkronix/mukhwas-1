import { db } from "../../database/knex";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFlatQuery } from "./categories.schema";

export class CategoryRepository {
  static async findTree() {
    const rows = await db("categories")
      .whereNull("deleted_at")
      .orderBy("sort_order", "asc")
      .orderBy("name", "asc");

    let productCounts: Record<string, number> = {};
    const hasProducts = await db.schema.hasTable("products");
    if (hasProducts) {
      const counts = await db("products")
        .select("category_id")
        .count("id as count")
        .where("is_active", true)
        .groupBy("category_id");
      productCounts = Object.fromEntries(
        (counts as { category_id: string; count: string | number }[]).map((c) => [c.category_id, Number(c.count)])
      );
    }

    const topLevel = rows.filter((r: { parent_id: string | null }) => !r.parent_id);
    const children = rows.filter((r: { parent_id: string | null }) => !!r.parent_id);

    return topLevel.map((cat: { id: string; [key: string]: unknown }) => ({
      ...cat,
      product_count: productCounts[cat.id] ?? 0,
      subcategories: children
        .filter((sub: { parent_id: string }) => sub.parent_id === cat.id)
        .map((sub: { id: string; [key: string]: unknown }) => ({
          ...sub,
          product_count: productCounts[sub.id as string] ?? 0,
        })),
    }));
  }

  static async findFlat(query: CategoryFlatQuery) {
    const base = db("categories").whereNull("deleted_at");

    if (query.search) base.where("name", "ilike", `%${query.search}%`);
    if (query.parent_id) base.where("parent_id", query.parent_id);
    if (query.is_active !== undefined) base.where("is_active", query.is_active === "true");

    const countResult = await base.clone().count("id as count").first();
    const total = Number(countResult?.count ?? 0);

    const offset = (query.page - 1) * query.limit;
    const rows = await base.clone().orderBy("sort_order", "asc").limit(query.limit).offset(offset);

    return { rows, total };
  }

  static async findById(id: string) {
    return db("categories").where({ id }).whereNull("deleted_at").first();
  }

  static async findBySlug(slug: string, excludeId?: string) {
    const q = db("categories").where({ slug }).whereNull("deleted_at");
    if (excludeId) q.whereNot("id", excludeId);
    return q.first();
  }

  static async create(data: CreateCategoryInput) {
    const [row] = await db("categories").insert(data).returning("*");
    return row;
  }

  static async update(id: string, data: UpdateCategoryInput) {
    const [row] = await db("categories").where({ id }).update({ ...data, updated_at: db.fn.now() }).returning("*");
    return row;
  }

  static async softDelete(id: string) {
    await db("categories").where({ id }).update({ deleted_at: db.fn.now() });
  }

  static async hasActiveProducts(id: string): Promise<boolean> {
    const hasProducts = await db.schema.hasTable("products");
    if (!hasProducts) return false;
    const result = await db("products").where("category_id", id).where("is_active", true).count("id as count").first();
    return Number(result?.count) > 0;
  }

  static async hasActiveSubcategories(id: string): Promise<boolean> {
    const result = await db("categories").where("parent_id", id).whereNull("deleted_at").where("is_active", true).count("id as count").first();
    return Number(result?.count) > 0;
  }

  static async getDepth(id: string): Promise<number> {
    let depth = 0;
    let current = await db("categories").where({ id }).first();
    while (current?.parent_id) {
      depth++;
      current = await db("categories").where({ id: current.parent_id }).first();
    }
    return depth;
  }

  static async isDescendantOf(childId: string, ancestorId: string): Promise<boolean> {
    let current = await db("categories").where({ id: childId }).first();
    while (current?.parent_id) {
      if (current.parent_id === ancestorId) return true;
      current = await db("categories").where({ id: current.parent_id }).first();
    }
    return false;
  }

  static async reorder(items: { id: string; sort_order: number }[]) {
    await db.transaction(async (trx) => {
      for (const item of items) {
        await trx("categories").where({ id: item.id }).update({ sort_order: item.sort_order, updated_at: trx.fn.now() });
      }
    });
  }
}
