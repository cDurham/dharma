import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema.js";

/**
 * Retreat table
 */
export const retreat = pgTable("retreat", {
  ...baseColumns,
  name: varchar("name", { length: 255 }).notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
});
