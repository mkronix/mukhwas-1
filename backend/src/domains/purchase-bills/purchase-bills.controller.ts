import type { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { PurchaseBillService } from "./purchase-bills.service";
import type { CreatePurchaseBillInput, RecordBillPaymentInput } from "./purchase-bills.schema";

export class PurchaseBillController {
  static async list(_req: Request, res: Response) {
    const data = await PurchaseBillService.list();
    return ApiResponse.success(res, data);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await PurchaseBillService.getById(id);
    if (!data) throw ApiError.notFound("Bill not found");
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreatePurchaseBillInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await PurchaseBillService.create(input, user?.sub ?? null);
    return ApiResponse.created(res, data);
  }

  static async recordPayment(req: Request, res: Response) {
    const billId = routeParam(req.params.id);
    const body = req.body as RecordBillPaymentInput;
    const user = req.user as { sub?: string } | undefined;
    const data = await PurchaseBillService.recordPayment(billId, body, user?.sub ?? null);
    return ApiResponse.success(res, data);
  }
}
