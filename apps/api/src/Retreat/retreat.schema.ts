import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { retreat } from "../db/schema/index.js";

export const CreateRetreatSchema = createInsertSchema(retreat).pick({
  name: true,
  startAt: true,
  endAt: true,
});

export const UpdateRetreatSchema = createUpdateSchema(retreat).pick({
  name: true,
  startAt: true,
  endAt: true,
});
