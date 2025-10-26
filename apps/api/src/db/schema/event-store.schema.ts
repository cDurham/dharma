import { pgTable, uuid, varchar, integer, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";

/**
 * Event Store - append-only log of domain events
 */
export const eventStore = pgTable(
  "event_store",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aggregateId: uuid("aggregate_id").notNull(),
    aggregateType: varchar("aggregate_type", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    eventData: jsonb("event_data").notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
    version: integer("version").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_event_store_aggregate").on(table.aggregateId, table.aggregateType),
    unique("uq_event_store_aggregate_version").on(table.aggregateId, table.version),
    index("idx_event_store_event_type").on(table.eventType),
  ]
);
