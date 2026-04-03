import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import { requestLogger } from "./middleware/logger";
import { apiRateLimit } from "./middleware/rateLimiter";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

import { storefrontAuthRouter, adminAuthRouter, posAuthRouter, refreshRouter } from "./domains/auth/auth.routes";
import { adminUploadRouter, storefrontUploadRouter } from "./domains/upload/upload.routes";
import unitRoutes from "./domains/units/units.routes";
import categoryRoutes from "./domains/categories/categories.routes";
import rawMaterialRoutes from "./domains/raw-materials/raw-materials.routes";
import {
  adminCustomerRouter,
  storefrontCustomerRouter,
  posCustomerRouter,
} from "./domains/customers/customers.routes";
import supplierRoutes from "./domains/suppliers/suppliers.routes";
import {
  adminProductRouter,
  storefrontProductRouter,
  posProductRouter,
} from "./domains/products/products.routes";
import inventoryFinishedRoutes from "./domains/inventory-finished/inventory-finished.routes";
import inventoryRawRoutes from "./domains/inventory-raw/inventory-raw.routes";
import inventoryMovementsRoutes from "./domains/inventory-movements/inventory-movements.routes";
import {
  adminProductionOrderRouter,
  posProductionOrderRouter,
} from "./domains/production-orders/production-orders.routes";
import {
  adminPurchaseOrderRouter,
  posPurchaseOrderRouter,
} from "./domains/purchase-orders/purchase-orders.routes";
import { adminPurchaseBillRouter } from "./domains/purchase-bills/purchase-bills.routes";
import {
  adminPurchaseReturnRouter,
  posPurchaseReturnRouter,
} from "./domains/purchase-returns/purchase-returns.routes";
import healthRoutes from "./domains/health/health.routes";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(requestLogger);

app.use(helmet(config.enableSwagger ? { contentSecurityPolicy: false } : {}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || config.ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(apiRateLimit);

if (config.enableSwagger) {
  setupSwagger(app);
}

app.get("/favicon.ico", (_, res) => res.status(204).end());

app.use(`${config.API_PREFIX}/auth/storefront`, storefrontAuthRouter);
app.use(`${config.API_PREFIX}/auth/admin`, adminAuthRouter);
app.use(`${config.API_PREFIX}/auth/pos`, posAuthRouter);
app.use(`${config.API_PREFIX}/auth/refresh`, refreshRouter);

app.use(`${config.API_PREFIX}/admin/upload`, adminUploadRouter);
app.use(`${config.API_PREFIX}/storefront/upload`, storefrontUploadRouter);

app.use(`${config.API_PREFIX}/admin/units`, unitRoutes);
app.use(`${config.API_PREFIX}/admin/categories`, categoryRoutes);
app.use(`${config.API_PREFIX}/admin/raw-materials`, rawMaterialRoutes);
app.use(`${config.API_PREFIX}/admin/customers`, adminCustomerRouter);
app.use(`${config.API_PREFIX}/storefront/customers`, storefrontCustomerRouter);
app.use(`${config.API_PREFIX}/pos/customers`, posCustomerRouter);

app.use(`${config.API_PREFIX}/admin/suppliers`, supplierRoutes);
app.use(`${config.API_PREFIX}/admin/products`, adminProductRouter);
app.use(`${config.API_PREFIX}/storefront/products`, storefrontProductRouter);
app.use(`${config.API_PREFIX}/pos/products`, posProductRouter);

app.use(`${config.API_PREFIX}/admin/inventory`, inventoryFinishedRoutes);
app.use(`${config.API_PREFIX}/admin/inventory`, inventoryRawRoutes);
app.use(`${config.API_PREFIX}/admin/inventory`, inventoryMovementsRoutes);

app.use(`${config.API_PREFIX}/admin/production`, adminProductionOrderRouter);
app.use(`${config.API_PREFIX}/admin/purchases`, adminPurchaseOrderRouter);
app.use(`${config.API_PREFIX}/admin/purchases`, adminPurchaseBillRouter);
app.use(`${config.API_PREFIX}/admin/purchases`, adminPurchaseReturnRouter);

app.use(`${config.API_PREFIX}/pos/production`, posProductionOrderRouter);
app.use(`${config.API_PREFIX}/pos/purchases`, posPurchaseOrderRouter);
app.use(`${config.API_PREFIX}/pos/purchases`, posPurchaseReturnRouter);

app.use("/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
