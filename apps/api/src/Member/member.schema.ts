import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { member } from "../db/schema";

export const UpdateMemberSchema = createInsertSchema(member)
  .pick({ firstName: true, lastName: true, joinDate: true })
  .partial();

export type UpdateMemberData = z.infer<typeof UpdateMemberSchema>;
