import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserUpdatedEvent } from "../event/user-updated.event";
import { filterUndefined } from "../../EventStore/utils";

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedProjection implements IEventHandler<UserUpdatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserUpdatedEvent) {
    const set = filterUndefined({
      ...event.changes,
      updatedAt: new Date(),
    });

    if (Object.keys(set).length > 1) {
      await this.db
        .update(userReadModel)
        .set(set)
        .where(eq(userReadModel.uuid, event.userUuid));
    }
  }
}
