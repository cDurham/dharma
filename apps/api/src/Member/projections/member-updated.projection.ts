import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq, InferInsertModel } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { memberReadModel } from "../../db/schema";
import { MemberUpdatedEvent } from "../events/member-updated.event";
import { filterUndefined } from "../../EventStore/utils";

@EventsHandler(MemberUpdatedEvent)
export class MemberUpdatedProjection implements IEventHandler<MemberUpdatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: MemberUpdatedEvent) {
    const { memberUuid, changes } = event;
    const filtered = filterUndefined(changes ?? {});
    if (Object.keys(filtered).length === 0) return;

    type MemberUpdate = Partial<InferInsertModel<typeof memberReadModel>>;
    const set: MemberUpdate = { ...filtered, updatedAt: new Date() };

    await this.db
      .update(memberReadModel)
      .set(set)
      .where(eq(memberReadModel.uuid, memberUuid));
  }
}
