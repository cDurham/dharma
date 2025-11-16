import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { user } from "../db/schema";

/**
 * Schema for authenticated user (without password)
 */
export const AuthenticatedUserSchema = createSelectSchema(user).omit({
  password: true,
});

/**
 * Schema for update operations - partial, auto-managed fields excluded
 */
export const UpdateUserSchema = createInsertSchema(user)
  .pick({ email: true, password: true })
  .partial();

/**
 * Type exports
 */
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
