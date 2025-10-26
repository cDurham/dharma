import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { RetreatDeletedEvent } from "../events/retreat-deleted.event";

@EventsHandler(RetreatDeletedEvent)
export class RetreatDeletedProjection implements IEventHandler<RetreatDeletedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: RetreatDeletedEvent) {
    await this.db.delete(retreat).where(eq(retreat.uuid, event.retreatUuid));
  }
}

