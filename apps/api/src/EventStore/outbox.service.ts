import { Inject, Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DB_TOKEN } from "../db/database.module";
import { db as DbType } from "../db/data-source";
import { outbox } from "../db/schema";
import { OutboxRecord } from "./types";

@Injectable()
export class OutboxService {
  constructor(@Inject(DB_TOKEN) private readonly db: typeof DbType) {}

  async addToOutbox(payload: {
    aggregateId: string;
    eventType: string;
    payload: any;
  }): Promise<void> {
    await this.db.insert(outbox).values({
      aggregateId: payload.aggregateId,
      eventType: payload.eventType,
      payload: payload.payload,
      status: "pending",
    });
  }

  async getPendingEvents(limit = 100): Promise<OutboxRecord[]> {
    const rows = await this.db
      .select()
      .from(outbox)
      .where(eq(outbox.status, "pending"))
      .orderBy(asc(outbox.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      aggregateId: r.aggregateId,
      eventType: r.eventType,
      payload: r.payload as any,
      status: r.status as any,
      createdAt: r.createdAt!,
      processedAt: r.processedAt ?? null,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.db
      .update(outbox)
      .set({ status: "processed", processedAt: new Date() })
      .where(eq(outbox.id, id));
  }
}

