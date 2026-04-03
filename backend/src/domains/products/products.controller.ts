import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { routeParam } from "../../utils/routeParams";
import { ProductService } from "./products.service";
import type {
  AdminProductListQuery,
  CreateProductInput,
  UpdateProductInput,
  StorefrontProductListQuery,
  DeleteProductImageInput,
} from "./products.schema";

export class ProductController {
  static async categoriesWithCounts(_req: Request, res: Response) {
    const data = await ProductService.categoriesWithCounts();
    return ApiResponse.success(res, data);
  }

  static async adminList(req: Request, res: Response) {
    const query = req.query as unknown as AdminProductListQuery;
    const { data, meta } = await ProductService.adminList(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async adminGetById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const data = await ProductService.adminGetById(id);
    return ApiResponse.success(res, data);
  }

  static async create(req: Request, res: Response) {
    const input = req.body as CreateProductInput;
    const data = await ProductService.create(input);
    return ApiResponse.created(res, data);
  }

  static async update(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as UpdateProductInput;
    const data = await ProductService.update(id, input);
    return ApiResponse.success(res, data);
  }

  static async remove(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await ProductService.remove(id);
    return ApiResponse.noContent(res);
  }

  static async archive(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    await ProductService.archive(id);
    return ApiResponse.noContent(res);
  }

  static async addImage(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const file = req.file;
    if (!file) {
      return ApiResponse.error(res, 400, "NO_FILE", "No file provided");
    }
    const data = await ProductService.addImage(id, file);
    return ApiResponse.created(res, data);
  }

  static async deleteImage(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const input = req.body as DeleteProductImageInput;
    const data = await ProductService.deleteImage(id, input);
    return ApiResponse.success(res, data);
  }

  static async storefrontList(req: Request, res: Response) {
    const query = req.query as unknown as StorefrontProductListQuery;
    const { data, meta } = await ProductService.storefrontList(query);
    return ApiResponse.success(res, data, 200, meta);
  }

  static async storefrontBySlug(req: Request, res: Response) {
    const slug = routeParam(req.params.slug);
    const { product, related_products } = await ProductService.storefrontDetailBySlug(slug);
    return ApiResponse.success(res, { ...product, related_products });
  }

  static async storefrontById(req: Request, res: Response) {
    const id = routeParam(req.params.id);
    const { product, related_products } = await ProductService.storefrontDetailById(id);
    return ApiResponse.success(res, { ...product, related_products });
  }

  static async posCatalog(_req: Request, res: Response) {
    const data = await ProductService.posCatalog();
    return ApiResponse.success(res, data);
  }
}
