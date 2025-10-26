import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { memberReadModel } from "../../db/schema";
import { MemberCreatedEvent } from "../events/member-created.event";

@EventsHandler(MemberCreatedEvent)
export class MemberCreatedProjection implements IEventHandler<MemberCreatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: MemberCreatedEvent) {
    await this.db.insert(memberReadModel).values({
      uuid: event.memberUuid,
      firstName: event.firstName,
      lastName: event.lastName,
      joinDate: event.joinDate,
      userUuid: null,
    });
  }
}

