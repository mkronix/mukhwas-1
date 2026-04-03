import { z } from "zod";

export const MovementsLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
  movement_type: z.string().optional(),
  item_type: z.enum(["finished_good", "raw_material"]).optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type MovementsLogQuery = z.infer<typeof MovementsLogQuerySchema>;
