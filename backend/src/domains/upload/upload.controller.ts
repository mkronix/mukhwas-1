import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { UploadService } from "./upload.service";
import type { UploadQuery, DeleteUploadInput } from "./upload.schema";

export class UploadController {
  static uploadSingle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      ApiResponse.error(res, 400, "NO_FILE", "No file provided");
      return;
    }
    const query = req.query as unknown as UploadQuery;
    const result = await UploadService.uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: `mukhwas/${query.folder}`,
    });
    ApiResponse.created(res, result);
  });

  static uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as { buffer: Buffer; mimetype: string }[]) ?? [];
    if (files.length === 0) {
      ApiResponse.error(res, 400, "NO_FILES", "No files provided");
      return;
    }
    const query = req.query as unknown as UploadQuery;
    const folder = `mukhwas/${query.folder}`;
    const results = await Promise.all(
      files.map((f) => UploadService.uploadBuffer(f.buffer, f.mimetype, { folder }))
    );
    ApiResponse.created(res, results);
  });

  static uploadSingleImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      ApiResponse.error(res, 400, "NO_FILE", "No file provided");
      return;
    }
    const query = req.query as unknown as UploadQuery;
    const result = await UploadService.uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: `mukhwas/${query.folder}`,
      resourceType: "image",
    });
    ApiResponse.created(res, result);
  });

  static uploadSingleDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      ApiResponse.error(res, 400, "NO_FILE", "No file provided");
      return;
    }
    const query = req.query as unknown as UploadQuery;
    const result = await UploadService.uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: `mukhwas/${query.folder}`,
      resourceType: "raw",
    });
    ApiResponse.created(res, result);
  });

  static uploadSingleVideo = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      ApiResponse.error(res, 400, "NO_FILE", "No file provided");
      return;
    }
    const query = req.query as unknown as UploadQuery;
    const result = await UploadService.uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: `mukhwas/${query.folder}`,
      resourceType: "video",
    });
    ApiResponse.created(res, result);
  });

  static deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const { public_id } = req.body as DeleteUploadInput;
    await UploadService.deleteByPublicId(public_id);
    ApiResponse.success(res, { message: "File deleted" });
  });
}
