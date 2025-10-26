import { pgTable, varchar, unique, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * User Read Model - denormalized, optimized for queries
 * Mirrors the current `user` table shape for compatibility
 */
export const userReadModel = pgTable(
  "user_read_model",
  {
    uuid: uuid("uuid").primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    verificationToken: varchar("verification_token", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.email)]
);
