import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema.js";
import { user } from "./user.schema.js";

/**
 * Member table - extends Person with join date and optional user reference
 */
export const member = pgTable("member", {
  ...baseColumns,
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  joinDate: timestamp("join_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userUuid: uuid("user_uuid").references(() => user.uuid),
});
