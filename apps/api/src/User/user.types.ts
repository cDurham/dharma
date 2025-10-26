import { InferSelectModel } from "drizzle-orm";
import { userReadModel } from "../db/schema";

/**
 * User Read Model Row - inferred from database schema
 * This is the single source of truth for user data structure
 * Using InferSelectModel ensures nullable fields are typed as `| null` not `| undefined`
 */
export type UserReadModelRow = InferSelectModel<typeof userReadModel>;

/**
 * Fields that can be updated via generic update() method.
 * Excludes sensitive fields that require specific business operations:
 * - verificationToken: only via verifyEmail() or changeEmail()
 * - password: only via changePassword() (to enforce validation)
 * - email: only via changeEmail() (requires re-verification)
 */
export type UpdatableUserFields = Omit<
  UserReadModelRow,
  'uuid' | 'createdAt' | 'updatedAt' | 'verificationToken' | 'password' | 'email'
>;

/**
 * User Aggregate State
 * Extends read model with aggregate-specific fields like soft delete flag
 */
export type UserState = UserReadModelRow & {
  deleted?: boolean;
};

