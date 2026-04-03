import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";

export interface UploadResult {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resource_type?: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: Record<string, unknown>[];
  resourceType?: "image" | "raw" | "video" | "auto";
}

const MIME_TO_RESOURCE_TYPE: Record<string, "image" | "raw" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "application/pdf": "raw",
  "application/msword": "raw",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "raw",
  "application/vnd.ms-excel": "raw",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "raw",
  "text/csv": "raw",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
};

export class UploadService {
  static getResourceType(mimetype: string): "image" | "raw" | "video" {
    return MIME_TO_RESOURCE_TYPE[mimetype] ?? "raw";
  }

  static async uploadBuffer(
    buffer: Buffer,
    mimetype: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      folder = "mukhwas/general",
      transformation,
      resourceType,
    } = options;

    const resolvedType = resourceType ?? UploadService.getResourceType(mimetype);

    const defaultTransform =
      resolvedType === "image"
        ? [{ quality: "auto", fetch_format: "auto" }]
        : undefined;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resolvedType,
          transformation: transformation ?? defaultTransform,
        },
        (err: Error | undefined, result: Record<string, unknown> | undefined) => {
          if (err || !result) {
            return reject(
              ApiError.internal(`Upload failed: ${err?.message ?? "Unknown error"}`)
            );
          }
          const url = result.secure_url;
          const publicId = result.public_id;
          if (typeof url !== "string" || typeof publicId !== "string") {
            return reject(ApiError.internal("Upload failed: invalid response from storage"));
          }
          resolve({
            url,
            public_id: publicId,
            width: typeof result.width === "number" ? result.width : undefined,
            height: typeof result.height === "number" ? result.height : undefined,
            format: typeof result.format === "string" ? result.format : undefined,
            bytes: typeof result.bytes === "number" ? result.bytes : undefined,
            resource_type:
              typeof result.resource_type === "string" ? result.resource_type : undefined,
          });
        }
      );
      stream.end(buffer);
    });
  }

  static async deleteByPublicId(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error(`Failed to delete Cloudinary asset: ${publicId}`, { error: err });
      throw ApiError.internal("Failed to delete file");
    }
  }
}
