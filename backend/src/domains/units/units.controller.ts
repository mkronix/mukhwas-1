import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { UnitService } from "./units.service";
import type { UnitListQuery, CreateUnitInput, UpdateUnitInput, ConversionListQuery, CreateConversionInput, UpdateConversionInput } from "./units.schema";

export class UnitController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as UnitListQuery;
    const { data, meta } = await UnitService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateUnitInput;
    const unit = await UnitService.create(input);
    return ApiResponse.created(res, unit);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateUnitInput;
    const unit = await UnitService.update(id, input);
    return ApiResponse.success(res, unit);
  }

  static async remove(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await UnitService.remove(id);
    return ApiResponse.noContent(res);
  }

  static async listConversions(req: Request, res: Response) {
    const query = req.query as unknown as ConversionListQuery;
    const { data, meta } = await UnitService.listConversions(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async createConversion(req: Request, res: Response) {
    const input = req.body as CreateConversionInput;
    const conv = await UnitService.createConversion(input);
    return ApiResponse.created(res, conv);
  }

  static async updateConversion(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateConversionInput;
    const conv = await UnitService.updateConversion(id, input);
    return ApiResponse.success(res, conv);
  }

  static async removeConversion(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await UnitService.removeConversion(id);
    return ApiResponse.noContent(res);
  }
}
