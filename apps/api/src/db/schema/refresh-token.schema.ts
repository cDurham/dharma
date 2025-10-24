import { pgTable, varchar, timestamp, boolean, uuid, index } from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema";
import { user } from "./user.schema";

/**
 * RefreshToken table - for JWT refresh token management
 */
export const refreshToken = pgTable(
  "refresh_token",
  {
    ...baseColumns,
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => user.uuid, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isRevoked: boolean("is_revoked").notNull().default(false),
    hashedToken: varchar("hashed_token", { length: 255 }).notNull(),
  },
  (table) => ({
    tokenHashIdx: index("refresh_token_token_hash_idx").on(table.tokenHash),
  })
);

