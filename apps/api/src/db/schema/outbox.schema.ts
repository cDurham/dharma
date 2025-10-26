import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Outbox - reliable event publishing to external systems (e.g., Kafka)
 */
export const outbox = pgTable(
  "outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aggregateId: uuid("aggregate_id").notNull(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_outbox_status_created").on(table.status, table.createdAt),
  ]
);
