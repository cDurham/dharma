import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { retreat } from "../db/schema/index.js";

export const UpdateRetreatSchema = createInsertSchema(retreat)
  .pick({ name: true, startAt: true, endAt: true })
  .partial();

export type UpdateRetreatData = z.infer<typeof UpdateRetreatSchema>;
