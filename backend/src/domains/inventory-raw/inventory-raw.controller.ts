import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { InventoryRawService } from "./inventory-raw.service";
import type { RawInventoryListQuery, RawAdjustInput } from "./inventory-raw.schema";

export class InventoryRawController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as RawInventoryListQuery;
    const { data, meta } = await InventoryRawService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async stats(_req: Request, res: Response) {
    const data = await InventoryRawService.stats();
    return ApiResponse.success(res, data);
  }

  static async adjust(req: Request, res: Response) {
    const materialId = routeParam(req.params.materialId);
    const input = req.body as RawAdjustInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await InventoryRawService.adjust(materialId, input, user?.sub ?? null);
    return ApiResponse.success(res, data);
  }
}
