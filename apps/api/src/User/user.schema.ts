import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import { user } from "../db/schema/index.js";

/**
 * Schema for authenticated user (without password)
 */
export const AuthenticatedUserSchema = createSelectSchema(user).omit({
  password: true,
});

/**
 * Insert shape. `password` holds the hash and `verificationToken` the value
 * UserService mints; neither arrives from a GraphQL input.
 */
export const CreateUserSchema = createInsertSchema(user).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  verificationToken: true,
});

/**
 * Schema for update operations - partial, auto-managed fields excluded.
 * Covers every field UpdateUserInput accepts; a field missing here is dropped
 * by the parse.
 */
export const UpdateUserSchema = createUpdateSchema(user).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
});

/**
 * Type exports
 */
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
