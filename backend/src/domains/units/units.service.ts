import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/pagination";
import { UnitRepository } from "./units.repository";
import type { CreateUnitInput, UpdateUnitInput, UnitListQuery, CreateConversionInput, UpdateConversionInput, ConversionListQuery } from "./units.schema";

export class UnitService {
  static async list(query: UnitListQuery) {
    const { rows, total } = await UnitRepository.findAll(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async create(input: CreateUnitInput) {
    const existing = await UnitRepository.findByNameOrAbbreviation(input.name, input.abbreviation);
    if (existing) throw ApiError.conflict("A unit with this name or abbreviation already exists");
    return UnitRepository.create(input);
  }

  static async update(id: string, input: UpdateUnitInput) {
    const unit = await UnitRepository.findById(id);
    if (!unit) throw ApiError.notFound("Unit not found");
    if (unit.is_system) throw ApiError.forbidden("System units cannot be modified");

    if (input.name || input.abbreviation) {
      const existing = await UnitRepository.findByNameOrAbbreviation(
        input.name ?? unit.name,
        input.abbreviation ?? unit.abbreviation,
        id
      );
      if (existing) throw ApiError.conflict("A unit with this name or abbreviation already exists");
    }

    return UnitRepository.update(id, input);
  }

  static async remove(id: string) {
    const unit = await UnitRepository.findById(id);
    if (!unit) throw ApiError.notFound("Unit not found");
    if (unit.is_system) throw ApiError.forbidden("System units cannot be deleted");

    const { referenced, references } = await UnitRepository.isReferenced(id);
    if (referenced) {
      throw ApiError.conflict("Unit is in use and cannot be deleted", "UNIT_IN_USE", { references });
    }

    await UnitRepository.softDelete(id);
  }

  static async listConversions(query: ConversionListQuery) {
    const { rows, total } = await UnitRepository.findAllConversions(query);
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data: rows, meta };
  }

  static async createConversion(input: CreateConversionInput) {
    const existing = await UnitRepository.findConversionByPair(input.from_unit, input.to_unit);
    if (existing) throw ApiError.conflict("Conversion for this unit pair already exists");
    return UnitRepository.createConversion(input);
  }

  static async updateConversion(id: string, input: UpdateConversionInput) {
    const conv = await UnitRepository.findConversionById(id);
    if (!conv) throw ApiError.notFound("Conversion not found");
    return UnitRepository.updateConversion(id, input);
  }

  static async removeConversion(id: string) {
    const conv = await UnitRepository.findConversionById(id);
    if (!conv) throw ApiError.notFound("Conversion not found");
    await UnitRepository.deleteConversion(id);
  }
}
