import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";

import { DB_TOKEN } from "../db/database.module";
import { db as DbType } from "../db/data-source";
import { eventStore, outbox } from "../db/schema";
import { DomainEvent, EventEnvelope, isValidAggregateType } from "./types";

@Injectable()
export class EventStoreService {
  constructor(@Inject(DB_TOKEN) private readonly db: typeof DbType) {}

  async appendEvent<T = any>(event: DomainEvent<T>): Promise<EventEnvelope<T>> {
    return await this.db.transaction(async (tx) => {
      // compute next version with optimistic locking
      const [v] = await tx
        .select({ maxVersion: sql<number>`max(${eventStore.version})` })
        .from(eventStore)
        .where(eq(eventStore.aggregateId, event.aggregateId));

      const nextVersion = (v?.maxVersion ?? 0) + 1;

      const [inserted] = await tx
        .insert(eventStore)
        .values({
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.payload as unknown as object,
          metadata: (event.metadata ?? {}) as any,
          version: nextVersion,
        })
        .returning();

      // add to outbox in the same transaction
      await tx.insert(outbox).values({
        aggregateId: inserted.aggregateId,
        eventType: inserted.eventType,
        payload: {
          aggregateId: inserted.aggregateId,
          aggregateType: inserted.aggregateType,
          eventType: inserted.eventType,
          payload: inserted.eventData,
          metadata: inserted.metadata ?? {},
          version: inserted.version,
          occurredAt: inserted.occurredAt,
        },
        status: "pending",
      });

      if (!isValidAggregateType(inserted.aggregateType)) {
        throw new Error(`Invalid aggregate type: ${inserted.aggregateType}`);
      }

      const envelope: EventEnvelope<T> = {
        id: inserted.id,
        aggregateId: inserted.aggregateId,
        aggregateType: inserted.aggregateType,
        eventType: inserted.eventType,
        payload: inserted.eventData as T,
        metadata: (inserted.metadata ?? {}) as Record<string, any>,
        version: inserted.version,
        occurredAt: inserted.occurredAt!,
      };

      return envelope;
    });
  }

  async getEvents(): Promise<EventEnvelope[]> {
    const rows = await this.db
      .select()
      .from(eventStore)
      .orderBy(desc(eventStore.occurredAt));
    return rows.map((r) => {
      if (!isValidAggregateType(r.aggregateType)) {
        throw new Error(`Invalid aggregate type: ${r.aggregateType}`);
      }
      return {
        id: r.id,
        aggregateId: r.aggregateId,
        aggregateType: r.aggregateType,
        eventType: r.eventType,
        payload: r.eventData as any,
        metadata: (r.metadata ?? {}) as Record<string, any>,
        version: r.version,
        occurredAt: r.occurredAt!,
      };
    });
  }

  async getEventsByAggregate(aggregateId: string): Promise<EventEnvelope[]> {
    const rows = await this.db
      .select()
      .from(eventStore)
      .where(eq(eventStore.aggregateId, aggregateId))
      .orderBy(eventStore.version);

    return rows.map((r) => {
      if (!isValidAggregateType(r.aggregateType)) {
        throw new Error(`Invalid aggregate type: ${r.aggregateType}`);
      }
      return {
        id: r.id,
        aggregateId: r.aggregateId,
        aggregateType: r.aggregateType,
        eventType: r.eventType,
        payload: r.eventData as any,
        metadata: (r.metadata ?? {}) as Record<string, any>,
        version: r.version,
        occurredAt: r.occurredAt!,
      };
    });
  }
}
