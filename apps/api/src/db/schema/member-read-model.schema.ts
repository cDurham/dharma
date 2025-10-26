import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

/**
 * Member Read Model - denormalized, optimized for queries
 * Mirrors the current `member` table shape for compatibility
 */
export const memberReadModel = pgTable(
  "member_read_model",
  {
    uuid: uuid("uuid").primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    joinDate: timestamp("join_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    userUuid: uuid("user_uuid"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

