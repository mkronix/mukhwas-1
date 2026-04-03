import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { PurchaseOrderService } from "./purchase-orders.service";
import type {
  CreatePurchaseOrderInput,
  PatchPurchaseOrderStatusInput,
  PutPosPurchaseOrderInput,
} from "./purchase-orders.schema";

export class PurchaseOrderController {
  static async list(_req: Request, res: Response) {
    const data = await PurchaseOrderService.list();
    return ApiResponse.success(res, data);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await PurchaseOrderService.getById(id);
    if (!data) throw ApiError.notFound("Purchase order not found");
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreatePurchaseOrderInput;
    const data = await PurchaseOrderService.create(input);
    return ApiResponse.created(res, data);
  }

  static async patchStatus(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const body = req.body as PatchPurchaseOrderStatusInput;
    const data = await PurchaseOrderService.updateStatus(id, body);
    return ApiResponse.success(res, data);
  }

  static async putPos(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const body = req.body as PutPosPurchaseOrderInput;
    const data = await PurchaseOrderService.putForPos(id, body);
    return ApiResponse.success(res, data);
  }
}
