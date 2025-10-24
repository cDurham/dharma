import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema";

/**
 * Retreat table
 */
export const retreat = pgTable("retreat", {
  ...baseColumns,
  name: varchar("name", { length: 255 }).notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
});

