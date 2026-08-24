import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema.js";
import { user } from "./user.schema.js";

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
    // Every row minted by the same rotation lineage shares this uuid. Replay
    // of an already-rotated token revokes the whole family, not just itself.
    family: uuid("family").notNull().defaultRandom(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isRevoked: boolean("is_revoked").notNull().default(false),
    hashedToken: varchar("hashed_token", { length: 255 }).notNull(),
  },
  (table) => ({
    tokenHashIdx: index("refresh_token_token_hash_idx").on(table.tokenHash),
    familyIdx: index("refresh_token_family_idx").on(table.family),
  }),
);
