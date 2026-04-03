import { Router } from "express";
import type { Request, Response } from "express";
import { checkDatabaseConnection } from "../../database/knex";
import { config } from "../../config/env";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (_req: Request, res: Response) => {
  try {
    await checkDatabaseConnection();
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

export default router;
