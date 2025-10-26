import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { memberReadModel } from "../../db/schema";
import { MemberDeletedEvent } from "../events/member-deleted.event";

@EventsHandler(MemberDeletedEvent)
export class MemberDeletedProjection implements IEventHandler<MemberDeletedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: MemberDeletedEvent) {
    await this.db.delete(memberReadModel).where(eq(memberReadModel.uuid, event.memberUuid));
  }
}

