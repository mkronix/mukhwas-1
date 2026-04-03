import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { RawMaterialService } from "./raw-materials.service";
import type {
  RawMaterialListQuery,
  CreateRawMaterialInput,
  UpdateRawMaterialInput,
  LinkSupplierInput,
  MovementQuery,
} from "./raw-materials.schema";

export class RawMaterialController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as RawMaterialListQuery;
    const { data, meta } = await RawMaterialService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await RawMaterialService.getById(id);
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateRawMaterialInput;
    const data = await RawMaterialService.create(input);
    return ApiResponse.created(res, data);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateRawMaterialInput;
    const data = await RawMaterialService.update(id, input);
    return ApiResponse.success(res, data);
  }

  static async remove(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await RawMaterialService.remove(id);
    return ApiResponse.noContent(res);
  }

  static async getMovements(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const query = req.query as unknown as MovementQuery;
    const { data, meta } = await RawMaterialService.getMovements(id, query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async linkSupplier(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as LinkSupplierInput;
    await RawMaterialService.linkSupplier(id, input);
    return ApiResponse.created(res, { message: "Supplier linked" });
  }

  static async unlinkSupplier(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const supplierId = routeParam(req.params.supplierId);
    await RawMaterialService.unlinkSupplier(id, supplierId);
    return ApiResponse.noContent(res);
  }
}
