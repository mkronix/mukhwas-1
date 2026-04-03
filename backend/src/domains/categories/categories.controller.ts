import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { CategoryService } from "./categories.service";
import type { CategoryFlatQuery, CreateCategoryInput, UpdateCategoryInput, ReorderInput } from "./categories.schema";

export class CategoryController {
  static async tree(_req: Request, res: Response) {
    const data = await CategoryService.tree();
    return ApiResponse.success(res, data);
  }

  static async flat(req: Request, res: Response) {
    const query = req.query as unknown as CategoryFlatQuery;
    const { data, meta } = await CategoryService.flat(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateCategoryInput;
    const cat = await CategoryService.create(input);
    return ApiResponse.created(res, cat);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateCategoryInput;
    const cat = await CategoryService.update(id, input);
    return ApiResponse.success(res, cat);
  }

  static async remove(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await CategoryService.remove(id);
    return ApiResponse.noContent(res);
  }

  static async reorder(req: Request, res: Response) {
    const input = req.body as ReorderInput;
    await CategoryService.reorder(input);
    return ApiResponse.success(res, { message: "Reorder complete" });
  }
}
