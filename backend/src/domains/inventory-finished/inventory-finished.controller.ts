import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { InventoryFinishedService } from "./inventory-finished.service";
import type {
  FinishedListQuery,
  FinishedAdjustInput,
  VariantMovementsQuery,
} from "./inventory-finished.schema";

export class InventoryFinishedController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as FinishedListQuery;
    const { data, meta } = await InventoryFinishedService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async stats(_req: Request, res: Response) {
    const data = await InventoryFinishedService.stats();
    return ApiResponse.success(res, data);
  }

  static async adjust(req: Request, res: Response) {
    const variantId = routeParam(req.params.variantId);
    const input = req.body as FinishedAdjustInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await InventoryFinishedService.adjust(variantId, input, user?.sub ?? null);
    return ApiResponse.success(res, data);
  }

  static async movements(req: Request, res: Response) {
    const variantId = routeParam(req.params.variantId);
    const query = req.query as unknown as VariantMovementsQuery;
    const { data, meta } = await InventoryFinishedService.variantMovements(variantId, query);
    return ApiResponse.success(res, data, 200, meta);
  }
}
