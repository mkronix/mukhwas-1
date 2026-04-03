import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/pagination";
import { CategoryRepository } from "./categories.repository";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFlatQuery, ReorderInput } from "./categories.schema";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export class CategoryService {
  static async tree() {
    return CategoryRepository.findTree();
  }

  static async flat(query: CategoryFlatQuery) {
    const { rows, total } = await CategoryRepository.findFlat(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async create(input: CreateCategoryInput) {
    const slug = input.slug || slugify(input.name);
    const existing = await CategoryRepository.findBySlug(slug);
    if (existing) throw ApiError.conflict("A category with this slug already exists");

    if (input.parent_id) {
      const parent = await CategoryRepository.findById(input.parent_id);
      if (!parent) throw ApiError.notFound("Parent category not found");
      const parentDepth = await CategoryRepository.getDepth(input.parent_id);
      if (parentDepth >= 1) throw ApiError.badRequest("Subcategories of subcategories are not allowed");
    }

    return CategoryRepository.create({ ...input, slug });
  }

  static async update(id: string, input: UpdateCategoryInput) {
    const cat = await CategoryRepository.findById(id);
    if (!cat) throw ApiError.notFound("Category not found");

    if (input.slug) {
      const existing = await CategoryRepository.findBySlug(input.slug, id);
      if (existing) throw ApiError.conflict("A category with this slug already exists");
    }

    if (input.parent_id !== undefined && input.parent_id !== null) {
      if (input.parent_id === id) throw ApiError.badRequest("A category cannot be its own parent");
      const isDescendant = await CategoryRepository.isDescendantOf(input.parent_id, id);
      if (isDescendant) throw ApiError.badRequest("Cannot move a category under one of its own children");
      const parent = await CategoryRepository.findById(input.parent_id);
      if (!parent) throw ApiError.notFound("Parent category not found");
    }

    return CategoryRepository.update(id, input);
  }

  static async remove(id: string) {
    const cat = await CategoryRepository.findById(id);
    if (!cat) throw ApiError.notFound("Category not found");

    const hasProducts = await CategoryRepository.hasActiveProducts(id);
    if (hasProducts) throw ApiError.conflict("Cannot delete category with active products");

    const hasSubs = await CategoryRepository.hasActiveSubcategories(id);
    if (hasSubs) throw ApiError.conflict("Cannot delete category with active subcategories");

    await CategoryRepository.softDelete(id);
  }

  static async reorder(input: ReorderInput) {
    await CategoryRepository.reorder(input.items);
  }
}
