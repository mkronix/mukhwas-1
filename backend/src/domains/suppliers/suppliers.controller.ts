import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { SupplierService } from "./suppliers.service";
import type {
  SupplierListQuery,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierLedgerQuery,
} from "./suppliers.schema";

export class SupplierController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as SupplierListQuery;
    const { data, meta } = await SupplierService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await SupplierService.getById(id);
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateSupplierInput;
    const data = await SupplierService.create(input);
    return ApiResponse.created(res, data);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateSupplierInput;
    const data = await SupplierService.update(id, input);
    return ApiResponse.success(res, data);
  }

  static async remove(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await SupplierService.remove(id);
    return ApiResponse.noContent(res);
  }

  static async ledger(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const query = req.query as unknown as SupplierLedgerQuery;
    const { data, meta } = await SupplierService.ledger(id, query);
    return ApiResponse.success(res, data, 200, meta);
  }
}
