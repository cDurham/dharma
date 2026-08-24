import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { member } from "../db/schema/index.js";

// joinDate is optional here; the column's default supplies it when omitted.
export const CreateMemberSchema = createInsertSchema(member).pick({
  firstName: true,
  lastName: true,
  joinDate: true,
});

export const UpdateMemberSchema = createUpdateSchema(member).pick({
  firstName: true,
  lastName: true,
  joinDate: true,
});
