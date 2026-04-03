import multer from "multer";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const ALL_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES, ...VIDEO_MIME_TYPES];

function createFileFilter(allowedTypes: string[]) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        ApiError.badRequest(
          `Unsupported file type: ${file.mimetype}. Allowed: ${allowedTypes.join(", ")}`
        )
      );
    }
  };
}

function createUploader(allowedTypes: string[], maxSizeMB?: number) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: (maxSizeMB ?? config.MAX_FILE_SIZE_MB) * 1024 * 1024 },
    fileFilter: createFileFilter(allowedTypes),
  });
}

const imageUploader = createUploader(IMAGE_MIME_TYPES);
const documentUploader = createUploader(DOCUMENT_MIME_TYPES, 20);
const videoUploader = createUploader(VIDEO_MIME_TYPES, 50);
const anyUploader = createUploader(ALL_MIME_TYPES);

export const singleImage = (field = "file") => imageUploader.single(field);
export const multipleImages = (field = "files", maxCount = 5) => imageUploader.array(field, maxCount);

export const singleDocument = (field = "file") => documentUploader.single(field);
export const multipleDocuments = (field = "files", maxCount = 5) => documentUploader.array(field, maxCount);

export const singleVideo = (field = "file") => videoUploader.single(field);

export const singleAny = (field = "file") => anyUploader.single(field);
export const multipleAny = (field = "files", maxCount = 5) => anyUploader.array(field, maxCount);

export const singleUpload = singleAny;
export const multipleUpload = multipleAny;
