import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { CustomerService } from "./customers.service";
import type {
  CustomerListQuery,
  UpdateCustomerInput,
  StorefrontUpdateProfileInput,
  CreateAddressInput,
  UpdateAddressInput,
  CustomerOrdersQuery,
  StatusToggleInput,
  CreatePosCustomerInput,
} from "./customers.schema";

export class CustomerController {
  static async list(req: Request, res: Response) {
    const query = req.query as unknown as CustomerListQuery;
    const { data, meta } = await CustomerService.list(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async getById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await CustomerService.getById(id);
    return ApiResponse.success(res, data);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateCustomerInput;
    const data = await CustomerService.update(id, input);
    return ApiResponse.success(res, data);
  }

  static async toggleStatus(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as StatusToggleInput;
    const data = await CustomerService.toggleStatus(id, input);
    return ApiResponse.success(res, data);
  }

  static async getOrders(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const query = req.query as unknown as CustomerOrdersQuery;
    const { data, meta } = await CustomerService.getOrders(id, query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async getAddresses(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await CustomerService.getAddresses(id);
    return ApiResponse.success(res, data);
  }

  static async getProfile(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const data = await CustomerService.getProfile(user.sub);
    return ApiResponse.success(res, data);
  }

  static async updateProfile(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const input = req.body as StorefrontUpdateProfileInput;
    const data = await CustomerService.updateProfile(user.sub, input);
    return ApiResponse.success(res, data);
  }

  static async getMyAddresses(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const data = await CustomerService.getMyAddresses(user.sub);
    return ApiResponse.success(res, data);
  }

  static async createMyAddress(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const input = req.body as CreateAddressInput;
    const data = await CustomerService.createAddress(user.sub, input);
    return ApiResponse.created(res, data);
  }

  static async updateMyAddress(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const id = routeParam(req.params.id);
    const input = req.body as UpdateAddressInput;
    const data = await CustomerService.updateAddress(id, user.sub, input);
    return ApiResponse.success(res, data);
  }

  static async deleteMyAddress(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const id = routeParam(req.params.id);
    await CustomerService.deleteAddress(id, user.sub);
    return ApiResponse.noContent(res);
  }

  static async setDefaultAddress(req: Request, res: Response) {
    const user = req.user as { sub: string };
    const id = routeParam(req.params.id);
    const data = await CustomerService.setDefaultAddress(id, user.sub);
    return ApiResponse.success(res, data);
  }

  static async createFromPos(req: Request, res: Response) {
    const input = req.body as CreatePosCustomerInput;
    const data = await CustomerService.createFromPos(input);
    return ApiResponse.created(res, data);
  }
}
