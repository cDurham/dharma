import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { RetreatCreatedEvent } from "../events/retreat-created.event";

@EventsHandler(RetreatCreatedEvent)
export class RetreatCreatedProjection implements IEventHandler<RetreatCreatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: RetreatCreatedEvent) {
    await this.db.insert(retreat).values({
      uuid: event.retreatUuid,
      name: event.name,
      startAt: event.startAt,
      endAt: event.endAt,
    });
  }
}

