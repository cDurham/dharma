import { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Inferred types from Drizzle schemas
 * These match the database row structure exactly
 */
export type UserRow = InferSelectModel<typeof schema.user>;
export type MemberRow = InferSelectModel<typeof schema.member>;
export type RetreatRow = InferSelectModel<typeof schema.retreat>;
export type RefreshTokenRow = InferSelectModel<typeof schema.refreshToken>;

