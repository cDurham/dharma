import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq, InferInsertModel } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { RetreatUpdatedEvent } from "../events/retreat-updated.event";
import { filterUndefined } from "../../EventStore/utils";

@EventsHandler(RetreatUpdatedEvent)
export class RetreatUpdatedProjection implements IEventHandler<RetreatUpdatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: RetreatUpdatedEvent) {
    const { retreatUuid, changes } = event;
    const filtered = filterUndefined(changes ?? {});
    if (Object.keys(filtered).length === 0) return;

    type RetreatUpdate = Partial<InferInsertModel<typeof retreat>>;
    const set: RetreatUpdate = { ...filtered, updatedAt: new Date() };

    await this.db
      .update(retreat)
      .set(set)
      .where(eq(retreat.uuid, retreatUuid));
  }
}

