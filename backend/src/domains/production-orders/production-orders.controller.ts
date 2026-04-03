import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { ProductionOrderService } from "./production-orders.service";
import type {
  CompleteProductionOrderInput,
  CreateProductionOrderInput,
  PatchProductionOrderStatusInput,
} from "./production-orders.schema";

export class ProductionOrderController {
  static async list(_req: Request, res: Response) {
    const data = await ProductionOrderService.list();
    return ApiResponse.success(res, data);
  }

  static async stats(_req: Request, res: Response) {
    const data = await ProductionOrderService.stats();
    return ApiResponse.success(res, data);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await ProductionOrderService.getById(id);
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateProductionOrderInput;
    const data = await ProductionOrderService.create(input);
    return ApiResponse.created(res, data);
  }

  static async patchStatus(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const body = req.body as PatchProductionOrderStatusInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await ProductionOrderService.updateStatus(
      id,
      body.status,
      body.staff_name,
      user?.sub ?? null
    );
    return ApiResponse.success(res, data);
  }

  static async complete(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const body = req.body as CompleteProductionOrderInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await ProductionOrderService.complete(
      id,
      body.actual_quantity,
      body.material_usage,
      body.staff_name,
      user?.sub ?? null,
      body.output_variant_id
    );
    return ApiResponse.success(res, data);
  }
}
