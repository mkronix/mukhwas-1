import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { InventoryMovementsService } from "./inventory-movements.service";
import type { MovementsLogQuery } from "./inventory-movements.schema";

export class InventoryMovementsController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as MovementsLogQuery;
    const { data, meta } = await InventoryMovementsService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async exportCsv(req: Request, res: Response) {
    const query = req.query as unknown as MovementsLogQuery;
    const csv = await InventoryMovementsService.exportCsv(query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="stock-movements.csv"');
    return res.status(200).send(csv);
  }
}
