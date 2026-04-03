import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/pagination";
import { RawMaterialRepository } from "./raw-materials.repository";
import type {
  RawMaterialListQuery,
  CreateRawMaterialInput,
  UpdateRawMaterialInput,
  LinkSupplierInput,
  MovementQuery,
} from "./raw-materials.schema";

export class RawMaterialService {
  static async list(query: RawMaterialListQuery) {
    const { rows, total } = await RawMaterialRepository.findAll(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async getById(id: string) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");
    return rm;
  }

  static async create(input: CreateRawMaterialInput) {
    const unitExists = await RawMaterialRepository.unitExists(input.unit_id);
    if (!unitExists) throw ApiError.badRequest("Unit not found");
    return RawMaterialRepository.create(input);
  }

  static async update(id: string, input: UpdateRawMaterialInput) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");

    if (input.unit_id) {
      const unitExists = await RawMaterialRepository.unitExists(input.unit_id);
      if (!unitExists) throw ApiError.badRequest("Unit not found");
    }

    return RawMaterialRepository.update(id, input);
  }

  static async remove(id: string) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");
    if (rm.current_stock > 0) throw ApiError.conflict("Cannot delete raw material with existing stock");

    const inRecipes = await RawMaterialRepository.isUsedInRecipes(id);
    if (inRecipes) throw ApiError.conflict("Cannot delete raw material used in active recipes");

    await RawMaterialRepository.softDelete(id);
  }

  static async getMovements(id: string, query: MovementQuery) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");

    const { rows, total } = await RawMaterialRepository.getMovements(id, query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async linkSupplier(id: string, input: LinkSupplierInput) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");
    await RawMaterialRepository.linkSupplier(id, input);
  }

  static async unlinkSupplier(id: string, supplierId: string) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound("Raw material not found");
    await RawMaterialRepository.unlinkSupplier(id, supplierId);
  }
}
