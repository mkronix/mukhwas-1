import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { PurchaseReturnService } from "./purchase-returns.service";
import type { CreatePurchaseReturnInput, PatchPurchaseReturnStatusInput } from "./purchase-returns.schema";

export class PurchaseReturnController {
  static async list(_req: Request, res: Response) {
    const data = await PurchaseReturnService.list();
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreatePurchaseReturnInput;
    const data = await PurchaseReturnService.create(input);
    return ApiResponse.created(res, data);
  }

  static async patchStatus(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const body = req.body as PatchPurchaseReturnStatusInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await PurchaseReturnService.updateStatus(id, body, user?.sub ?? null);
    return ApiResponse.success(res, data);
  }
}
