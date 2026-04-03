import { Router } from "express";
import { authenticateStaffResource, authenticateStorefront } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { UploadController } from "./upload.controller";
import { UploadQuerySchema, DeleteUploadSchema } from "./upload.schema";
import {
  singleImage,
  multipleImages,
  singleDocument,
  singleVideo,
  singleAny,
  multipleAny,
} from "./upload.middleware";

export const adminUploadRouter = Router();

adminUploadRouter.use(authenticateStaffResource);

adminUploadRouter.post(
  "/image",
  singleImage("file"),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadSingleImage
);

adminUploadRouter.post(
  "/images",
  multipleImages("files", 10),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadMultiple
);

adminUploadRouter.post(
  "/document",
  singleDocument("file"),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadSingleDocument
);

adminUploadRouter.post(
  "/video",
  singleVideo("file"),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadSingleVideo
);

adminUploadRouter.post(
  "/any",
  singleAny("file"),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadSingle
);

adminUploadRouter.post(
  "/bulk",
  multipleAny("files", 10),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadMultiple
);

adminUploadRouter.delete(
  "/",
  validate(DeleteUploadSchema, "body"),
  UploadController.deleteFile
);

export const storefrontUploadRouter = Router();

storefrontUploadRouter.use(authenticateStorefront);

storefrontUploadRouter.post(
  "/image",
  singleImage("file"),
  validate(UploadQuerySchema, "query"),
  UploadController.uploadSingleImage
);

export default adminUploadRouter;
