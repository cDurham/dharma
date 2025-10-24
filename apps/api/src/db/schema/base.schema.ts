import { timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Base columns shared across all entities
 */
export const baseColumns = {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
