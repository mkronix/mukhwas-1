import path from "path";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { config } from "../env";
import { schemas } from "./components/schemas";
import { parameters } from "./components/parameters";

/** Interactive OpenAPI UI (try-it-out). */
export const SWAGGER_UI_PATH = "/api-docs";

const apiServerUrl = `${config.resolvedPublicBaseUrl}${config.API_PREFIX}`;

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Mukhwas Commerce OS API",
    version: "1.0.0",
    description: "Backend API for Mukhwas Commerce OS — Storefront, Admin, and POS surfaces.",
  },
  servers: [
    {
      url: apiServerUrl,
      description: config.NODE_ENV === "production" ? "Production" : "Current server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas,
    parameters,
  },
};

const swaggerExtension = __filename.endsWith(".js") ? "js" : "ts";
/** Forward slashes for glob matching on Windows. */
const swaggerApisGlob = path
  .join(__dirname, "..", "..", "domains", "**", `*.swagger.${swaggerExtension}`)
  .replace(/\\/g, "/");

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: [swaggerApisGlob],
});

function asHandlers(m: typeof swaggerUi.serve): import("express").RequestHandler[] {
  return Array.isArray(m) ? m : [m];
}

export function setupSwagger(app: Express): void {
  const serveHandlers = asHandlers(swaggerUi.serve);

  app.use(
    SWAGGER_UI_PATH,
    ...serveHandlers,
    swaggerUi.setup(specs, {
      customSiteTitle: "Mukhwas Commerce OS — API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
      },
    })
  );

  app.get("/api/docs", (_req, res) => {
    res.redirect(301, SWAGGER_UI_PATH);
  });
}
